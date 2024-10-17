const db = require('../db/connection');

exports.selectAllTopics = () => {
    return db.query('SELECT * FROM topics;')
        .then((result) => {
            return result.rows;
        })
}

exports.fetchArticleById = (id) => {
    return db.query(`SELECT articles.*, CAST(COUNT(comments.comment_id) AS INT) AS comment_count FROM articles 
        LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 
        GROUP BY articles.article_id;`, [id])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: "Not found"});
        }
        return rows[0];
    })
}

exports.fetchArticles = (sort_by = 'created_at', order = 'DESC', topic) => {
    const validSortBy = ['article_id', 'title', 'topic', 'author', 'created_at', 'votes', 'article_img_url', 'comment_count'];

    if (!validSortBy.includes(sort_by.toLowerCase())) {
        return Promise.reject({ status: 400, msg: 'Invalid sort_by' });
    }

    if (order.toUpperCase() !== 'DESC' && order.toUpperCase() !== 'ASC') {
        return Promise.reject({ status: 400, msg: 'Invalid order' });
    }

    let queryStr = `SELECT articles.article_id, articles.title, articles.topic, articles.author, 
        articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count
        FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id`;
    
    const queryVals = [];

    if (topic) {
        queryStr += ` WHERE articles.topic = $1`;
        queryVals.push(topic);
    }

    queryStr += `
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order};
    `;

    return db.query(queryStr, queryVals)
        .then(({ rows }) => {
            if (rows.length === 0) {
                return Promise.reject({ status: 404, msg: 'No articles found' });
            }
            return rows;
        });
}

exports.fetchCommentsById = (id) => {
    return db.query('SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;', [id])
    .then(({ rows }) => {
        return rows;
    })
}

exports.insertComment = (article_id, username, body) => {
    return db.query(`INSERT INTO comments (body, votes, author, article_id, created_at)
        VALUES ($1, 0, $2, $3, NOW()) RETURNING *;`, [body, username, article_id])
    .then(({ rows }) => {
        return rows[0];
    })
}

exports.updateArticleVotes = (article_id, inc_votes) => {
    return db.query(`UPDATE articles SET votes = (votes + $2) 
        WHERE article_id = $1 RETURNING *;`, [article_id, inc_votes])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Not found'})
        }
        return rows[0];
    })
}

exports.removeComment = (comment_id) => {
    return db.query(`DELETE FROM comments WHERE comment_id = $1;`, [comment_id])
    .then((result) => {
        if (result.rowCount === 0) {
            return Promise.reject({ status: 404, msg: 'Not found'})
        }
    })
}

exports.fetchUsers = () => {
    return db.query(`SELECT * FROM users;`)
    .then(({ rows }) => {
        return rows;
    })
}

exports.fetchUserByUsername = (username) => {
    return db.query(`SELECT * FROM users 
        WHERE username = $1;`, [username])
    .then(({rows}) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'User Not Found'})
        }
        return rows[0];
    })
}

exports.updateCommentVotes = (comment_id, inc_votes) => {
    return db.query(`UPDATE comments SET votes = (votes + $2) 
        WHERE comment_id = $1 RETURNING *;`, [comment_id, inc_votes])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'Not found'})
        }
        return rows[0];
    })
}

exports.insertArticle = (author, title, body, topic, article_img_url = null) => {
    let queryStr = `INSERT INTO articles `;
    let queryVals = [author, title, body, topic];

    if (article_img_url) {
        queryStr += `
            (author, title, body, topic, article_img_url, votes, created_at) VALUES ($1, $2, $3, $4, $5, 0, NOW()) RETURNING *;`
        queryVals.push(article_img_url);
    } else {
        queryStr += `(author, title, body, topic, votes, created_at) VALUES ($1, $2, $3, $4, 0, NOW()) RETURNING *;`
    }

    return db.query(queryStr, queryVals)
    .then(({ rows }) => {
        const article = rows[0];
        article.comment_count = 0; 
        return article;
    });
};


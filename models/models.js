const db = require('../db/connection');

exports.selectAllTopics = () => {
    return db.query('SELECT * FROM topics;')
        .then((result) => {
            return result.rows;
        })
}

exports.fetchArticleById = (id) => {
    return db.query('SELECT * FROM articles WHERE article_id = $1;', [id])
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({status: 404, msg: "Not found"})
        }
        return rows[0]
    })
}

exports.fetchArticles = (sort_by = 'created_at', order = 'DESC', topic) => {
    const validSortBy = ['article_id', 'title', 'topic', 'author', 'body', 'created_at', 'votes', 'article_img_url', 'comment_count']

    if (!validSortBy.includes(sort_by.toLowerCase())) {
        return Promise.reject({ status: 400, msg: 'Bad request'})
    }

    if (order.toUpperCase() !== 'DESC' && order.toUpperCase() !== 'ASC') {
        return Promise.reject({ status: 400, msg: 'Bad request'})
    }

    let queryStr = `SELECT * FROM (
            SELECT article_id, title, topic, author, created_at, votes, article_img_url,
            CAST((SELECT COUNT(*) FROM comments WHERE comments.article_id = articles.article_id) AS INT) AS comment_count
            FROM articles
        ) AS articles_with_count`

    const queryVals = [];

    if (topic) {
        queryStr += ` WHERE topic = $1`
        queryVals.push(topic);
    }

    queryStr += ` ORDER BY ${sort_by} ${order};`;

    return db.query(queryStr, queryVals)
    .then(({ rows }) => { 
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: 'No articles found' });
        }
        return rows;
    })
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
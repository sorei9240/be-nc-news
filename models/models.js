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

exports.fetchArticles = () => {
    return db.query(`SELECT article_id, title, topic, author, created_at, votes, article_img_url,
        CAST((SELECT COUNT(*) FROM comments WHERE comments.article_id = articles.article_id) AS INT) AS comment_count
        FROM articles ORDER BY created_at DESC;`)
    .then((result) => {
        return result.rows;
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
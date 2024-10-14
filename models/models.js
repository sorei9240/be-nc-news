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
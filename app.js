const express = require('express');
const { getTopics, getEndpoints, getArticleById, getArticles, getCommentsById } = require('./controllers/controllers.js')

const app = express();

app.use(express.json());

app.get('/api/topics', getTopics);

app.get('/api', getEndpoints);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id/comments', getCommentsById)

app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg })
    }
    next(err);
})
app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Server error'})
})

module.exports = app;
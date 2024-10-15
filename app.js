const express = require('express');
const { getTopics, getEndpoints, getArticleById, getArticles, getCommentsById, postComment, patchArticleVotes } = require('./controllers/controllers.js')

const app = express();

app.use(express.json());

app.get('/api/topics', getTopics);

app.get('/api', getEndpoints);

app.get('/api/articles/:article_id', getArticleById);

app.get('/api/articles', getArticles);

app.get('/api/articles/:article_id/comments', getCommentsById)

app.post('/api/articles/:article_id/comments', postComment)

app.patch('/api/articles/:article_id', patchArticleVotes)

app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg })
    }
    next(err);
})
app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Server error'})
    console.log(err)
})

module.exports = app;
const { selectAllTopics, fetchArticleById, fetchArticles, fetchCommentsById } = require('../models/models')
const endpoints = require('../endpoints.json')

exports.getTopics = (req, res, next) => {
    return selectAllTopics()
    .then((topics) => {
        res.status(200).send({ topics });
    })
    .catch(next);
}

exports.getEndpoints = (req, res) => {
    res.status(200).send({ endpoints: endpoints})
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;

    if (isNaN(Number(article_id))) {
        return Promise.reject({ status: 400, msg: 'Invalid Id' })
        .catch((err) => {
            next(err);
        });
    }

    return fetchArticleById(article_id).then((article) => {
        res.status(200).send({article: article})
    }).catch((err) => {
        next(err);
    })
}

exports.getArticles = (req, res, next) => {
    return fetchArticles()
    .then((articles) => {
        res.status(200).send({ articles })
    }).catch((err) => {
        next(err);
    })
}

exports.getCommentsById = (req, res, next) => {
    const { article_id } = req.params;
    
    const promises = [fetchArticleById(article_id), fetchCommentsById(article_id)]
    return Promise.all(promises)
    .then(([article, comments]) => {
        res.status(200).send({ comments })
    }).catch((err) => {
        next(err);
    })
}
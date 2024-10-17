const { selectAllTopics, fetchArticleById, fetchArticles, fetchCommentsById, insertComment, updateArticleVotes, removeComment, fetchUsers, fetchUserByUsername, updateCommentVotes } = require('../models/models')
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

    return fetchArticleById(article_id).then((article) => {
        res.status(200).send({article: article})
    }).catch((err) => {
        next(err);
    })
}

exports.getArticles = (req, res, next) => {
    const { sort_by, order, topic } = req.query;
    return fetchArticles(sort_by, order, topic)
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

exports.postComment = (req, res, next) => {
    const { article_id } = req.params;
    const { username, body } = req.body;

    if (!username || !body) {
        return res.status(400).send({ msg: 'Missing username or body'})
    }

    const promises = [fetchArticleById(article_id), insertComment(article_id, username, body)]

    return Promise.all(promises)
        .then(([article, comment]) => {
            res.status(201).send({ comment });
        }).catch((err) => {
            if (err.code === '23503') {
                return res.status(404).send({ msg: 'Invalid username'})
            }
            next(err);
        })
}

exports.patchArticleVotes = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    if (typeof inc_votes !== 'number' || !inc_votes) {
        return res.status(400).send({ msg: 'Invalid inc_votes' });
    }

    updateArticleVotes(article_id, inc_votes)
    .then((article) => {
        res.status(200).send({ article });
    })
    .catch((err) => {
        next(err);
    });
}

exports.deleteComment = (req, res, next) => {
    const { comment_id } = req.params;

    removeComment(comment_id)
    .then(() => {
        res.status(204).send();
    })
    .catch((err) => {
        next(err);
    });
}

exports.getUsers = (req, res, next) => {
    fetchUsers()
    .then((users) => {
        res.status(200).send({ users })
    }).catch((err) => {
        next(err);
    })
}

exports.getUserByUsername = (req, res, next) => {
    const { username } = req.params;

    fetchUserByUsername(username)
    .then((user) => {
        res.status(200).send({ user })
    }).catch((err) => {
        next(err);
    })
}

exports.patchCommentVotes = (req, res, next) => {
    const { comment_id } = req.params;
    const { inc_votes } = req.body;

    if (typeof inc_votes !== 'number' || !inc_votes) {
        return res.status(400).send({ msg: 'Invalid inc_votes' });
    }

    updateCommentVotes(comment_id, inc_votes)
    .then((comment) => {
        res.status(200).send({ comment });
    })
    .catch((err) => {
        next(err);
    });
}


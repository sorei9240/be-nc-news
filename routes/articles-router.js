const articlesRouter = require('express').Router();
const { getArticles, getArticleById, patchArticleVotes, postComment, getCommentsById } = require('../controllers/controllers.js');

articlesRouter.route('/').get(getArticles);

articlesRouter.route('/:article_id')
    .get(getArticleById)
    .patch(patchArticleVotes);

articlesRouter.route('/:article_id/comments')
    .get(getCommentsById)
    .post(postComment);

module.exports = articlesRouter;

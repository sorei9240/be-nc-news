const commentsRouter = require('express').Router();
const { deleteComment } = require('../controllers/controllers');

commentsRouter.delete('/:comment_id', deleteComment);

module.exports = commentsRouter;

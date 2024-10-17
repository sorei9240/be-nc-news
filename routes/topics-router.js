const topicsRouter = require('express').Router();
const { getTopics } = require('../controllers/controllers.js')

topicsRouter.get('/', getTopics);

module.exports = topicsRouter;
const express = require('express');
const { getEndpoints } = require('../controllers/controllers.js');

const endpointsRouter = express.Router();

endpointsRouter.get('/', getEndpoints);

module.exports = endpointsRouter;
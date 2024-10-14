const express = require('express');
const { getTopics, getEndpoints } = require('./controllers/controllers.js')

const app = express();

app.use(express.json());

app.get('/api/topics', getTopics);

app.get('/api', getEndpoints);

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Server error'})
})

module.exports = app;
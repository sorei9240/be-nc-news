const express = require('express');
const apiRouter = require("./routes/api-router");
const app = express();

app.use(express.json());
app.use("/api", apiRouter);

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        return res.status(400).send({ msg: 'Invalid Request' });
    }
    if (err.status) {
        return res.status(err.status).send({ msg: err.msg })
    }
    next(err);
})
app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Server error'})
    console.log(err)
})

module.exports = app;
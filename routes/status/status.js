const express = require('express');
const app = express();

app.put("/:id", function (req, res) {
    let status = {
        version: "0.6",
        env: "TEST"
    }
    res.status(200).json(status);
});

module.exports = app;
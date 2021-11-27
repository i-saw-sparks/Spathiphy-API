const express = require('express');
const app = express();
const COLLECTION_NAME = "Historial"

const mongobd = require("mongodb");
var ObjectID = mongobd.ObjectID;

app.get("/:id", function (req, res) {
    const database = req.app.get("db");
    database.collection(COLLECTION_NAME).findOne({ planta_id: new ObjectID(req.params.id)}, function (error, data) {
        if (error) {
            req.app.get("errManager")(res, err.message, "Failed to get historico.");
        } else {
            res.status(200).json(data);
        }
    })
});

module.exports = app;
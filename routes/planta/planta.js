const { ObjectID } = require('bson');
const express = require('express');
const app = express();

const COLLECTION_NAME = "Planta"

app.post("/", function (req, res) {
    var planta = req.body;
    const database = req.app.get("db");

    if (!planta.id_micro) {
        res.status(400).send({ message: "Datos invalidos, \"id_micro\" es necesario" });
        return;
    }
    if (!planta.id_usuario) {
        res.status(400).send({ message: "Datos invalidos, \"id_usuario\" es necesario" });
        return;
    }

    database.collection("Usuario").findOne({ _id: new ObjectID(planta.id_usuario) }, function (error, data) {
        if (data) {
            planta.fecha_reg = new Date();
            database.collection(COLLECTION_NAME).insertOne(planta, function (err, doc) {
                if (err) {
                    req.app.get("errManager")(res, err.message, "Failed to create new planta.");
                } else {
                    res.status(201).json(doc);
                }
            });
        } else {
            res.status(400).json({ msg: "No existe un usuario con la id: " + planta.id_usuario });
            return;
        }
    })
})

app.get("/:id", (req, res) => {
    const database = req.app.get("db");
    database.collection(COLLECTION_NAME).findOne({ id_micro: req.body.id_micro }, function (error, data) {
        if (error) {
            req.app.get("errManager")(res, err.message, "Failed to get planta.");
        } else {
            res.status(200).json(data);
        }
    })
})

app.get("/:id/config", (req, res) => {
    const database = req.app.get("db");
    database.collection(COLLECTION_NAME).findOne({ id_micro: req.body.id_micro }, function (error, data) {
        if (error) {
            req.app.get("errManager")(res, err.message, "Failed to get planta.");
        } else {
            config = {
                max_temp: data.max_temp,
                min_temp: data.min_temp,
                max_hum: data.max_hum,
                min_hum: data.min_hum
            }
            res.status(200).json(config);
        }
    })
})

app.put("/:id", function (req, res) {
    let status = {
        version: "0.1",
        env: "TEST"
    }
    console.log(req.body);
    res.status(200).json(status);
});

module.exports = app;
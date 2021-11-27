const { ObjectID } = require('bson');
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const { JWT_KEY } = require("../../keys/keys");

const COLLECTION_NAME = "Planta"

app.post("/", jwt({ secret: JWT_KEY, algorithms: ['HS256'] }), function (req, res) {
    var planta = req.body;
    const database = req.app.get("db");

    if (!planta.id_micro) {
        res.status(400).send({ message: "Datos invalidos, \"id_micro\" es necesario" });
        return;
    }

    planta.id_usuario = req.user.id;

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

app.get("/mine", jwt({ secret: JWT_KEY, algorithms: ['HS256'] }), (req, res) => {
    req.app.get("db").collection(COLLECTION_NAME).find({ id_usuario: req.user.id }).toArray((error, data) => {
        if (error) {
            req.app.get("errManager")(res, error.message, "Failed to get my plants.");
        } else {
            res.status(200).json(data);
        }
    })
});

app.get("/:id", (req, res) => {
    const database = req.app.get("db");
    database.collection(COLLECTION_NAME).findOne({ id_micro: req.params.id }, function (error, data) {
        if (error) {
            req.app.get("errManager")(res, err.message, "Failed to get planta.");
        } else {
            res.status(200).json(data);
        }
    })
})

app.get("/:id/config", (req, res) => {
    const database = req.app.get("db");
    database.collection(COLLECTION_NAME).findOne({ id_micro: req.params.id }, function (error, data) {
        if (error) {
            req.app.get("errManager")(res, err.message, "Failed to get planta.");
        } else {
            if (data) {
                config = {
                    max_temp: data.max_temp,
                    min_temp: data.min_temp,
                    max_hum: data.max_hum,
                    min_hum: data.min_hum
                }
                res.status(200).json(config);
            } else {
                req.app.get("errManager")(res, err.message, "planta id:" + req.params.id);
            }
        }
    })
})

app.put("/settings/:id", (req, res)=>{
    const database = req.app.get("db");
    let dataSet ={
        min_hum:parseInt(req.body.min_hum),
        max_hum:parseInt(req.body.max_hum),
        max_temp:parseInt(req.body.max_temp),
        min_temp:parseInt(req.body.min_temp)
    }
    let newData = { $set: dataSet };
    console.log(req.body);
    database.collection(COLLECTION_NAME).updateOne({ id_micro: req.params.id }, newData, (error, result) => {
        if (error) {
            manageError(res, error.message, "Failed to update planta.");
            return;
        } else {
            res.status(200).send(result);
            return;
        }
    })
})

app.put("/:id", function (req, res) {
    const database = req.app.get("db");
    
    req.body.recTime = Date.now();

    record = {
        last_rec: req.body
    }

    let newData = { $set: record };
    console.log(req.body);
    database.collection(COLLECTION_NAME).updateOne({ id_micro: req.params.id }, newData, (error, result) => {
        if (error) {
            manageError(res, error.message, "Failed to update planta.");
            return;
        } else {
            res.status(200).send();
            return;
        }
    })
});

module.exports = app;
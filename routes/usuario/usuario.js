const express = require('express');
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require('express-jwt');
const { JWT_KEY } = require("../../keys/keys");

const mongobd = require("mongodb");
var ObjectID = mongobd.ObjectID;

const COLLECTION_NAME = "Usuario";

app.post("/", function (req, res) {
    var user = req.body;
    const database = req.app.get("db");

    if (!user.username) {
        res.status(400).send({ message: "Datos invalidos, \"username\" es necesario" });
        return;
    }
    if (!user.password) {
        res.status(400).send({ message: "Datos invalidos, \"password\" es necesario" });
        return;
    }

    database.collection(COLLECTION_NAME).findOne({ username: user.username }, (error, data) =>{
        if (data) {
            res.status(400).json({ msg: "Este usuario ya existe" });
            return;
        } else {
            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));

            database.collection(COLLECTION_NAME).insertOne(user,  (err, doc) => {
                if (err) {
                    req.app.get("errManager")(res, err.message, "Failed to create new user.");
                } else {
                    res.status(201).json(doc);
                }
            });
        }
    })
});

app.get("/", function (req, res) {
    const database = req.app.get("db");
    database.collection(COLLECTION_NAME).find({}).toArray((error, data) => {
        if (error) {
            req.app.get("errManager")(res, err.message, "Error getting users");
        } else {
            res.status(200).json(data);
        }
    })
});

app.get("/self", jwt({ secret: JWT_KEY, algorithms: ['HS256'] }), (req, res) => {
    req.app.get("db").collection(COLLECTION_NAME).findOne({ _id: new ObjectID(req.user.id) }, (error, data) => {
        if (error) {
            req.app.get("errManager")(res, error.message, "Failed to get users.");
        } else {
            res.status(200).json(data);
        }
    })
});

app.get("/:id", (req, res)=>{
    const database = req.app.get("db");
    database.collection(COLLECTION_NAME).findOne({username: req.params.id}, (error, data) => {
        if (error) {
            req.app.get("errManager")(res, err.message, "Error getting user");
        } else {
            res.status(200).json(data);
        }
    })
})




module.exports = app;
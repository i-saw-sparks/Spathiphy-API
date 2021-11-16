const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const { JWT_KEY } = require("../../keys/keys");

const  COLLECTION_NAME =  "Usuario";

app.post("/", function (req, res) {
    const database = req.app.get("db");
    var user = req.body;

    if (!user.username) {
        res.status(400).json({ msg: "Invalid input, username is mandatory" });
        return;
    }
    if (!user.password) {
        res.status(400).json({ msg: "Invalid input, password is mandatory" });
        return
    }

    database.collection(COLLECTION_NAME).findOne({ username: user.username }, (error, data) => {
        if (error) {
            req.app.get("errManager")(res, error.message, "Failed to get users.");
            return;
        } else {
            if (!data) {
                res.status(403).json({ msg: "User not found" });
                return;
            }
            bcrypt.compare(user.password, data.password, (err, result) => {
                if (err) {
                    req.app.get("errManager")(res, err.message, "Failed to auth user, internal error.");
                    return;
                }
                if (result) {
                    let token = jwt.sign({ username: data.username, id: data._id }, JWT_KEY);
                    res.status(200).json({ msg: "Auth completed", token: token });
                    return;
                } else {
                    res.status(403).json({ msg: "Auth failed" });
                    return;
                }
            })
        }
    })

});

module.exports = app;
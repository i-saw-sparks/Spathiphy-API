var express = require("express");
var bodyParser = require("body-parser");
var mongobd = require("mongodb");

var app = express();

var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

const LOCAL_DATABASE = "mongodb://localhost:27017/Spathiphy-db";
LOCAL_PORT = 3000;

var database;

let registerRoutes = () => {
    require('./status')(app, database, manageError);
}

let manageError = (res, reason, message, code) => {
    console.log("Error: " + reason);
    res.status(code || 500).json({ "error": message });
}

registerRoutes();

mongobd.MongoClient.connect(process.env.MONGODB_URI || LOCAL_DATABASE,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }, function (error, client) {
        if (error) {
            console.log(error);
            process.exit(1);
        }

        database = client.db();
        console.log("Database connection done.");

        registerRoutes();

        var server = app.listen(process.env.PORT || LOCAL_PORT, function () {
            var port = server.address().port;
            console.log("App now running on port ", port);
        });
    });



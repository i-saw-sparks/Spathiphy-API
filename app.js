var express = require("express");
const io = require('./sockets');
var bodyParser = require("body-parser");
var mongobd = require("mongodb");
var cors = require("cors");

var app = express();

var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors({}))


const LOCAL_DATABASE = "mongodb://localhost:27017/Spathiphy-db";
LOCAL_PORT = 3000;

var database;

let manageError = (res, reason, message, code) => {
    console.log("Error: " + reason);
    res.status(code || 500).json({ "error": message });
}



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

        app.set("errManager", manageError);
        app.set("db", database);
        require("./startup/mainRouter")(app);

        var server = app.listen(process.env.PORT || LOCAL_PORT, function () {
            var port = server.address().port;
            console.log("App now running on port ", port);
        });

        io.attach(server);

        var minutes = 5, the_interval = minutes * 60 * 1000;
        setInterval(updateHistorics, the_interval);


        function updateHistorics() {
            database.collection("Planta").find({}).toArray(function (error, data) {
                if (error) {
                    console.log(error)
                }
                data.forEach(planta => {
                    database.collection("Historial").findOne({ planta_id: planta._id }, function (error, data) {
                        if (error) {
                            console.log(error)
                            return;
                        }
                        if (data == null) {
                            let hist = {
                                planta_id: planta._id,
                                mediciones: []
                            }
                            database.collection("Historial").insertOne(hist, (err, doc) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                } else {
                                    console.log("Historial inicializado de: " + planta.id);
                                    console.log(doc);
                                }
                            })
                        } else {
                            if (data.mediciones.length > 288) {
                                for (let i = 0; i < data.records.length - 288; i++) {
                                    let toDelete = { $pop: { mediciones: -1 } };
                                    database.collection("Historial").updateOne({ planta_id: planta._id }, toDelete, function (error, result) {
                                        if (error) {
                                            console.log("Error in pop record");
                                        }
                                    })
                                }
                            }

                            newRecord = {};
                            if (planta.last_rec) {
                                newRecord = planta.last_rec
                            }

                            var toInsert = { $push: { mediciones: newRecord } };

                            database.collection("Historial").updateOne({ planta_id: planta._id }, toInsert, function (error, result) {
                                if (error) {
                                    console.log("Error in push record");
                                }
                            })
                        }
                    })
                });
            })
        }
    });



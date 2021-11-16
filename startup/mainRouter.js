module.exports = function (app) {
    var plantaRoute = require("../routes/planta/planta");
    var usuarioRoute = require("../routes/usuario/usuario");
    var historicoRoute = require("../routes/historico/historico");
    var statusRoute = require("../routes/status/status");
    var authRoute = require("../routes/auth/auth");
    
    app.use("/api/planta", plantaRoute);
    app.use("/api/usuario", usuarioRoute);
    app.use("/api/historico", historicoRoute);
    app.use("/api/status", statusRoute);
    app.use("/api/auth", authRoute);
  };
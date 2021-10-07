module.exports = function (app, database, manageError) {

    app.get("/api/status", function (req, res) {
        let status = {
            version: '0.1',
            env: 'TEST'
        }
        res.status(200).json(status);
    });

}
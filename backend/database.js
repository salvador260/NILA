const Datastore = require("@seald-io/nedb");

const db = new Datastore({
    filename: "./orders.db",
    autoload: true
});

module.exports = db;
const mongoose = require("mongoose");
require("dotenv").config();

const databaseURI = process.env.MongodbURL;

const connection = mongoose.connect(databaseURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

module.exports = connection;

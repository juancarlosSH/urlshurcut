const mongoose = require("mongoose");
require("dotenv").config();

const clientDB = mongoose
  .connect(process.env.URI) // connect to the database
  .then((m) => {
    console.log("Connected to MongoDB... 💾");
    return m.connection.getClient();
  })
  .catch((err) => console.error("Error connecting to MongoDB... 💩", err));

module.exports = clientDB;

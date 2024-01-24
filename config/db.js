require('dotenv').config();
const mongoose = require("mongoose");

function connectDb() {
    mongoose.connect(process.env.MONGO_CONNECTION_URL);
    const connection = mongoose.connection;
    connection.once('open', () => {
        console.log("Database connected");
    }).on("error", (err) => {
        console.log("Error occured ", err);
    })
}

module.exports = connectDb
const mongoose = require("mongoose");
const sending = require("../send");
const { exit } = require("process");

const db = "mongodb+srv://default:ponpon123456@cluster0.3f11s6u.mongodb.net/hwids?retryWrites=true&w=majority"

let send = new sending();

function connectDB() {
    mongoose
        .connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
        .then((r) => {
            console.log("Connected to base!");
            send.start();
        })
        .catch((err) => {
            console.error("Error!! " + err);
            throw new Error(err);
        });
}

module.exports.connection = {
    connectDB,
}

module.exports.send = send;
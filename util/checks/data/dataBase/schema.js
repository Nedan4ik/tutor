const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    hwid: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    chatId: {
        type: Number,
        required: true
    }
}, { timestamps: false, __v: false })

const send = mongoose.model("angelmine", schema);

module.exports = send;
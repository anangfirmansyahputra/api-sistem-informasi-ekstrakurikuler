const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        requred: true,
    },
    password: {
        type: String,
        requred: true,
    },
    phone: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        default: "admin",
    },
});

module.exports = mongoose.model("Admin", adminSchema);

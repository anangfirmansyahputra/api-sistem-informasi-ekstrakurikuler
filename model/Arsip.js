const mongoose = require("mongoose");

const arsipSchema = new mongoose.Schema({
    gallery: {
        type: String,
        default: null,
    },
    prestasi: {
        type: String,
        default: null,
    },
});

module.exports = mongoose.model("Arsip", arsipSchema);

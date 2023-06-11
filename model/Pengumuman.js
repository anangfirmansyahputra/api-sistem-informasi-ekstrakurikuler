const mongoose = require("mongoose");

const pengumumanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    for: {
        type: String,
        default: "all",
    },
    timeEnd: {
        type: String,
        required: true,
    },
    timeStart: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Pengumuman", pengumumanSchema);

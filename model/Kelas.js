const mongoose = require("mongoose");

const kelasSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Kelas", kelasSchema);

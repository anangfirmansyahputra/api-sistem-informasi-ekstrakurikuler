const mongoose = require("mongoose");

const nilaiSchema = new mongoose.Schema({
    siswa: {
        type: mongoose.Types.ObjectId,
        ref: "Siswa",
    },
    ekstrakurikuler: {
        type: mongoose.Types.ObjectId,
        ref: "Ekstrakurikuler",
    },
    nilai: {
        type: Number,
        default: 0,
    },
    absensi: {
        type: Number,
        default: 0,
    },
    kehadiran: {
        type: Array,
        default: [],
    },
});

module.exports = mongoose.model("Nilai", nilaiSchema);

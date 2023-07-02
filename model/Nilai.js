const mongoose = require("mongoose");

const nilaiSchema = new mongoose.Schema({
    nis: {
        type: String,
        required: true,
    },
    ekstrakurikulerPilihan: {
        ekstrakurikuler: {
            type: mongoose.Types.ObjectId,
            ref: "Ekstrakurikuler",
            default: null
        },
        nilai: {
            type: Number,
            default: 0,
        },
        absen: {
            type: Number,
            default: 0,
        },
        kehadiran: {
            type: Array,
            default: [false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        },
        ijin: {
            type: Array,
            default: [],
        },
    },
    ekstrakurikulerWajib: {
        ekstrakurikuler: {
            type: mongoose.Types.ObjectId,
            ref: "Ekstrakurikuler",
            default: null,
        },
        nilai: {
            type: Number,
            default: 0,
        },
        absen: {
            type: Number,
            default: 0,
        },
        kehadiran: {
            type: Array,
            default: [false, false, false, false, false, false, false, false, false, false, false, false, false, false]
        },
        ijin: {
            type: Array,
            default: [],
        },
    },
});

module.exports = mongoose.model("Nilai", nilaiSchema);

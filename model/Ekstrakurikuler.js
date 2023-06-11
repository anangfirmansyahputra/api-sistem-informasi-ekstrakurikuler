const mongoose = require("mongoose");
const Siswa = require("./Siswa");

const ekstrakurikulerSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
    },
    pendaftar: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Nilai",
        },
    ],
    lokasi: {
        type: String,
        required: true,
    },
    waktu: {
        type: String,
        required: true,
    },
    arsip: {
        type: Array,
        default: [],
    },
    wajib: {
        type: Boolean,
        default: false,
    },
    approve: {
        type: Boolean,
        default: false,
    },
    kehadiran: {
        type: Number,
        default: 14,
    },
    pengajar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pengajar",
        required: true,
    },
    note: {
        type: String,
    },
});

module.exports = mongoose.model("Ekstrakurikuler", ekstrakurikulerSchema);

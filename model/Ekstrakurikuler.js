const mongoose = require("mongoose");
const Siswa = require("./Siswa");

const ekstrakurikulerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    pendaftar: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Siswa",
        },
    ],
    lokasi: {
        type: String,
        required: true,
    },
    waktu: {
        type: Array,
        required: true,
    },
    hari: {
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
    pertemuan: {
        type: Number,
        default: 0,
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

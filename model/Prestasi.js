const mongoose = require("mongoose");

const prestasiSchema = new mongoose.Schema({
    siswa: {
        type: mongoose.Types.ObjectId,
        ref: "Siswa",
    },
    tgl: {
        type: String,
    },
    deskripsi: {
        type: String,
    },
    ekstrakurikuler: {
        type: mongoose.Types.ObjectId,
        ref: "Ekstrakurikuler",
    },
    kelas: {
        type: mongoose.Types.ObjectId,
        ref: "Kelas",
    },
    sertifikat: {
        type: String,
        default: null,
    },
    img: {
        type: String,
        default: null,
    },
});

module.exports = mongoose.model("Prestasi", prestasiSchema);

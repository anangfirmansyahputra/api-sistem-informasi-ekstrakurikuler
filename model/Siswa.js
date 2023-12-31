const mongoose = require("mongoose");
const Ekstrakulikuler = require("./Ekstrakurikuler");

const siswaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    nis: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    alamat: {
        type: String,
    },
    role: {
        type: String,
        default: "siswa",
    },
    tgl: {
        type: String,
    },
    kelas: {
        type: mongoose.Types.ObjectId,
        ref: "Kelas",
    },
    nilai: {
        type: mongoose.Types.ObjectId,
        ref: "Nilai",
    },
    noTlp: {
        type: String,
    },
    gender: {
        type: String
    },
    bop: {
        type: String
    },
    alredyWajib: {
        type: Boolean,
        default: false
    },
    alredyPilihan: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Siswa", siswaSchema);

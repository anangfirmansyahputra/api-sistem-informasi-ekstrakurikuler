const mongoose = require("mongoose");
const Ekstrakurikuler = require("./Ekstrakurikuler");

const pengajarSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
    },
    nik: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    mengajar: {
        type: mongoose.Types.ObjectId,
        ref: "Matpel",
        default: null
    },
    ekstrakurikuler: [{ type: mongoose.Types.ObjectId, ref: "Ekstrakurikuler", default: [] }],
    alamat: {
        type: String,
        default: null,
    },
    tgl: {
        type: Date,
        default: null,
    },
    noTelp: {
        type: String,
        default: null,
    },
});

module.exports = mongoose.model("Pengajar", pengajarSchema);

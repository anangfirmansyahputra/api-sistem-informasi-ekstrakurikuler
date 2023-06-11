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
});

module.exports = mongoose.model("Prestasi", prestasiSchema);

const mongoose = require("mongoose");

// Definisi schema Galeri
const gallerySchema = new mongoose.Schema({
    idEkstrakurikuler: {
        type: Number,
        required: true,
    },
    tanggalUpload: {
        type: Date,
        default: Date.now,
    },
    photo: {
        type: String,
        required: true,
    },
    sertifikat: {
        idSiswa: {
            type: Number,
            required: true,
        },
        gambarSertifikat: {
            type: String,
            required: true,
        },
    },
});

module.exports = mongoose.model("Gallery", gallerySchema);

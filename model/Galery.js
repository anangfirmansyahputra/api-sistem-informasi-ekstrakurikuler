const mongoose = require("mongoose");

// Definisi schema Galeri
const gallerySchema = new mongoose.Schema({
    ekstrakurikuler: {
        type: mongoose.Types.ObjectId,
        ref: "Ekstrakurikuler",
    },
    tanggalUpload: {
        type: Date,
        default: Date.now,
    },
    linkGallery: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Gallery", gallerySchema);

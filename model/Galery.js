const mongoose = require("mongoose");

// Definisi schema Galeri
const gallerySchema = new mongoose.Schema({
    ekstrakurikuler: {
        type: mongoose.Types.ObjectId,
        ref: "Ekstrakurikuler",
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },
    // endDate: {
    //     type: String,
    //     required: true
    // },
    // for: {
    //     type: Array,
    //     // enum: ['siswa', 'pengajar'],
    // },
    linkGallery: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    // all: {
    //     type: Boolean,
    // }
});

module.exports = mongoose.model("Gallery", gallerySchema);

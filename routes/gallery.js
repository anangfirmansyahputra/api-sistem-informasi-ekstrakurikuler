const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const Gallery = require("../model/Galery");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

dotenv.config();

// Konfigurasi Cloudinary (ganti dengan konfigurasi Anda sendiri)
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});

// Menampilkan semua galeri
router.get("/", async (req, res) => {
    try {
        const galleries = await Gallery.find();
        res.json(galleries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Menampilkan galeri berdasarkan ID
router.get("/:id", getGallery, (req, res) => {
    res.json(res.gallery);
});

router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const file = req.file;

        // Mengunggah gambar ke Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path);

        fs.unlinkSync(file.path);

        res.json({
            success: true,
            data: uploadResult,
            message: "Gambar berhasil diunggah ke Cloudinary",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});

// Mengupdate galeri berdasarkan ID
router.patch("/:id", getGallery, async (req, res) => {
    if (req.body.idEkstrakurikuler != null) {
        res.gallery.idEkstrakurikuler = req.body.idEkstrakurikuler;
    }
    if (req.body.tanggalUpload != null) {
        res.gallery.tanggalUpload = req.body.tanggalUpload;
    }
    if (req.body.sertifikat != null) {
        res.gallery.sertifikat = req.body.sertifikat;
    }

    try {
        const updatedGallery = await res.gallery.save();
        res.json(updatedGallery);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Menghapus galeri berdasarkan ID
router.delete("/:id", getGallery, async (req, res) => {
    try {
        await res.gallery.remove();
        res.json({ message: "Galeri dihapus" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware untuk mendapatkan galeri berdasarkan ID
async function getGallery(req, res, next) {
    try {
        const gallery = await Gallery.findById(req.params.id);
        if (gallery == null) {
            return res.status(404).json({ message: "Galeri tidak ditemukan" });
        }
        res.gallery = gallery;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = router;

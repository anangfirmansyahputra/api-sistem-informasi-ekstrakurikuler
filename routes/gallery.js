const express = require("express");
const router = express.Router();
const Gallery = require("../model/Galery");

// Mendapatkan semua data galeri
router.get("/", async (req, res) => {
    try {
        const galleries = await Gallery.find({}).populate("ekstrakurikuler");
        res.json({
            success: true,
            data: galleries,
            message: "Get data success",
        });
    } catch (err) {
        res.status(500).json({ success: false, data: null, message: err.message });
    }
});

// Mendapatkan data galeri berdasarkan ID
router.get("/:id", getGallery, (req, res) => {
    res.json({
        success: true,
        data: res.gallery,
        message: "Get data success",
    });
});

// Membuat data galeri baru
router.post("/", async (req, res) => {
    const gallery = new Gallery({
        ekstrakurikuler: req.body.ekstrakurikuler,
        linkGallery: req.body.linkGallery,
        description: req.body.description,
    });

    try {
        const newGallery = await gallery.save();
        res.status(201).json({
            success: true,
            data: newGallery,
            message: "Create data success",
        });
    } catch (err) {
        res.status(400).json({ success: false, data: null, message: err.message });
    }
});

// Mengupdate data galeri berdasarkan ID
router.put("/:id", getGallery, async (req, res) => {
    try {
        res.gallery.ekstrakurikuler = req.body.ekstrakurikuler;
        res.gallery.linkGallery = req.body.linkGallery;
        res.gallery.description = req.body.description;

        const updatedGallery = await res.gallery.save();

        res.json({
            success: true,
            data: updatedGallery,
            message: "Update gallery success",
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            data: null,
            message: err.message,
        });
    }
});

// Menghapus data galeri berdasarkan ID
router.delete("/:id", getGallery, async (req, res) => {
    try {
        await res.gallery.deleteOne();
        res.json({
            data: null,
            success: true,
            message: "Data galeri dihapus",
        });
    } catch (err) {
        res.status(500).json({
            data: null,
            success: false,
            message: err.message,
        });
    }
});

router.post("/delete", async (req, res) => {
    const { ids } = req.body;

    try {
        // Menghapus data pengajar dengan menggunakan metode deleteMany() dari model Pengajar
        const result = await Gallery.deleteMany({ _id: ids });

        if (result.deletedCount > 0) {
            res.status(200).json({
                message: "Data gallery berhasil dihapus",
                status: "success",
            });
        } else {
            res.status(404).json({
                message: "Tidak ada data gallery yang dihapus",
                status: "not found",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan dalam menghapus data gallery",
            status: "error",
        });
    }
});

// Middleware untuk mendapatkan data galeri berdasarkan ID
async function getGallery(req, res, next) {
    let gallery;
    try {
        gallery = await Gallery.findById(req.params.id).populate("ekstrakurikuler");
        if (gallery == null) {
            return res.status(404).json({ success: false, data: null, message: "Data galeri tidak ditemukan" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, data: null, message: err.message });
    }

    res.gallery = gallery;
    next();
}

module.exports = router;

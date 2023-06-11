const express = require("express");
const router = express.Router();
const Kelas = require("../model/Kelas");

// Create
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        const kelas = new Kelas({ name });
        await kelas.save();
        res.status(201).json({
            success: true,
            data: kelas,
            message: "Kelas berhasil dibuat",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Read (all)
router.get("/", async (req, res) => {
    try {
        const kelas = await Kelas.find();
        res.json({ success: true, data: kelas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Read (single)
router.get("/:id", async (req, res) => {
    try {
        const kelas = await Kelas.findById(req.params.id);
        if (kelas == null) {
            return res.status(404).json({ message: "Kelas tidak ditemukan" });
        }
        res.json({ success: true, data: kelas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update
router.patch("/:id", async (req, res) => {
    try {
        const { name } = req.body;
        const kelas = await Kelas.findByIdAndUpdate(req.params.id, { name }, { new: true });
        if (kelas == null) {
            return res.status(404).json({ message: "Kelas tidak ditemukan" });
        }
        res.json({ success: true, data: kelas, message: "Kelas berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete
router.delete("/:id", async (req, res) => {
    try {
        const kelas = await Kelas.findByIdAndRemove(req.params.id);
        if (kelas == null) {
            return res.status(404).json({ message: "Kelas tidak ditemukan" });
        }
        res.json({ success: true, message: "Kelas berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

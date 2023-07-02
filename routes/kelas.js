const express = require("express");
const router = express.Router();
const Kelas = require("../model/Kelas");

// Create
router.post("/", async (req, res) => {
    try {
        const { name, kelas } = req.body;
        const savedKelas = new Kelas({ name, kelas });
        await savedKelas.save();
        res.status(201).json({
            success: true,
            data: savedKelas,
            message: "Create kelas success",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Read (all)
router.get("/", async (req, res) => {
    try {
        const kelas = await Kelas.find({});
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
router.put("/:id", async (req, res) => {
    try {
        const { name, kelas } = req.body;
        const updateKelas = await Kelas.findByIdAndUpdate(req.params.id, { name, kelas }, { new: true });
        if (updateKelas == null) {
            return res.status(404).json({ message: "Kelas tidak ditemukan" });
        }
        res.json({ success: true, data: updateKelas, message: "Kelas berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete
router.post("/delete", async (req, res) => {
    const { ids } = req.body;

    try {
        // Menghapus data pengajar dengan menggunakan metode deleteMany() dari model Pengajar
        const result = await Kelas.deleteMany({ _id: ids });

        if (result.deletedCount > 0) {
            res.status(200).json({
                message: "Delete kelas success",
                data: null,
                success: true,
            });
        } else {
            res.status(404).json({
                message: "No kelas data is deleted",
                data: null,
                success: false,
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "There was an error deleting kelas data",
            data: null,
            success: false,
        });
    }
});

module.exports = router;

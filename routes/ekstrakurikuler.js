const router = require("express").Router();
const { authAdmin, authPengajar } = require("../verifyToken");
const { schemaPengajar } = require("../validate");
const Pengajar = require("../model/Pengajar");
const Ekstrakurikuler = require("../model/Ekstrakurikuler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Siswa = require("../model/Siswa");
const Nilai = require("../model/Nilai");

// Create ekstrakurikuler
router.post("/", async (req, res) => {
    try {
        const existingEkstra = await Ekstrakurikuler.findOne({
            nama: req.body.nama.toLowerCase(),
        });

        if (existingEkstra) {
            return res.status(400).json({
                success: false,
                message: "Ekstrakurikuler already registered",
                data: null,
            });
        }

        const ekstrakurikuler = new Ekstrakurikuler({
            nama: req.body.nama,
            lokasi: req.body.lokasi,
            waktu: req.body.waktu,
            pengajar: req.body.pengajar,
            wajib: req.body.wajib,
            note: req.body.note,
        });

        const savedEkstra = await ekstrakurikuler.save();

        // Mengupdate data Pengajar untuk memasukkan ID Ekstrakurikuler
        await Pengajar.updateOne({ _id: req.body.pengajar }, { $push: { ekstrakurikuler: savedEkstra._id } });

        return res.status(200).json({
            success: true,
            message: "Create ekstrakurikuler success",
            data: savedEkstra,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});

// Delete ekstrakurikuler
router.delete("/:id", async (req, res) => {
    try {
        const ekstrakurikuler = await Ekstrakurikuler.findById(req.params.id);

        if (!ekstrakurikuler) {
            return res.status(404).json({
                success: false,
                message: "Ekstrakurikuler not found",
                data: null,
            });
        }

        // Menghapus ekstrakurikuler
        await ekstrakurikuler.deleteOne();

        // Mengupdate data Pengajar untuk menghapus referensi ID Ekstrakurikuler
        await Pengajar.updateOne({ _id: ekstrakurikuler.pengajar }, { $pull: { ekstrakurikuler: ekstrakurikuler._id } });

        return res.status(200).json({
            success: true,
            message: "Ekstrakurikuler deleted successfully",
            data: null,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const ekstraId = req.params.id;
        const updatedEkstra = req.body;

        // Cari Ekstrakurikuler berdasarkan ID
        const existingEkstra = await Ekstrakurikuler.findById(ekstraId);

        if (!existingEkstra) {
            return res.status(404).json({
                success: false,
                message: "Ekstrakurikuler not found",
                data: null,
            });
        }

        // Update properti ekstrakurikuler
        existingEkstra.nama = updatedEkstra.nama || existingEkstra.nama;
        existingEkstra.lokasi = updatedEkstra.lokasi || existingEkstra.lokasi;
        existingEkstra.waktu = updatedEkstra.waktu || existingEkstra.waktu;
        existingEkstra.wajib = updatedEkstra.wajib;
        existingEkstra.note = updatedEkstra.note;

        // Update data ekstrakurikuler
        const savedEkstra = await existingEkstra.save();

        return res.status(200).json({
            success: true,
            message: "Update ekstrakurikuler success",
            data: savedEkstra,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});

// Join Ekstrakurikuler
router.post("/join/:ekstraId", async (req, res) => {
    try {
        const { ekstraId } = req.params;
        const { nis } = req.body;

        // Cari siswa berdasarkan ID
        const siswa = await Siswa.findOne({ nis });

        if (!siswa) {
            return res.status(400).json({
                message: "Siswa tidak ditemukan",
                data: null,
                success: false,
            });
        }

        // Cari ekstrakurikuler berdasarkan ID
        const ekstrakurikuler = await Ekstrakurikuler.findById(ekstraId);
        if (!ekstrakurikuler) {
            return res.status(400).json({
                message: "Ekstrakurikuler tidak ditemukan",
                data: null,
                success: false,
            });
        }

        const nilai = new Nilai({
            ekstrakurikuler: ekstraId,
            siswa: siswa._id,
        });

        await nilai.save();

        siswa.nilai.push(nilai);
        await siswa.save();

        ekstrakurikuler.pendaftar.push(nilai);
        await ekstrakurikuler.save();

        res.status(201).json({
            message: "Ekstrakurikuler berhasil ditambahkan ke Siswa",
            // data: newEkstrakurikuler,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
});

module.exports = router;

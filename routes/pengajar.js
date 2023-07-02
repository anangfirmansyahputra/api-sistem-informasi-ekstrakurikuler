const router = require("express").Router();
const { authAdmin, authPengajar } = require("../verifyToken");
const { schemaPengajar } = require("../validate");
const Pengajar = require("../model/Pengajar");
const Ekstrakurikuler = require("../model/Ekstrakurikuler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login pengajar
router.post("/login", async (req, res) => {
    const { error } = schemaPengajar.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
            data: null,
        });
    }

    const pengajar = await Pengajar.findOne({ nik: req.body.nik });
    if (!pengajar) {
        return res.status(400).json({
            success: false,
            message: "User not found",
            data: null,
        });
    }

    const validPass = await bcrypt.compare(req.body.password, pengajar.password);
    if (!validPass) {
        return res.status(400).json({
            success: false,
            message: "Password is wrong",
            data: null,
        });
    }

    const token = jwt.sign({ _id: pengajar._id }, process.env.PENGAJAR_SECRET);
    return res
        .header("pengajar-token", token)
        .status(200)
        .json({
            success: true,
            message: "Log in success",
            data: {
                token: token,
            },
        });
});

// Create ekstrakurikuler
router.post("/ekstrakurikuler", async (req, res) => {
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
        });

        const savedEkstra = await ekstrakurikuler.save();

        // Mengupdate data Pengajar untuk memasukkan ID ekstrakurikuler
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

// Get all ekstrakurikuler
router.get("/ekstrakurikuler", async (req, res) => {
    try {
        const ekstra = await Ekstrakurikuler.find({}).populate({
            path: 'pendaftar',
            populate: [
                { path: 'kelas' },
                { path: 'nilai' }
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Berhasil mendapatkan semua data ekstrakurikuler",
            data: ekstra,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});


// Get ekstrakurikuler by specific id
router.get("/esktrakurikuler/:id", authPengajar, async (req, res) => {
    const id = req.params.id;
    const ekstra = await Ekstrakurikuler.findById({ _id: id });

    if (!ekstra)
        return res.status(400).json({
            success: false,
            message: "Ektrakulikuler not found",
            data: null,
        });

    try {
        return res.status(200).json({
            success: true,
            message: "Get Ekstrakurikuler successfully",
            data: ekstra,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err,
            data: null,
        });
    }
});

router.delete("/ekstrakurikuler/:id", async (req, res) => {
    const id = req.params.id;

    const ekstra = await Ekstrakurikuler.findById({ _id: id });

    if (ekstra) {
        await ekstra.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Delete ekstrakurikuler successfully",
        });
    } else {
        return res.status(400).json({
            success: false,
            message: "Ektrakurikuler not found",
        });
    }
});

router.post("/delete", async (req, res) => {
    const { niks } = req.body;

    try {
        // Menghapus data pengajar dengan menggunakan metode deleteMany() dari model Pengajar
        const result = await Pengajar.deleteMany({ nik: niks });

        console.log(result);

        if (result.deletedCount > 0) {
            res.status(200).json({
                message: "Data pengajar berhasil dihapus",
                status: "success",
            });
        } else {
            res.status(404).json({
                message: "Tidak ada data pengajar yang dihapus",
                status: "not found",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Terjadi kesalahan dalam menghapus data pengajar",
            status: "error",
        });
    }
});

// Update Pengajar
router.put("/:nik", async (req, res) => {
    const nik = req.body.nik;

    try {
        const pengajar = await Pengajar.findOneAndUpdate({ nik: nik }, req.body, {
            new: true, // Mengembalikan data yang sudah diperbarui
            runValidators: true, // Menjalankan validasi model saat melakukan pembaruan
        });

        if (!pengajar) {
            return res.status(400).json({
                success: false,
                message: "Data pengajar tidak ditemukan",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Data pengajar berhasil diperbarui",
            data: pengajar,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan saat memperbarui data pengajar",
            error: error.message,
        });
    }
});

module.exports = router;

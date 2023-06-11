const express = require("express");
const router = express.Router();
const Siswa = require("../model/Siswa");
const { schemaLoginSiswa } = require("../validate");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Ekstrakurikuler = require("../model/Ekstrakurikuler");
const Prestasi = require("../model/Prestasi");

// Login Siswa
router.post("/login", async (req, res) => {
    const { error } = schemaLoginSiswa.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
            data: null,
        });
    }

    const siswa = await Siswa.findOne({ nis: req.body.nis }).populate({
        path: "ekstraku",
        populate: {
            path: "ekstrakurikuler",
        },
    });

    if (!siswa) {
        return res.status(400).json({
            success: false,
            message: "Siswa tidak ditemukan",
            data: null,
        });
    }

    const validPass = await bcrypt.compare(req.body.password, siswa.password);
    if (!validPass) {
        return res.status(400).json({
            success: false,
            message: "Password salah!",
            data: null,
        });
    }

    const token = jwt.sign({ _id: siswa._id }, process.env.ADMIN_SECRET);

    return res.header("admin-token", token).status(200).json({
        _id: siswa._id,
        username: siswa.name,
        nis: siswa.nis,
        alamat: siswa.alamat,
        tgl: siswa.tgl,
        role: siswa.role,
        accessToken: token,
        nilai: siswa.nilai,
    });
});

// Mengambil semua data siswa
router.get("/", async (req, res) => {
    try {
        const siswa = await Siswa.find();

        return res.status(200).json({
            success: true,
            message: "Berhasil mengambil data siswa",
            data: siswa,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Gagal mengambil data siswa",
            data: null,
        });
    }
});

// Membuat siswa baru
router.post("/", async (req, res) => {
    try {
        const { name, nis, password, alamat, tgl } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const siswa = new Siswa({
            name,
            nis,
            password: hashedPassword,
            alamat,
            tgl,
        });

        await siswa.save();

        return res.status(201).json({
            success: true,
            message: "Siswa berhasil dibuat",
            data: siswa,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});

// Mengedit data siswa
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, nis, password, alamat, tgl } = req.body;

        const siswa = await Siswa.findByIdAndUpdate(
            id,
            {
                name,
                nis,
                password,
                alamat,
                tgl,
            },
            { new: true }
        );

        if (!siswa) {
            return res.status(404).json({
                success: false,
                message: "Siswa tidak ditemukan",
                data: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Siswa berhasil diperbarui",
            data: siswa,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});

// Menghapus data siswa
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const siswa = await Siswa.findOneAndDelete({ nis: id });

        if (!siswa) {
            return res.status(404).json({
                success: false,
                message: "Siswa tidak ditemukan",
                data: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Siswa berhasil dihapus",
            data: siswa,
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});

// Membuat Data Prestasi
router.post("/prestasi", async (req, res) => {
    try {
        const { siswa, tgl, deskripsi, ekstrakurikuler } = req.body;

        // Mengecek apakah ekstrakurikuler dengan ID yang diberikan ada
        const foundEkstrakurikuler = await Ekstrakurikuler.findById(ekstrakurikuler);
        if (!foundEkstrakurikuler) {
            return res.status(404).json({ message: "Ekstrakurikuler tidak ditemukan" });
        }

        // Mengecek apakah siswa dengan ID yang diberikan ada
        const foundSiswa = await Siswa.findById(siswa);
        if (!foundSiswa) {
            return res.status(404).json({ message: "Siswa tidak ditemukan" });
        }

        // Membuat data prestasi baru
        const prestasi = new Prestasi({
            siswa,
            tgl,
            deskripsi,
            ekstrakurikuler,
        });

        // Menyimpan data prestasi
        await prestasi.save();

        res.status(201).json({ message: "Data prestasi berhasil dibuat", prestasi });
    } catch (error) {
        console.error("Error creating prestasi", error);
        res.status(500).json({ message: "Terjadi kesalahan saat membuat data prestasi" });
    }
});

// Mengambil Data Prestasi
router.get("/prestasi/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Mencari data prestasi berdasarkan ID
        const prestasi = await Prestasi.findById(id).populate("siswa ekstrakurikuler");

        if (!prestasi) {
            return res.status(404).json({ message: "Data prestasi tidak ditemukan" });
        }

        res.status(200).json({ prestasi });
    } catch (error) {
        console.error("Error retrieving prestasi", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil data prestasi" });
    }
});

// Mengambil seluruh data prestasi
router.get("/prestasi", async (req, res) => {
    try {
        // Mengambil seluruh data prestasi
        const prestasi = await Prestasi.find().populate("siswa ekstrakurikuler");

        res.status(200).json({ prestasi });
    } catch (error) {
        console.error("Error retrieving prestasi", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil data prestasi" });
    }
});

// Mengubah Data Prestasi
router.put("/prestasi/:id", async (req, res) => {
    const { id } = req.params;
    const { siswa, tgl, deskripsi, ekstrakurikuler } = req.body;

    try {
        // Mengecek apakah ekstrakurikuler dengan ID yang diberikan ada
        const foundEkstrakurikuler = await Ekstrakurikuler.findById(ekstrakurikuler);
        if (!foundEkstrakurikuler) {
            return res.status(404).json({ message: "Ekstrakurikuler tidak ditemukan" });
        }

        // Mengecek apakah siswa dengan ID yang diberikan ada
        const foundSiswa = await Siswa.findById(siswa);
        if (!foundSiswa) {
            return res.status(404).json({ message: "Siswa tidak ditemukan" });
        }

        // Mencari data prestasi berdasarkan ID
        let prestasi = await Prestasi.findById(id);

        if (!prestasi) {
            return res.status(404).json({ message: "Data prestasi tidak ditemukan" });
        }

        // Mengubah atribut data prestasi
        prestasi.siswa = siswa;
        prestasi.tgl = tgl;
        prestasi.deskripsi = deskripsi;
        prestasi.ekstrakurikuler = ekstrakurikuler;

        // Menyimpan perubahan data prestasi
        prestasi = await prestasi.save();

        res.status(200).json({ message: "Data prestasi berhasil diubah", prestasi });
    } catch (error) {
        console.error("Error updating prestasi", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengubah data prestasi" });
    }
});

// Menghapus Data Prestasi
router.delete("/prestasi/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Mencari data prestasi berdasarkan ID dan menghapusnya
        const prestasi = await Prestasi.findByIdAndDelete(id);

        if (!prestasi) {
            return res.status(404).json({ message: "Data prestasi tidak ditemukan" });
        }

        res.status(200).json({ message: "Data prestasi berhasil dihapus", prestasi });
    } catch (error) {
        console.error("Error deleting prestasi", error);
        res.status(500).json({ message: "Terjadi kesalahan saat menghapus data prestasi" });
    }
});

module.exports = router;
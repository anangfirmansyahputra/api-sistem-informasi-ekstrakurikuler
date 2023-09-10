const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Prestasi = require("../model/Prestasi");
const Siswa = require("../model/Siswa");
const Ekstrakurikuler = require("../model/Ekstrakurikuler");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");

dotenv.config();

cloudinary.config({
    secure: true,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    cloud_name: process.env.CLOUD_NAME,
});

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "uploads/"); // Direktori penyimpanan file di server
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     },
// });

// const upload = multer({ storage: storage });

const upload = multer({
    storage: multer.diskStorage({}), // Atau gunakan penyimpanan lain seperti memory storage
    limits: { fileSize: 2 * 1024 * 1024 }, // Batasan ukuran file 2MB
});

// GET All
router.get("/", async (req, res) => {
    try {
        const prestasi = await Prestasi.find().populate("siswa ekstrakurikuler kelas");
        res.json({
            success: true,
            message: "Prestasi retrieved successfully",
            data: prestasi,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve prestasi",
            data: null,
        });
    }
});

// CREATE
router.post("/upload", upload.array("images", 2), async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { ekstrakurikuler, siswa, kelas, tgl, deskripsi } = req.body;

        const siswaExist = await Siswa.findById(siswa);

        const ekstrakurikulerExist = await Ekstrakurikuler.findById(ekstrakurikuler);

        if (!siswaExist) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Siswa not found!",
            });
        } else if (!ekstrakurikulerExist) {
            return res.status(400).json({
                success: false,
                data: null,
                message: "Ekstrakurikuler not found!",
            });
        } else {
            const option = {
                folder: "prestasi",
                use_filename: true,
                unique_filename: false,
                overwrite: true,
            };

            const resultImg = await cloudinary.uploader.upload(req.files[0].path, option);
            const resultSertifikat = await cloudinary.uploader.upload(req.files[1].path, option);

            // Hapus file di folder lokal setelah diupload ke Cloudinary
            // fs.unlinkSync(req.files[0].path);
            // fs.unlinkSync(req.files[1].path);

            if (!resultImg.secure_url || !resultSertifikat.secure_url) {
                return res.status(500).json({
                    success: false,
                    data: null,
                    message: "Failed to upload image to Cloudinary",
                });
            }

            const prestasi = new Prestasi({
                sertifikat: resultSertifikat.secure_url,
                img: resultImg.secure_url,
                ekstrakurikuler,
                deskripsi,
                siswa,
                kelas,
                tgl,
            });

            await prestasi.save();

            return res.status(200).json({
                success: true,
                data: prestasi,
                message: "Created prestasi success",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Internal server error",
        });
    }
});

// READ
router.get("/:id", async (req, res) => {
    try {
        const prestasi = await Prestasi.findById(req.params.id);
        if (!prestasi) {
            return res.json({
                success: false,
                message: "Prestasi not found",
                data: null,
            });
        }
        res.json({
            success: true,
            message: "Prestasi found",
            data: prestasi,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get prestasi",
            data: null,
        });
    }
});

// UPDATE
router.put("/:id", upload.array("images", 2), async (req, res) => {
    try {
        const { ekstrakurikuler, siswa, kelas, tgl, deskripsi } = req.body;
        const prestasi = await Prestasi.findById(req.params.id);


        if (!prestasi) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "Prestasi not found",
            });
        }

        if (req.files && req.files.length > 0) {
            const option = {
                folder: "prestasi",
                use_filename: true,
                unique_filename: false,
                overwrite: true,
            };

            if (req.files[1]) {
                const resultImg = await cloudinary.uploader.upload(req.files[1].path, option);
                fs.unlinkSync(req.files[1].path);
                prestasi.img = resultImg.secure_url;
            }

            if (req.files[0]) {
                const resultSertifikat = await cloudinary.uploader.upload(req.files[0].path, option);
                fs.unlinkSync(req.files[0].path);
                prestasi.sertifikat = resultSertifikat.secure_url;
            }
        }

        // Memperbarui atribut yang dikirimkan oleh pengguna
        prestasi.ekstrakurikuler = ekstrakurikuler || prestasi.ekstrakurikuler;
        prestasi.deskripsi = deskripsi || prestasi.deskripsi;
        prestasi.siswa = siswa || prestasi.siswa;
        prestasi.kelas = kelas || prestasi.kelas;
        prestasi.tgl = tgl || prestasi.tgl;

        await prestasi.save();

        return res.status(200).json({
            success: true,
            data: prestasi,
            message: "Prestasi updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Internal server error",
        });
    }
});

// DELETE
router.delete("/:id", async (req, res) => {
    try {
        const prestasi = await Prestasi.findById(req.params.id);
        if (!prestasi) {
            return res.status(404).json({
                success: false,
                data: null,
                message: "Prestasi not found",
            });
        }

        // Hapus gambar yang terkait dengan prestasi sebelum menghapus data prestasi
        await cloudinary.uploader.destroy(prestasi.sertifikat);
        await cloudinary.uploader.destroy(prestasi.img);

        await prestasi.deleteOne();

        return res.status(200).json({
            success: true,
            data: null,
            message: "Prestasi deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            data: null,
            message: error.message || "Internal server error",
        });
    }
});

module.exports = router;

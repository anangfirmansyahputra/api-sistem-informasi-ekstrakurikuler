const router = require("express").Router();
const { authAdmin, authPengajar } = require("../verifyToken");
const { schemaPengajar } = require("../validate");
const Pengajar = require("../model/Pengajar");
const Ekstrakurikuler = require("../model/Ekstrakurikuler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Siswa = require("../model/Siswa");
const Nilai = require("../model/Nilai");
const mongoose = require('mongoose');

// Create ekstrakurikuler
router.post("/", async (req, res) => {
    try {
        const existingEkstra = await Ekstrakurikuler.findOne({
            name: req.body.name.toLowerCase(),
        });

        if (existingEkstra) {
            return res.status(400).json({
                success: false,
                message: "Ekstrakurikuler already registered",
                data: null,
            });
        }

        const ekstrakurikuler = new Ekstrakurikuler({
            name: req.body.name,
            lokasi: req.body.lokasi,
            waktu: req.body.waktu,
            pengajar: req.body.pengajar,
            wajib: req.body.wajib,
            hari: req.body.hari,
            note: req.body.note,
        });

        const savedEkstra = await ekstrakurikuler.save();

        // Mengupdate data Pengajar untuk memasukkan ID Ekstrakurikuler
        const updatePengajar = await Pengajar.updateOne({ _id: req.body.pengajar }, { $push: { ekstrakurikuler: savedEkstra._id } });

        if (updatePengajar.nModified === 0) {
            // Jika tidak ada pembaruan pada data pengajar
            await Ekstrakurikuler.findByIdAndDelete(savedEkstra._id); // Hapus ekstrakurikuler yang baru dibuat
            return res.status(400).json({
                success: false,
                message: "Failed to update pengajar",
                data: null,
            });
        }

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
        existingEkstra.name = updatedEkstra.name || existingEkstra.name;
        existingEkstra.lokasi = updatedEkstra.lokasi || existingEkstra.lokasi;
        existingEkstra.waktu = updatedEkstra.waktu || existingEkstra.waktu;
        existingEkstra.wajib = updatedEkstra.wajib;
        existingEkstra.note = updatedEkstra.note;
        existingEkstra.hari = updatedEkstra.hari;

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
router.post("/join", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { nis, ekstraId } = req.body;

        // Cari siswa berdasarkan ID
        const siswa = await Siswa.findOne({ nis }).session(session);

        if (!siswa) {
            return res.status(400).json({
                message: "Siswa tidak ditemukan",
                data: null,
                success: false,
            });
        }

        // Cari ekstrakurikuler berdasarkan ID
        const ekstrakurikuler = await Ekstrakurikuler.findById(ekstraId).session(session);
        if (!ekstrakurikuler) {
            return res.status(400).json({
                message: "Ekstrakurikuler tidak ditemukan",
                data: null,
                success: false,
            });
        }

        const nilai = await Nilai.findById(siswa.nilai).session(session)

        if (!nilai) {
            return res.status(400).json({
                message: "Nilai not found!",
                data: null,
                success: false,
            });
        }

        if (ekstrakurikuler.wajib) {
            nilai.ekstrakurikulerWajib.ekstrakurikuler = ekstraId;
            await nilai.save();
        } else {
            nilai.ekstrakurikulerPilihan.ekstrakurikuler = ekstraId;
            await nilai.save();
        }

        ekstrakurikuler.pendaftar.push(siswa._id);
        await ekstrakurikuler.save();

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Ekstrakurikuler berhasil ditambahkan ke Siswa",
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.log(err)
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
});


router.post("/delete", async (req, res) => {
    const { ids } = req.body;

    try {
        // Menghapus data pengajar dengan menggunakan metode deleteMany() dari model Pengajar
        const result = await Ekstrakurikuler.deleteMany({ _id: { $in: ids } });

        if (result.deletedCount > 0) {
            res.status(200).json({
                message: "Data ekstrakurikuler berhasil dihapus",
                status: "success",
            });
        } else {
            res.status(404).json({
                message: "Tidak ada data ekstrakurikuler yang dihapus",
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

router.post('/absensi', async (req, res) => {
    const { listSiswa, pertemuan, ekstrakurikuler, kelas } = req.body

    const session = await mongoose.startSession()

    try {
        // session.startTransaction()

        const ekstrakurikulerExist = await Ekstrakurikuler.findById(ekstrakurikuler).populate('pendaftar')

        if (!ekstrakurikulerExist) {
            throw new Error("Ekstrakurikuler doesn't exist!")
        }


        const listPendaftar = ekstrakurikulerExist.pendaftar

        for (const siswaId of listPendaftar) {
            if (!listSiswa.includes(siswaId)) {
                const siswa = await Siswa.findById(siswaId)

                if (siswa) {
                    const nilai = await Nilai.findById(siswa.nilai)
                    // Set kehadiran false
                    if (ekstrakurikulerExist.wajib) {
                        nilai.ekstrakurikulerWajib.kehadiran[pertemuan] = false
                        let hadir = nilai.ekstrakurikulerWajib.kehadiran.filter(item => item === true).length
                        let tidakHadir = nilai.ekstrakurikulerWajib.kehadiran.filter(item => item === false).length
                        // nilai.ekstrakurikulerWajib.absen = Number((hadir / tidakHadir) * 100)
                    } else {
                        nilai.ekstrakurikulerPilihan.kehadiran[pertemuan] = false
                        let hadir = nilai.ekstrakurikulerPilihan.kehadiran.filter(item => item === true).length
                        let tidakHadir = nilai.ekstrakurikulerPilihan.kehadiran.filter(item => item === false).length
                        // nilai.ekstrakurikulerPilihan.absen = Number((hadir / tidakHadir) * 100)
                    }
                    await nilai.save()

                }
            }
        }

        for (const siswaId of listSiswa) {
            const siswa = await Siswa.findById(siswaId)

            const nilai = await Nilai.findById(siswa.nilai)

            if (!siswa) {
                throw new Error(`Siswa with ID ${siswaId} doesn't exist`)
            }

            // Update kehadiran ekstrakurikuler pilihan
            if (ekstrakurikulerExist.wajib) {
                nilai.ekstrakurikulerWajib.kehadiran[pertemuan] = true
                let hadir = nilai.ekstrakurikulerWajib.kehadiran.filter(item => item === true).length
                let tidakHadir = nilai.ekstrakurikulerWajib.kehadiran.filter(item => item === false).length
                // nilai.ekstrakurikulerWajib.absen = Number((hadir / tidakHadir) * 100)
            } else {
                nilai.ekstrakurikulerPilihan.kehadiran[pertemuan] = true
                let hadir = nilai.ekstrakurikulerPilihan.kehadiran.filter(item => item === true).length
                let tidakHadir = nilai.ekstrakurikulerPilihan.kehadiran.filter(item => item === false).length
                // nilai.ekstrakurikulerPilihan.absen = Number((hadir / tidakHadir) * 100)
            }
            await nilai.save()

        }

        // await session.commitTransaction()

        return res.status(200).json({
            success: true,
            message: "Update kehadiran success",
            data: null
        })
    } catch (error) {
        await session.abortTransaction()
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        })
    } finally {
        // session.endSession()
    }
})



// router.post('/absensi', async (req, res) => {
//     const { listSiswa, pertemuan, ekstrakurikuler, kelas } = req.body;

//     try {
//         const ekstrakurikulerExist = await Ekstrakurikuler.findById(ekstrakurikuler);

//         if (!ekstrakurikulerExist) {
//             throw new Error("Ekstrakurikuler doesn't exist!");
//         }

//         // for (const siswaId of listSiswa) {
//         //     const siswa = await Siswa.findById(siswaId);
//         //     const nilai = await Nilai.findById(siswa.nilai);

//         //     if (!siswa) {
//         //         throw new Error(`Siswa with ID ${siswaId} doesn't exist`);
//         //     }

//         //     // Pastikan siswa terdaftar di ekstrakurikuler
//         //     if (!ekstrakurikulerExist.pendaftar.includes(siswaId)) {
//         //         throw new Error(`Siswa with ID ${siswaId} is not registered for this extracurricular`);
//         //     }

//         //     // Update kehadiran ekstrakurikuler
//         //     if (ekstrakurikulerExist.wajib) {
//         //         nilai.ekstrakurikulerWajib.kehadiran[pertemuan] = true;
//         //     } else {
//         //         nilai.ekstrakurikulerPilihan.kehadiran[pertemuan] = true;
//         //     }

//         //     await nilai.save();
//         // }

//         // Loop melalui semua siswa yang terdaftar di ekstrakurikuler
//         for (const siswaId of ekstrakurikulerExist.pendaftar) {
//             const siswa = await Siswa.findById(siswaId);
//             const nilai = await Nilai.findById(siswa.nilai);

//             if (!siswa) {
//                 throw new Error(`Siswa with ID ${siswaId} doesn't exist`);
//             }

//             // Periksa apakah siswa ada di listSiswa
//             const isSiswaTerdaftar = listSiswa.includes(siswaId);

//             // Update kehadiran ekstrakurikuler sesuai kondisi
//             if (ekstrakurikulerExist.wajib) {
//                 nilai.ekstrakurikulerWajib.kehadiran[pertemuan] = isSiswaTerdaftar;
//             } else {
//                 nilai.ekstrakurikulerPilihan.kehadiran[pertemuan] = isSiswaTerdaftar;
//             }

//             await nilai.save();
//         }


//         return res.status(200).json({
//             success: true,
//             message: "Update kehadiran success",
//             data: null
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//             data: null
//         });
//     }
// });



// Find by id
router.get('/:id', async (req, res) => {
    try {
        const findEkstrakurikuler = await Ekstrakurikuler.findById(req.params.id).populate({
            path: 'pendaftar',
            populate: [
                { path: 'kelas' },
                { path: 'nilai' },
            ]
        }).populate('pengajar');

        if (!findEkstrakurikuler) {
            // If Ekstrakurikuler is not found, return a 404 Not Found response.
            return res.status(404).json({
                data: null,
                success: false,
                message: "Ekstrakurikuler tidak ditemukan"
            });
        }

        // If Ekstrakurikuler is found, return a 200 OK response with the data.
        return res.status(200).json({
            data: findEkstrakurikuler,
            message: "Data berhasil didapat",
            success: true
        });

    } catch (err) {
        // If there's an error (e.g., database connection error), return a 500 Internal Server Error response.
        return res.status(500).json({
            data: null,
            message: err.message, // Display the error message instead of the entire error object.
            success: false
        });
    }
});

router.post('/nilai/:id', async (req, res) => {
    try {
        const findSiswa = await Siswa.findById(req.params.id);

        if (findSiswa) {
            const id = findSiswa.nilai;
            const findNilai = await Nilai.findById(id);

            if (findNilai) {
                const nilai = findNilai[req.body.wajib ? "ekstrakurikulerWajib" : "ekstrakurikulerPilihan"];
                nilai.nilai = req.body.nilai;

                await findNilai.save()

                return res.status(200).json({
                    data: nilai,
                    message: 'Data berhasil dirubah',
                    success: true
                });
            } else {
                return res.status(404).json({
                    data: null,
                    message: 'Nilai not found',
                    success: false
                });
            }
        } else {
            return res.status(404).json({
                data: null,
                message: 'Siswa not found',
                success: false
            });
        }

    } catch (err) {
        return res.status(500).json({
            data: null,
            message: err.message,
            success: false
        });
    }
});


module.exports = router;

const router = require("express").Router();
const Admin = require("../model/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { schemaRegister, schemaLogin, schemaPengajar } = require("../validate");
const Pengajar = require("../model/Pengajar");
const Pengumuman = require("../model/Pengumuman");
const { authAdmin } = require("../verifyToken");
const Ekstrakurikuler = require("../model/Ekstrakurikuler");
// Create admin
router.post("/register", async (req, res) => {
    // const { error } = schemaRegister.validate(req.body);

    // if (error) {
    //     return res.status(400).json({
    //         success: false,
    //         message: error.details[0].message,
    //         data: null,
    //     });
    // }

    const alredyAdmin = await Admin.findOne({ username: req.body.username });

    if (alredyAdmin) {
        return res.status(400).json({
            success: false,
            message: "Username sudah digunakan!",
            data: null,
        });
    }

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const admin = new Admin({
        username: req.body.username,
        password: req.body.password,
    });

    try {
        const savedAdmin = await admin.save();
        return res.status(200).json({
            success: true,
            message: "Buat user admin sukses!",
            data: {
                username: savedAdmin.username,
                _id: savedAdmin._id,
            },
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err,
            data: null,
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    // const { error } = schemaLogin.validate(req.body);

    // if (error) {
    //     return res.status(400).json({
    //         success: false,
    //         message: error.details[0].message,
    //         data: null,
    //     });
    // }

    const admin = await Admin.findOne({ username: req.body.username });

    if (!admin) {
        return res.status(400).json({
            success: false,
            message: "Username tidak ditemukan",
            data: null,
        });
    }

    // const validPass = await bcrypt.compare(req.body.password, admin.password);
    if (admin.password !== req.body.password) {
        return res.status(400).json({
            success: false,
            message: "Password salah!",
            data: null,
        });
    }

    const token = jwt.sign({ _id: admin._id }, process.env.ADMIN_SECRET);
    // res.header("admin-token", token).send(token);

    return res.header("admin-token", token).status(200).json({
        _id: admin._id,
        username: admin.username,
        phone: admin.phone,
        email: admin.email,
        address: admin.address,
        role: admin.role,
        accessToken: token,
    });
});

// Create pengajar
router.post("/buat-pengajar", async (req, res) => {
    // const { error } = schemaPengajar.validate(req.body);
    // if (error) {
    //     return res.status(400).json({
    //         success: false,
    //         message: error.details[0].message,
    //         data: null,
    //     });
    // }

    const alredyPengajar = await Pengajar.findOne({ nik: req.body.nik });
    if (alredyPengajar) {
        return res.status(400).json({
            success: false,
            message: "User alredy register",
            data: null,
        });
    }

    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const pengajar = new Pengajar({
        nama: req.body.nama,
        nik: req.body.nik,
        // password: hashedPassword,
        ...req.body,
    });

    try {
        const savedPengajar = await pengajar.save();

        res.status(200).json({
            success: true,
            message: "Buat pengajar success",
            data: {
                id: savedPengajar._id,
            },
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err,
            data: null,
        });
    }
});

// Get all pengajar
router.get("/pengajar", async (req, res) => {
    try {
        const pengajar = await Pengajar.find({}).populate(['ekstrakurikuler', 'mengajar']);

        if (pengajar.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Success get all pengajar",
                data: pengajar,
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "No pengajar found",
                data: [],
            });
        }
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});


router.get("/pengajar/:id", async (req, res) => {
    try {
        const pengajar = await Pengajar.findById(req.params.id).populate("ekstrakurikuler");

        if (pengajar) {
            return res.status(200).json({
                success: true,
                message: "Success get all pengajar",
                data: pengajar,
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "No pengajar found",
                data: null,
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
            data: null,
        });
    }
});

// Delete pengajar
router.put("/pengajar", async (req, res) => {
    const idPengajar = req.body.listId;
    console.log(req.body);
    idPengajar.map(async (item) => await Pengajar.deleteMany({ nik: { $eq: item } }));

    return res.status(200).json({
        success: true,
        message: "Data berhasil dihapus",
    });
});

router.delete('/pengajar/delete/:id', async (req, res) => {
    const pengajar = await Pengajar.findById(req.params.id)

    try {
        if (pengajar) {
            await pengajar.deleteOne()

            return res.status(200).json({
                success: true,
                message: "Data berhasil dihapus",
                data: null
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Data tidak ditemukan",
                data: null
            });
        }

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err,
            data: null
        });
    }



})

// Approve Ektrakurikuler
router.put("/ekstrakurikuler/approve/:id", async (req, res) => {
    const id = req.params.id;
    const existEktrakurikuler = await Ekstrakurikuler.findById({ _id: id });

    if (!existEktrakurikuler) {
        return res.status(400).json({
            success: false,
            message: "Ekstrakurikuler does not exist",
            data: null,
        });
    }
    try {
        await Ekstrakurikuler.updateOne({ _id: id }, { approve: true });

        return res.status(200).json({
            success: true,
            message: "Approve ektrakurikuler success",
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }
});

// Create pengumuman
router.post("/pengumuman", async (req, res) => {
    try {
        const data = req.body;

        const pengumuman = new Pengumuman({
            title: data.title,
            content: data.content,
            timeEnd: data.timeEnd,
            for: data.for
            // timeStart: data.timeStart,
        });

        const savedPengumuman = await pengumuman.save();

        res.status(200).json({
            success: true,
            message: "Buat pengumuman berhasil",
            data: savedPengumuman,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err,
            data: null,
        });
    }
});

// Get pengumuman by id
router.get('/pengumuman/:id', async (req, res) => {
    try {
        const findPengumuman = await Pengumuman.findById(req.params.id)
        if (findPengumuman) {
            return res.status(200).json({
                data: findPengumuman,
                message: "Data berhasil didapatkan",
                success: true
            })
        } else {
            throw new Error('Data tidak ditemukan')
        }

    } catch (err) {
        return res.status(500).json({
            data: null,
            message: err,
            success: false
        })
    }
})

// Delete by id
router.delete('/pengumuman/:id', async (req, res) => {
    try {
        const findPengumuman = await Pengumuman.findById(req.params.id)
        if (findPengumuman) {
            await findPengumuman.deleteOne()

            return res.status(200).json({
                data: null,
                message: "Data berhasil dihapus",
                success: true
            })
        } else {
            throw new Error('Data tidak ditemukan')
        }

    } catch (err) {
        return res.status(500).json({
            data: null,
            message: err,
            success: false
        })
    }
})

// Update
router.put('/pengumuman/:id', async (req, res) => {
    try {
        const findPengumuman = await Pengumuman.findById(req.params.id)
        if (findPengumuman) {
            findPengumuman.title = req.body.title
            findPengumuman.content = req.body.content
            findPengumuman.timeEnd = req.body.timeEnd
            findPengumuman.for = req.body.for

            const updatePengumuman = await findPengumuman.save()

            return res.status(200).json({
                data: updatePengumuman,
                message: "Data berhasil diperbarui",
                success: true
            })
        } else {
            throw new Error('Data tidak ditemukan')
        }

    } catch (err) {
        return res.status(500).json({
            data: null,
            message: err,
            success: false
        })
    }
})

// Get all pengumuman
router.post("/pengumuman/all", async (req, res) => {
    const role = req.body.role

    try {
        if (role) {
            const pengumuman = await Pengumuman.find({ for: role })
            const pengumumanAll = await Pengumuman.find({ for: "semua" })
            res.status(200).json({
                success: true,
                message: "Get pengumuman berhasil",
                data: [...pengumuman, ...pengumumanAll],
            });
        } else {
            const pengumuman = await Pengumuman.find({});
            res.status(200).json({
                success: true,
                message: "Get pengumuman berhasil",
                data: pengumuman,
            });
        }

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err,
            data: null,
        });
    }
});

module.exports = router;

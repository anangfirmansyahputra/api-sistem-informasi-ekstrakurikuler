const jwt = require("jsonwebtoken");

function authAdmin(req, res, next) {
    const token = req.header("admin-token");
    if (!token) return res.status(401).send("Access Denied");

    try {
        const verified = jwt.verify(token, process.env.ADMIN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send("Invalid Token");
    }
}

function authPengajar(req, res, next) {
    const token = req.header("pengajar-token");
    if (!token) return res.status(401).send("Access Denied");

    try {
        const verified = jwt.verify(token, process.env.PENGAJAR_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send("Invalid Token");
    }
}

function authSiswa(req, res, next) {
    const token = req.header("siswa-token");
    if (!token) return res.status(401).send("Access Denied");

    try {
        const verified = jwt.verify(token, process.env.PENGAJAR_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send("Invalid Token");
    }
}

module.exports = {
    authAdmin: authAdmin,
    authPengajar: authPengajar,
    authSiswa: authSiswa,
};

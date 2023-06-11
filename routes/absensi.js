const router = require("express").Router();
const Nilai = require("../model/Nilai");

router.put("/absensi/:idEkstrakurikuler", async (req, res) => {
    const { idEkstrakurikuler } = req.params;
    const { siswaIds } = req.body;

    try {
        // Mencari model nilai dengan ID ekstrakurikuler yang sama
        const nilai = await Nilai.find({ ekstrakurikuler: idEkstrakurikuler });

        // Mengupdate atribut kehadiran sesuai dengan siswa yang hadir
        nilai.forEach(async (item) => {
            if (siswaIds.includes(String(item.siswa))) {
                item.kehadiran.push(true);
            } else {
                item.kehadiran.push(false);
            }
            await item.save();
        });

        res.status(200).json({ message: "Absensi berhasil diupdate" });
    } catch (error) {
        console.error("Error updating absensi", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengupdate absensi" });
    }
});

router.put("/absensi/:idEkstrakurikuler/siswa/:idSiswa", async (req, res) => {
    const { idEkstrakurikuler, idSiswa } = req.params;
    const { kehadiran } = req.body;

    try {
        // Mencari model nilai berdasarkan ID ekstrakurikuler dan ID siswa
        const nilai = await Nilai.findOne({ ekstrakurikuler: idEkstrakurikuler, siswa: idSiswa });

        if (!nilai) {
            return res.status(404).json({ message: "Nilai tidak ditemukan" });
        }

        // Mengganti nilai kehadiran dengan data yang dikirimkan
        nilai.kehadiran = kehadiran;

        await nilai.save();

        res.status(200).json({ message: "Absensi berhasil diupdate" });
    } catch (error) {
        console.error("Error updating absensi", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengupdate absensi" });
    }
});

module.exports = router;

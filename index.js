const express = require("express");
const app = express();
const mongoose = require("mongoose");
const adminRoutes = require("./routes/admin");
const pengajarRoutes = require("./routes/pengajar");
const siswaRoutes = require("./routes/siswa");
const ekstraRoutes = require("./routes/ekstrakurikuler");
const kelasRoutes = require("./routes/kelas");
const nilaiRoutes = require("./routes/absensi");
const cors = require("cors");

require("dotenv").config();

// Import Routes

// Route Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/pengajar", pengajarRoutes);
app.use("/api/siswa", siswaRoutes);
app.use("/api/pengajar", adminRoutes);
app.use("/api/ekstrakurikuler", ekstraRoutes);
app.use("/api/kelas", kelasRoutes);
app.use("/api/nilai", nilaiRoutes);

mongoose.connect(process.env.MONGO_URL).catch((error) => console.error(error));

app.listen(process.env.PORT, () => {
    console.log(`Server running at port ${process.env.PORT}`);
});

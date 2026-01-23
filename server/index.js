// server/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes"); // <--- Tambahkan ini
const transactionRoutes = require("./routes/transactionRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const goalRoutes = require("./routes/goalRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Untuk Localhost
      "https://management-smart.vercel.app", // <--- TAMBAHKAN INI (Domain Frontend Kamu)
    ],
    credentials: true,
  }),
);
app.use(express.json()); // Supaya backend bisa baca data JSON dari request body

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chat", chatRoutes);

// Test Route (Cuma buat ngecek server nyala)
app.get("/", (req, res) => {
  res.send("Halo Sajid! Server Backend Money Manager sudah aktif 🚀");
});

// Jalankan Server
// Hanya jalankan listen jika di local (bukan di Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

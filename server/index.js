// server/index.js
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet"); // Security
const compression = require("compression"); // Performance
const authRoutes = require("./routes/authRoutes"); // <--- Tambahkan ini
const transactionRoutes = require("./routes/transactionRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const goalRoutes = require("./routes/goalRoutes");
const chatRoutes = require("./routes/chatRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://management-smart.vercel.app"],
    credentials: true,
    // 👇 TAMBAHKAN "OPTIONS" DISINI
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(helmet()); // Aktifkan pelindung header
app.use(compression()); // Aktifkan kompresi GZIP
app.use(express.json()); // Supaya backend bisa baca data JSON dari request body

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/budget", budgetRoutes);

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

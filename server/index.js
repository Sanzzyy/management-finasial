// server/index.js
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const goalRoutes = require("./routes/goalRoutes");
const chatRoutes = require("./routes/chatRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// --- 1. CONFIG CORS YANG BENAR ---
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // 👇 PERBAIKAN: HAPUS "/api" DI BELAKANGNYA!
      "https://management-smart.vercel.app",
    ],
    credentials: true, // Izinkan Cookie
    // 👇 PERBAIKAN: TAMBAHKAN "OPTIONS"
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- 2. CONFIG HELMET AGAR TIDAK BLOKIR ---
// Helmet bawaan suka memblokir akses dari domain lain, kita longgarkan sedikit.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(compression());
app.use(express.json());

// --- 3. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/budget", budgetRoutes);

app.get("/", (req, res) => {
  res.send("Halo Sajid! Server Backend Money Manager sudah aktif 🚀");
});

// Handler Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

// server/index.js
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");

// --- PERBAIKAN: HAPUS HELMET & COMPRESSION BIAR GAK CRASH ---
// const helmet = require("helmet");
// const compression = require("compression");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const goalRoutes = require("./routes/goalRoutes");
const chatRoutes = require("./routes/chatRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// --- PERBAIKAN UTAMA CORS ---
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // 👇 PERBAIKAN MUTLAK: HAPUS "/api" DI BELAKANG URL INI
      "https://management-smart.vercel.app",
    ],
    credentials: true,
    // 👇 PERBAIKAN: PASTIKAN "OPTIONS" ADA
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/budget", budgetRoutes);

app.get("/", (req, res) => {
  res.send("Server Backend Money Manager Aktif (Stabil) 🚀");
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

// server/index.js
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");

// Routes
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const goalRoutes = require("./routes/goalRoutes");
const chatRoutes = require("./routes/chatRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- 1. CORS MIDDLEWARE ---
app.use(
  cors({
    origin: "https://management-smart.vercel.app", // HARUS SAMA PERSIS
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- 2. MANUAL OPTIONS HANDLER (PENTING BUAT VERCEL) ---
// Ini memaksa backend menjawab "OK" saat browser tanya "Boleh masuk gak?"
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://management-smart.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// --- 3. SECURITY & PERFORMANCE ---
// Update Helmet supaya gak bentrok sama CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(compression());
app.use(express.json());

// --- 4. ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/budget", budgetRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Halo Sajid! Server Backend Money Manager sudah aktif 🚀");
});

// Jalankan Server (Vercel Friendly)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

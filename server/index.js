// server/index.js
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser"); // <--- TAMBAHAN PENTING

// const helmet = require("helmet");  <-- Biarkan mati dulu biar gak crash
// const compression = require("compression"); <-- Biarkan mati dulu

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const goalRoutes = require("./routes/goalRoutes");
const chatRoutes = require("./routes/chatRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Config CORS
app.use(
  cors({
    // Logic: Kalau di Localhost, izinkan Localhost. Kalau Production, izinkan Vercel.
    origin: ["http://localhost:5173", "https://management-smart.vercel.app"],
    credentials: true, // Biar cookie bisa lewat
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser()); // <--- AKTIFKAN COOKIE PARSER DISINI

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/budget", budgetRoutes);

app.get("/", (req, res) => {
  res.send("Server Backend Money Manager Aktif! 🚀");
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

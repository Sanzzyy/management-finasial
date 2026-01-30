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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- KONFIGURASI CORS (Explicit & Dinamis) ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://management-smart.vercel.app", // Pastikan tidak ada slash di akhir
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti Postman atau server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin); // Log jika ada yang diblokir
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};

// 1. Pasang CORS paling atas
app.use(cors(corsOptions));

// 2. Pasang Handler Khusus Preflight (PENTING!)
// Ini memastikan request OPTIONS langsung dijawab "OK" tanpa masuk ke route lain
app.options("*", cors(corsOptions));

// 3. Middleware Lain
app.use(helmet());
app.use(compression());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/budget", budgetRoutes);

app.get("/", (req, res) => {
  res.send("Halo Sajid! Server Backend Money Manager sudah aktif 🚀");
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

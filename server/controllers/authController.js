// server/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

// Load env supaya process.env terbaca
require("dotenv").config();

// --- BAGIAN INI YANG WAJIB DIISI ---
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
// ------------------------------------

// Fitur Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Cek apakah user sudah ada?
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah terdaftar!" });
    }

    // 2. Acak password (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Simpan ke Database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ msg: "Register Berhasil", data: newUser });
  } catch (error) {
    console.log("Error di Register:", error); // Log error lebih detail
    res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
  }
};

// Fitur Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // --- BUAT TOKEN ---
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Data yang disimpan di dalam token
      process.env.JWT_SECRET || "rahasia_negara_123", // Gunakan .env nanti
      { expiresIn: "7d" }, // Token berlaku 7 hari
    );

    // Kirim Token ke Frontend (Jangan kirim password!)
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Jangan lupa update exports di paling bawah!
module.exports = { register, login };

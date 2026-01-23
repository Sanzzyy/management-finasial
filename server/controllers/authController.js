// server/controllers/authController.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

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
  try {
    const { email, password } = req.body;

    // 1. Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // Jika user tidak ketemu
    if (!user) {
      return res.status(404).json({ msg: "Email tidak ditemukan" });
    }

    // 2. Cek Password (Bandingkan password input vs database)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Password salah!" });
    }

    // 3. Login Sukses (Kirim data user tanpa password)
    res.status(200).json({
      msg: "Login Berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

// Jangan lupa update exports di paling bawah!
module.exports = { register, login };

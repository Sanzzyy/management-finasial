const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

// Load env variables
require("dotenv").config();

const prisma = new PrismaClient();

// --- 1. REGISTER ---
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi Input
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Mohon lengkapi semua data!" });
    }

    // Cek User Lama
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah terdaftar!" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan User Baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ msg: "Register Berhasil", data: { id: newUser.id, email: newUser.email } });
  } catch (error) {
    console.error("Error Register:", error);
    res.status(500).json({ msg: "Terjadi kesalahan server", error: error.message });
  }
};

// --- 2. LOGIN (DENGAN COOKIE FIX) ---
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validasi Input
    if (!email || !password) {
      return res.status(400).json({ msg: "Email dan Password wajib diisi!" });
    }

    // Cek User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ msg: "Email tidak ditemukan" });

    // Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Password salah" });

    // Buat Token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "rahasia_negara_123",
      { expiresIn: "1d" }, // Token expired 1 hari
    );

    // --- BAGIAN PENTING: SET COOKIE ---
    // Ini yang membuat ChatBot bisa baca status login lintas domain (Vercel Frontend -> Vercel Backend)
    res.cookie("token", token, {
      httpOnly: true, // Aman dari serangan XSS (JS gak bisa baca)
      secure: true, // Wajib TRUE karena Vercel pakai HTTPS
      sameSite: "none", // Wajib NONE biar bisa nyebrang domain
      maxAge: 24 * 60 * 60 * 1000, // 1 Hari
    });

    // Kirim Respon JSON
    res.json({
      msg: "Login berhasil",
      token, // Dikirim juga buat cadangan (misal perlu di localstorage)
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error Login:", error);
    res.status(500).json({ msg: "Login gagal", error: error.message });
  }
};

// --- 3. LOGOUT (HAPUS COOKIE) ---
const logout = async (req, res) => {
  try {
    // Hapus cookie token
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({ msg: "Logout berhasil" });
  } catch (error) {
    res.status(500).json({ msg: "Logout gagal" });
  }
};

// --- 4. EXPORT ---
module.exports = { register, login, logout };

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 1. Coba ambil token dari Cookie (Prioritas Utama)
  let token = req.cookies.token;

  // 2. Kalau gak ada di cookie, coba cek Header Authorization (Cadangan)
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 3. Kalau masih gak ada, tolak!
  if (!token) {
    return res.status(401).json({ msg: "Akses ditolak, silakan login dulu." });
  }

  try {
    // 4. Verifikasi Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia_negara_123");
    req.user = decoded; // Simpan data user (id, email) ke request
    next(); // Lanjut ke Controller
  } catch (err) {
    return res.status(401).json({ msg: "Token tidak valid." });
  }
};

module.exports = verifyToken;

// server/middleware/auth.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 1. Ambil token dari Header (Authorization: Bearer <token>)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Ambil kata kedua setelah "Bearer"

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  try {
    // 2. Verifikasi Token dengan Kunci Rahasia
    const verified = jwt.verify(token, process.env.JWT_SECRET || "rahasiadapur");

    // 3. Simpan data user (dari token) ke dalam request object
    req.user = verified;

    next(); // Lanjut ke Controller
  } catch (error) {
    res.status(403).json({ error: "Invalid Token" });
  }
};

module.exports = verifyToken;

const express = require("express");
const router = express.Router();
const { chatWithAI } = require("../controllers/chatController");
const verifyToken = require("../middleware/authMiddleware"); // Import Middleware

// Tambahkan verifyToken di sini agar rute ini TERPROTEKSI
router.post("/", verifyToken, chatWithAI);

module.exports = router;

// server/routes/authRoutes.js
const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Route register and login
router.post("/register", register);
router.post("/login", login);

module.exports = router;

// server/routes/transactionRoutes.js
const express = require("express");
const { getTransactions, createTransaction } = require("../controllers/transactionController");

const router = express.Router();

// GET /api/transactions/:userId (Ambil data)
router.get("/:userId", getTransactions);

// POST /api/transactions (Simpan data)
router.post("/", createTransaction);

module.exports = router;

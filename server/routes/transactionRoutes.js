const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const verifyToken = require("../middleware/auth"); // <--- Import Satpam

// Pasang verifyToken di tengah
// Artinya: Cek Token dulu -> Baru boleh masuk Controller
router.post("/", verifyToken, transactionController.addTransaction);

// Ubah route GET (Hapus /:userId karena kita ambil dari token)
router.get("/", verifyToken, transactionController.getTransactions);

router.delete("/:id", verifyToken, transactionController.deleteTransaction);
router.put("/:id", verifyToken, transactionController.updateTransaction);

module.exports = router;

const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const verifyToken = require("../middleware/authMiddleware"); // <--- Pastikan import middleware

router.get("/", verifyToken, budgetController.getBudgetStatus);

// POST: Tambah Budget
router.post("/", verifyToken, budgetController.setBudget);

// DELETE: Hapus Budget
router.delete("/:id", verifyToken, budgetController.deleteBudget);

// UPDATE: (Jika ada fitur edit budget)
// router.put("/:id", verifyToken, budgetController.updateBudget);

module.exports = router;

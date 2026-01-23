const express = require("express");
const { getGoals, createGoal, addSaving, deleteGoal } = require("../controllers/goalController");

const router = express.Router();

router.get("/:userId", getGoals);
router.post("/", createGoal);
router.put("/:id/save", addSaving); // Route khusus buat nabung
router.delete("/:id", deleteGoal);

module.exports = router;

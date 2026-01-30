const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goalController");
const verifyToken = require("../middleware/auth");

router.get("/", verifyToken, goalController.getGoals); // Hapus /:userId
router.post("/", verifyToken, goalController.createGoal);
router.put("/:id/save", verifyToken, goalController.addSaving);
router.delete("/:id", verifyToken, goalController.deleteGoal);

module.exports = router;

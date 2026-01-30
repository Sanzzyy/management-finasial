const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, scheduleController.getSchedules); // Hapus /:userId
router.post("/", verifyToken, scheduleController.createSchedule);
router.put("/:id", verifyToken, scheduleController.updateSchedule);
router.delete("/:id", verifyToken, scheduleController.deleteSchedule);

module.exports = router;

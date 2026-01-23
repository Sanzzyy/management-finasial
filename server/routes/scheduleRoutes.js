const express = require("express");
const { getSchedules, createSchedule, deleteSchedule, updateSchedule } = require("../controllers/scheduleController");

const router = express.Router();

router.get("/:userId", getSchedules);
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

module.exports = router;

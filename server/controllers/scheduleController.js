const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. GET ALL SCHEDULES (By User)
exports.getSchedules = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil dari Token
    const schedules = await prisma.schedule.findMany({
      where: { userId: userId },
      orderBy: { time: "asc" }, // Urutkan berdasarkan jam
    });
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching schedules" });
  }
};

// 2. CREATE SCHEDULE
exports.createSchedule = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil dari Token
    const { subject, day, time, room, type } = req.body;

    const newSchedule = await prisma.schedule.create({
      data: {
        subject,
        day,
        time,
        room,
        type,
        userId: userId,
      },
    });
    res.json(newSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating schedule" });
  }
};

// 3. UPDATE SCHEDULE (Bisa untuk Edit Info ATAU Toggle Complete)
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    // Ambil semua kemungkinan data yang mau diupdate
    const { subject, day, time, room, type, isCompleted } = req.body;

    // Pastikan ID diubah jadi Angka (parseInt)
    const updatedSchedule = await prisma.schedule.updateMany({
      where: {
        id: parseInt(id), // <--- INI KUNCINYA (Fix Error 500)
        userId: userId, // Security: Pastikan punya user sendiri
      },
      data: {
        // Prisma otomatis abaikan field yang undefined
        subject,
        day,
        time,
        room,
        type,
        isCompleted,
      },
    });

    if (updatedSchedule.count === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ message: "Schedule updated", data: updatedSchedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ error: "Error updating schedule" });
  }
};

// 4. DELETE SCHEDULE
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Pastikan ID diubah jadi Angka (parseInt)
    const deleted = await prisma.schedule.deleteMany({
      where: {
        id: parseInt(id), // <--- INI KUNCINYA (Fix Error 500)
        userId: userId, // Security
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ error: "Error deleting schedule" });
  }
};

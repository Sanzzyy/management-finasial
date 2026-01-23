const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. Ambil Jadwal User
const getSchedules = async (req, res) => {
  try {
    const { userId } = req.params;
    const schedules = await prisma.schedule.findMany({
      where: { userId: parseInt(userId) },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 2. Tambah Jadwal
const createSchedule = async (req, res) => {
  try {
    const { subject, time, room, type, day, userId } = req.body;
    const newSchedule = await prisma.schedule.create({
      data: { subject, time, room, type, day, userId: parseInt(userId) },
    });
    res.status(201).json(newSchedule);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 3. Update Jadwal
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, time, room, type, day, isCompleted } = req.body;

    const updatedSchedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        subject,
        time,
        room,
        type,
        day,
        isCompleted, // Bisa update status selesai juga
      },
    });

    res.json(updatedSchedule);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 4. Hapus Jadwal
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.schedule.delete({
      where: { id: parseInt(id) },
    });
    res.json({ msg: "Jadwal dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { getSchedules, createSchedule, deleteSchedule, updateSchedule };

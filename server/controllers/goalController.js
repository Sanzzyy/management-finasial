const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Ambil Goals User
const getGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const goals = await prisma.goal.findMany({
      where: { userId: parseInt(userId) },
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Buat Goal Baru
const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, userId } = req.body;
    const newGoal = await prisma.goal.create({
      data: {
        title,
        targetAmount: parseFloat(targetAmount),
        savedAmount: 0, // Awal buat pasti 0
        userId: parseInt(userId),
      },
    });
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Nabung (Update savedAmount)
const addSaving = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body; // Jumlah uang yang ditabung

    // Ambil data lama dulu
    const goal = await prisma.goal.findUnique({ where: { id: parseInt(id) } });

    // Tambahkan uang baru ke uang lama
    const updatedGoal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: { savedAmount: goal.savedAmount + parseFloat(amount) },
    });

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Hapus Goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.goal.delete({ where: { id: parseInt(id) } });
    res.json({ msg: "Goal dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { getGoals, createGoal, addSaving, deleteGoal };

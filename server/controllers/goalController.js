const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil dari Token
    const goals = await prisma.goal.findMany({ where: { userId } });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: "Error fetching goals" });
  }
};

// POST
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil dari Token
    const { title, targetAmount } = req.body;

    const newGoal = await prisma.goal.create({
      data: {
        title,
        targetAmount: parseFloat(targetAmount),
        userId,
      },
    });
    res.json(newGoal);
  } catch (error) {
    res.status(500).json({ error: "Error creating goal" });
  }
};

// ADD SAVING (Nabung)
exports.addSaving = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Increment savedAmount
    const updatedGoal = await prisma.goal.update({
      where: { id: parseInt(id) },
      data: { savedAmount: { increment: parseFloat(amount) } },
    });
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: "Error saving money" });
  }
};

// DELETE
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.goal.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting goal" });
  }
};

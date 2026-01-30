// server/controllers/transactionController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.addTransaction = async (req, res) => {
  const { title, amount, type, category, priority } = req.body;

  const userId = req.user.id;
  try {
    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount: parseFloat(amount),
        type,
        category,
        userId: parseInt(userId),
        priority: priority || "NEED",
      },
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add transaction" });
  }
};

// 2. GET Transactions
exports.getTransactions = async (req, res) => {
  const userId = req.user.id;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { date: "desc" }, // Urutkan dari yang terbaru
    });
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// 3. DELETE TRANSACTION (FIXED ERROR 500)
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Gunakan deleteMany untuk memastikan user hanya menghapus miliknya sendiri
    const deleted = await prisma.transaction.deleteMany({
      where: {
        id: parseInt(id), // <--- PENTING: Ubah ke Integer
        userId: userId, // Security check
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Transaction not found or unauthorized" });
    }

    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
};

// 4. UPDATE TRANSACTION (FIXED ERROR 500)
exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, amount, type, category, priority } = req.body;

  try {
    const updated = await prisma.transaction.updateMany({
      where: {
        id: parseInt(id), // <--- PENTING: Ubah ke Integer
        userId: userId, // Security check
      },
      data: {
        title,
        amount: parseFloat(amount),
        type,
        category,
        priority,
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "Transaction not found or unauthorized" });
    }

    res.status(200).json({ message: "Transaction updated", data: updated });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
};

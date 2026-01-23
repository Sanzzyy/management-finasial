// server/controllers/transactionController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. Ambil Semua Transaksi (Berdasarkan ID User)
const getTransactions = async (req, res) => {
  try {
    const { userId } = req.params; // Kita ambil ID dari URL

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: parseInt(userId), // Pastikan jadi angka
      },
      orderBy: {
        date: "desc", // Urutkan dari yang terbaru
      },
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 2. Tambah Transaksi Baru
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, userId } = req.body;

    const newTransaction = await prisma.transaction.create({
      data: {
        title,
        amount: parseFloat(amount), // Pastikan jadi angka desimal/float
        type, // "INCOME" atau "EXPENSE"
        category, // "Makanan", "Transport", dll
        userId: parseInt(userId),
      },
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = { getTransactions, createTransaction };

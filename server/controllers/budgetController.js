const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 1. Set/Update Budget (SECURED & CLEANED)
exports.setBudget = async (req, res) => {
  try {
    // AMBIL USER ID DARI TOKEN (Bukan dari body)
    const userId = req.user.id;
    const { category, limit } = req.body;

    // --- LOGIKA PEMBERSIHAN DATA (SANITIZATION) ---
    let cleanLimit = 0;

    // Handle input string "Rp 500.000" -> 500000
    if (typeof limit === "string") {
      cleanLimit = parseFloat(limit.replace(/[^0-9,]/g, "").replace(/,/g, "."));
    } else {
      cleanLimit = parseFloat(limit);
    }

    if (isNaN(cleanLimit)) cleanLimit = 0;

    // ----------------------------------------------

    // Upsert: Update kalau ada, Create kalau belum ada
    const budget = await prisma.budget.upsert({
      where: {
        // Pastikan di schema.prisma ada @@unique([userId, category])
        userId_category: {
          userId: userId,
          category: category,
        },
      },
      update: { limit: cleanLimit },
      create: {
        userId: userId,
        category: category,
        limit: cleanLimit,
      },
    });

    res.status(200).json(budget);
  } catch (error) {
    console.error("Error setting budget:", error);
    res.status(500).json({ error: "Gagal mengatur budget" });
  }
};

// 2. Get Budget Status (OPTIMIZED PERFORMANCE)
exports.getBudgetStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil dari Token

    // A. Ambil semua budget user ini (Query 1)
    const budgets = await prisma.budget.findMany({
      where: { userId: userId },
    });

    // B. Hitung Range Tanggal (Awal - Akhir Bulan Ini)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // C. TEKNIK GROUP BY (Query 2 - Jauh lebih cepat daripada loop query)
    // Kita minta database hitung total per kategori sekaligus
    const expensesGrouped = await prisma.transaction.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: {
        userId: userId,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // D. Mapping Data di JavaScript (Memory)
    // Ubah array expensesGrouped jadi Object biar gampang dicari { Food: 50000, Transport: 20000 }
    const expenseMap = {};
    expensesGrouped.forEach((item) => {
      expenseMap[item.category] = item._sum.amount || 0;
    });

    // E. Gabungkan Budget dengan Pengeluaran Asli
    const budgetStatus = budgets.map((b) => {
      const spent = expenseMap[b.category] || 0; // Ambil dari map, kalau gak ada berarti 0
      const percentage = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;

      return {
        id: b.id,
        category: b.category,
        limit: b.limit,
        spent: spent,
        percentage: percentage.toFixed(1),
        isOverBudget: spent > b.limit,
      };
    });

    res.status(200).json(budgetStatus);
  } catch (error) {
    console.error("Error getting budget:", error);
    res.status(500).json({ error: "Gagal mengambil data budget" });
  }
};

// 3. Delete Budget (SECURED)
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // User yang request hapus

    // Gunakan deleteMany dengan filter userId
    // Ini trik keamanan: "Hapus budget dengan ID X, TAPI HANYA JIKA miliknya userId Y"
    const deleted = await prisma.budget.deleteMany({
      where: {
        id: parseInt(id),
        userId: userId, // <--- Kunci pengaman
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Budget tidak ditemukan atau bukan milik Anda" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ error: "Gagal menghapus budget" });
  }
};

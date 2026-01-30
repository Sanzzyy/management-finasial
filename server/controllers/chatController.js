const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PrismaClient } = require("@prisma/client");

// Load Env
require("dotenv").config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; // AMBIL DARI TOKEN (Middleware)

    // 1. Ambil Data Keuangan User (Biar AI gak halusinasi)
    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { date: "desc" },
      take: 10, // Ambil 10 transaksi terakhir sebagai konteks
    });

    const budgets = await prisma.budget.findMany({
      where: { userId: userId },
    });

    // Hitung ringkasan sederhana
    const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // 2. Susun Prompt untuk AI (Context Injection)
    const contextPrompt = `
      Kamu adalah FinBot, asisten keuangan pribadi yang ramah dan bijak.
      
      DATA KEUANGAN USER SAAT INI:
      - Sisa Saldo: Rp ${balance.toLocaleString("id-ID")}
      - Total Pemasukan (Sample): Rp ${totalIncome.toLocaleString("id-ID")}
      - Total Pengeluaran (Sample): Rp ${totalExpense.toLocaleString("id-ID")}
      - Transaksi Terakhir: ${JSON.stringify(transactions.map((t) => `${t.title} (${t.amount})`))}
      - Budget Aktif: ${JSON.stringify(budgets.map((b) => b.category))}

      PERTANYAAN USER: "${message}"

      INSTRUKSI:
      - Jawablah berdasarkan data di atas jika relevan.
      - Berikan saran keuangan yang praktis, singkat, dan memotivasi.
      - Gunakan bahasa Indonesia yang santai tapi sopan.
      - Jika data kosong, ajak user untuk mulai mencatat transaksi.
    `;

    // 3. Panggil Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const text = response.text();

    // 4. Kirim Balasan
    res.json({ reply: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ msg: "Maaf, FinBot lagi error sistem.", error: error.message });
  }
};

module.exports = { chatWithAI };

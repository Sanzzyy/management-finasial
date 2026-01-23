const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  try {
    const { message, userId } = req.body;

    // 1. Ambil Data Keuangan User (Untuk Konteks)
    const transactions = await prisma.transaction.findMany({
      where: { userId: parseInt(userId) },
    });

    // Hitung ringkasan sederhana
    const income = transactions.filter((t) => t.type === "INCOME").reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((acc, curr) => acc + curr.amount, 0);
    const balance = income - expense;

    // 2. Siapkan Prompt untuk AI
    // Kita kasih tahu AI siapa dia dan data user saat ini
    const systemPrompt = `
      Kamu adalah asisten keuangan pribadi yang ramah dan pintar untuk aplikasi "DompetPintar".
      
      DATA KEUANGAN USER SAAT INI:
      - Total Pemasukan: Rp ${income.toLocaleString("id-ID")}
      - Total Pengeluaran: Rp ${expense.toLocaleString("id-ID")}
      - Sisa Saldo: Rp ${balance.toLocaleString("id-ID")}
      
      TUGAS KAMU:
      - Jawab pertanyaan user berdasarkan data di atas jika relevan.
      - Berikan saran keuangan yang singkat, padat, dan memotivasi.
      - Gunakan bahasa Indonesia yang santai dan gaul tapi sopan.
      - Jangan terlalu panjang lebar, maksimal 3-4 kalimat saja per jawaban.
      
      PERTANYAAN USER: "${message}"
    `;

    // 3. Kirim ke Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "Maaf, otakku lagi loading nih. Coba tanya lagi nanti ya! 🤖" });
  }
};

module.exports = { chatWithAI };

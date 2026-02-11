const { GoogleGenerativeAI } = require("@google/generative-ai");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  const { message } = req.body;

  // Guard clause login
  if (!req.user || !req.user.id) {
    return res.status(401).json({ reply: "Sesi habis." });
  }

  const userId = req.user.id;

  try {
    // 1. CEK MANUAL (REGEX)
    // Biar hemat kuota kalau cuma sapaan
    const sapaanRegex = /^(halo|hai|hi|hello|pagi|siang|sore|malam|test|tes|cek|p)\b/i;
    const userName = req.user.name || "Teman";
    const cleanMessage = message ? message.trim() : "";

    if (!cleanMessage || sapaanRegex.test(cleanMessage)) {
      return res.json({
        reply: `Halo ${userName}! 👋 Ada yang bisa Syzen AI bantu curhatin soal uang hari ini?`,
      });
    }

    // 2. AMBIL DATA
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: { title: true, amount: true, type: true, category: true, date: true },
      orderBy: { date: "desc" },
      take: 5,
    });

    const dataStatus = transactions.length === 0 ? "BELUM ADA DATA TRANSAKSI." : JSON.stringify(transactions);

    // 3. SYSTEM PROMPT (VERSI NATURAL & NO MARKDOWN)
    const systemPrompt = `
    PERAN: Kamu adalah "Asisten Management", teman asisten keuangan yang asik, suportif, dan gaul.
    USER: ${userName}
    DATA KEUANGAN: ${dataStatus}

    ATURAN FORMATTING (PENTING BIAR RAPI):
    1. **JANGAN PAKAI MARKDOWN**: Jangan gunakan tanda bintang (*) atau pagar (#). Teks harus bersih.
    2. **GANTI BULLET POINT DENGAN EMOJI**: Gunakan emoji seperti 💰, 💸, 👉, ✅ untuk membuat list.
    3. **GAYA BAHASA**: Santai, friendly, seperti chat sama teman akrab. Jangan kaku.

    CONTOH JAWABAN YANG DIMAU:
    "Oke, ini laporannya ya!
    💰 Pemasukan kamu: Rp 100.000 (dari Uang Jajan)
    💸 Pengeluaran: Rp 0
    ✅ Jadi sisa saldo kamu: Rp 100.000.
    
    Masih aman banget nih! Yuk jajan dikit tapi tetap catat ya! 😉"

    INSTRUKSI RESPON:
    - Jika user tanya "Analisa" atau "Saran": Berikan rangkuman pakai Emoji seperti contoh di atas.
    - Jika user tanya "Total": Langsung jawab angkanya dengan santai.
    - Jika data KOSONG: Ajak user input dengan semangat.

    PERTANYAAN USER: "${cleanMessage}"
    JAWABAN Syzen AI:
    `;

    // Kita pakai model 1.5-flash biar kuota aman & cepat
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ reply: "Aduh, Syzen AI lagi pusing nih. Tanya lagi nanti ya! 🤕" });
  }
};

module.exports = { chatWithAI };

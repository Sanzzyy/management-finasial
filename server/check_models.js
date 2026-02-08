// server/check_models.js
require("dotenv").config(); // Pastikan punya library 'dotenv'

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.models) {
      console.log("=== DAFTAR MODEL YANG TERSEDIA UNTUK KAMU ===");
      data.models.forEach((model) => {
        // Kita cari yang support 'generateContent'
        if (model.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- Nama: ${model.name}`);
          console.log(`  Deskripsi: ${model.description}`);
          console.log("------------------------------------------------");
        }
      });
    } else {
      console.log("Error:", data);
    }
  } catch (error) {
    console.error("Gagal fetch:", error);
  }
}

listModels();

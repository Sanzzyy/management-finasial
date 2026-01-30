import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import axios from "axios";

// Gunakan URL dari Env Vercel, kalau tidak ada (di laptop) baru pakai localhost
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";

axios.defaults.baseURL = apiUrl;
axios.defaults.withCredentials = true; // Wajib agar token/cookies bisa lewat
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

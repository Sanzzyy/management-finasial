import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "ManagementSmart",
        short_name: "DompetPintar",
        description: "Aplikasi Manajemen Keuangan Pribadi Terbaik",
        theme_color: "#0f172a", // Warna background status bar HP
        background_color: "#0f172a",
        display: "standalone", // Biar full screen kayak aplikasi native
        orientation: "portrait",
        icons: [
          {
            src: "/pwa-192x192.svg", // Kita akan buat icon ini nanti
            sizes: "192x192",
            type: "image/svg",
          },
          {
            src: "/pwa-512x512.svg", // Icon resolusi tinggi
            sizes: "512x512",
            type: "image/svg",
          },
          {
            src: "/pwa-512x512.svg",
            sizes: "512x512",
            type: "image/svg",
            purpose: "any maskable", // Agar icon pas di berbagai bentuk (bulat/kotak)
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001", // Sesuaikan dengan PORT backend kamu (5000 atau 5001)
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

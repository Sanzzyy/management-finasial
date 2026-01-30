import { useNavigate } from "react-router-dom";
import { Ghost, ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    // CONTAINER UTAMA: Fullscreen & Paling Atas (z-[99])
    <div className="fixed inset-0 z-[99] flex flex-col items-center justify-center bg-[#0f172a] p-4 md:p-6 text-center overflow-hidden">
      {/* --- BACKGROUND DECORATION (Glow Efek) --- */}
      {/* Ukuran blur disesuaikan biar gak terlalu "blinding" di HP */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 md:w-96 md:h-96 bg-blue-600/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 md:w-96 md:h-96 bg-indigo-600/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none"></div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
        {/* Animated Icon */}
        <div className="relative mb-6 md:mb-8 group">
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-2xl transition-all duration-500 group-hover:bg-blue-500/30"></div>
          {/* Responsive Size: w-24 (HP) -> w-32 (Laptop) */}
          <Ghost className="relative w-24 h-24 md:w-32 md:h-32  transition-transform duration-700 ease-in-out  text-blue-400" />
        </div>

        {/* Typography: Responsive Text Size */}
        <h1 className="mb-2 text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tighter drop-shadow-lg">404</h1>
        <h2 className="mb-3 md:mb-4 text-xl md:text-2xl font-bold text-white tracking-wide">Page Not Found</h2>
        <p className="max-w-xs md:max-w-md text-sm md:text-base text-gray-400 mb-8 md:mb-10 leading-relaxed mx-auto">Oops! It seems you've ventured into the void. The page you are looking for doesn't exist.</p>

        {/* --- PREMIUM BUTTON (Responsive Width) --- */}
        <button
          onClick={() => navigate("/dashboard")}
          className="group relative w-full md:w-auto inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 md:px-8 md:py-4 font-bold text-white shadow-xl shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] md:hover:scale-105 hover:shadow-blue-500/50 active:scale-95 cursor-pointer"
        >
          {/* Efek Kilatan (Shimmer) */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />

          {/* Icon Panah */}
          <ArrowLeft size={20} className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1" />

          <span className="relative z-10 tracking-wide text-sm md:text-base">Back to Dashboard</span>

          {/* Icon Home (Hiasan) */}
          <Home size={18} className="relative z-10 opacity-0 transition-all duration-300 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 hidden md:block " />
        </button>
      </div>
    </div>
  );
};

export default NotFound;

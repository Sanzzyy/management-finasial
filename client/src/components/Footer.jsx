import { Heart, Github, Instagram, Linkedin, Coffee, ExternalLink, WalletMinimal } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0f172a] border-t border-white/5 pt-10 pb-8 mt-auto">
      <div className="mx-auto max-w-7xl px-6">
        {/* --- TOP SECTION: GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* 1. BRANDING */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                <span className="font-bold text-white">
                  <WalletMinimal width={20} />
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-sans">
                Management<span className="text-blue-500">Smart</span>
              </h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">A personal finance management app designed to help students and young professionals master their cashflow intelligently.</p>
          </div>

          {/* 2. QUICK LINKS */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/dashboard" className="hover:text-blue-400 transition">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/schedule" className="hover:text-blue-400 transition">
                  Academic Schedule
                </a>
              </li>
              <li>
                <a href="/goals" className="hover:text-blue-400 transition">
                  Dream Goals
                </a>
              </li>
              <li>
                <a href="/report" className="hover:text-blue-400 transition">
                  Monthly Report
                </a>
              </li>
            </ul>
          </div>

          {/* 3. SUPPORT & SOCIALS */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support Developer</h3>
            <p className="text-sm text-gray-400 mb-4">Enjoying the app? Buy me a coffee to keep the code flowing! ☕</p>

            <a
              href="https://saweria.co/Syzen23"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#ffaa00] to-[#f59e0b] px-5 py-2.5 font-bold text-black shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/50 active:scale-95"
            >
              {/* Efek Kilatan (Shimmer) */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />

              {/* Icon Kopi (Goyang dikit pas hover) */}
              <Coffee size={18} className="relative z-10 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />

              <span className="relative z-10">Traktir Kopi</span>

              {/* Icon Panah (Geser dikit pas hover) */}
              <ExternalLink size={14} className="relative z-10 opacity-50 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a href="https://github.com/Sanzzyy" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition transform hover:scale-110">
                <Github size={20} />
              </a>
              <a href="https://www.instagram.com/syzen.web/" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-pink-500 transition transform hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/feed/" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-500 transition transform hover:scale-110">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: COPYRIGHT --- */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 text-center md:text-left">&copy; {new Date().getFullYear()} Management Smart. All rights reserved.</p>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Made with</span>
            <Heart size={12} className="text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
            <a href="https://github.com/Sanzzyy" className="font-bold text-gray-300 hover:text-blue-400 transition">
              Syzen (Sajid)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

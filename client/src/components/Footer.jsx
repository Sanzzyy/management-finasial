import { Heart, Github, Instagram, Linkedin, Coffee, ExternalLink } from "lucide-react";

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
                <span className="font-bold text-sm">💎</span>
              </div>
              <h2 className="text-lg font-bold text-white font-sans">
                Dompet<span className="text-blue-500">Pintar</span>
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

            {/* Saweria Button */}
            <a
              href="https://saweria.co/Syzen23"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#ffaa00] hover:bg-[#ffaa00]/90 text-black font-bold px-4 py-2.5 rounded-xl transition-transform hover:scale-105 shadow-lg shadow-orange-500/20"
            >
              <Coffee size={18} />
              <span>Support on Saweria</span>
              <ExternalLink size={14} className="opacity-50" />
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
          <p className="text-xs text-gray-500 text-center md:text-left">&copy; {new Date().getFullYear()} DompetPintar. All rights reserved.</p>

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

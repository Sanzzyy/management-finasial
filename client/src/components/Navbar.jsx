import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Import Lucide Icons
import { LayoutDashboard, CalendarRange, Target, BarChart3, LogOut, WalletMinimalIcon } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const menus = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={22} /> },
    { name: "Schedule", path: "/schedule", icon: <CalendarRange size={22} /> },
    { name: "Goals", path: "/goals", icon: <Target size={22} /> },
    { name: "Report", path: "/report", icon: <BarChart3 size={22} /> },
  ];

  if (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/") {
    return null;
  }

  return (
    <>
      {/* --- TOP NAVBAR (Desktop Only - Tetap Sama) --- */}
      <nav className="sticky top-0 z-40 w-full border-b-2 border-white/5 bg-[#0f172a]/80 backdrop-blur-xl transition-all duration-300 hidden md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* LOGO */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/dashboard")}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition-transform">
              <span className="font-bold text-xl">
                <WalletMinimalIcon />
              </span>
            </div>
            <div className="block">
              <h1 className="text-lg font-bold leading-none text-white tracking-wide font-sans">
                Management<span className="text-blue-500">Smart</span>
              </h1>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">Premium Manager</p>
            </div>
          </div>

          {/* DESKTOP MENU */}
          <div className="flex items-center gap-1  bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
            {menus.map((menu, index) => {
              const isActive = location.pathname === menu.path;
              return (
                <button
                  key={index}
                  onClick={() => navigate(menu.path)}
                  className={`px-4 py-2 rounded-full text-[10px] lg:text-xs font-bold transition-all duration-300 flex items-center gap-2 hover:cursor-pointer ${
                    isActive ? "bg-[#1e293b] text-white shadow-sm border border-gray-700 scale-105" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {menu.icon} {menu.name}
                </button>
              );
            })}
          </div>

          {/* PROFILE */}
          <div className="flex items-center gap-4">
            <div className="border-r border-gray-700 pr-4">
              <p className="text-xs font-medium text-gray-400 capitalize hidden lg:block">{today}</p>
            </div>
            <div className="flex items-center gap-3 pl-2 group relative cursor-pointer">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-200">{user?.name?.split(" ")[0]}</p>
                <p className="text-[10px] text-gray-500">Student</p>
              </div>
              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 shadow-md border-2 border-[#0f172a]">
                <span className="font-bold text-white text-sm">{initial}</span>
              </div>
              {/* Logout */}
              <div className="absolute right-0 top-full mt-4 w-40 origin-top-right scale-0 transition-all duration-200 group-hover:scale-100 pt-2 z-50">
                <div className="rounded-xl bg-[#1e293b] border border-gray-700 p-1.5 shadow-xl">
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE TOP BAR (Logo & Profile Only) --- */}
      <div className="md:hidden  fixed top-0 w-full z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg">💎</div>
          <span className="font-bold text-white text-sm">
            Dompet<span className="text-blue-500">Pintar</span>
          </span>
        </div>
        <div className="flex items-center gap-3" onClick={handleLogout}>
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 shadow-md">
            <span className="font-bold text-white text-xs">{initial}</span>
          </div>
        </div>
      </div>

      {/* --- MOBILE DOCK (BOTTOM NAVIGATION) --- */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[90%]">
        {/* Container Dock */}
        <div className="flex items-end justify-around bg-[#1e293b]/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-3xl shadow-2xl ring-1 ring-black/20">
          {menus.map((menu, index) => {
            const isActive = location.pathname === menu.path;

            return (
              <button
                key={index}
                onClick={() => navigate(menu.path)}
                className={`
                  relative flex flex-col items-center justify-center w-14
                  transition-all duration-300 group hover:cursor-pointer 
                `}
              >
                {/* 1. Indikator Glow di belakang (Hanya Aktif) */}
                {isActive && <div className="absolute -top-3 w-12 h-12 bg-blue-500/30 blur-xl rounded-full"></div>}

                {/* 2. ICON: Geser ke atas (-translate-y-1) kalau aktif supaya muat teks dibawahnya */}
                <div
                  className={`
                      z-10 transition-all duration-300 ease-out
                      ${isActive ? "-translate-y-6 text-blue-400 scale-150" : "text-gray-500 hover:text-gray-300 translate-y-0"}
                    `}
                >
                  {menu.icon}
                </div>

                {/* 3. TEKS: Muncul dari bawah dengan opacity */}
                <span
                  className={`
                      absolute bottom-0 text-[10px] font-bold tracking-wide whitespace-nowrap
                      transition-all duration-300 ease-out
                      ${isActive ? "opacity-100 translate-y-0 text-white" : "opacity-0 translate-y-3"}
                    `}
                >
                  {menu.name}
                </span>

                {/* 4. Dot Kecil di bawah teks (Opsional, style iOS) */}
                {isActive && <span className="absolute -bottom-2 w-1 h-1 bg-blue-500 rounded-full"></span>}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;

import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 1. State untuk Loading
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 2. Kunci tombol saat mulai proses
    setMsg(""); // Bersihkan pesan error sebelumnya

    try {
      // Menggunakan axios yang sudah diset global base URL-nya
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      setMsg("Register Berhasil! Mengalihkan ke Login...");

      // Beri jeda sedikit agar user bisa baca pesan sukses
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      } else {
        setMsg("Terjadi kesalahan jaringan atau server tidak merespon.");
      }
      setIsLoading(false); // Buka kunci jika error, supaya bisa coba lagi
    }
    // Catatan: Jika sukses, kita tidak perlu set isLoading(false) karena halaman akan pindah.
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden font-sans">
      {/* Background Decoration (Glow Efek) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl bg-[#1e293b]/90 backdrop-blur-xl border border-white/5 p-8 shadow-2xl relative z-10">
        {/* Header: Logo & Judul */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl shadow-lg shadow-blue-500/30 mb-4">💎</div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Register</h2>
          <p className="text-sm text-gray-400 mt-2">Create Account.</p>
        </div>

        {/* Notifikasi Error/Sukses */}
        {msg && (
          <div className={`mb-6 rounded-xl p-3 text-center text-sm font-bold border ${msg.includes("Berhasil") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Your Name</label>
            <input
              type="text"
              className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
              placeholder="Contoh: Syzen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading} // Input juga dimatikan saat loading
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Alamat Email</label>
            <input
              type="email"
              className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
              placeholder="email@your.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Password</label>
            <input
              type="password"
              className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition disabled:opacity-50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* TOMBOL REGISTER DENGAN LOADING STATE */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-xl py-3.5 font-bold text-white shadow-lg transition-all transform 
              ${isLoading ? "bg-gray-500 cursor-not-allowed opacity-70" : "bg-blue-600 hover:bg-blue-500 hover:shadow-lg active:scale-95"}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Mendaftarkan...</span>
              </div>
            ) : (
              "Register Now"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className={`font-bold text-blue-400 hover:text-blue-300 transition hover:underline ${isLoading ? "pointer-events-none opacity-50" : ""}`}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

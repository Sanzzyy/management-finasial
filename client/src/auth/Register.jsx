import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      setMsg("Register Berhasil! Mengalihkan...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      } else {
        setMsg("Terjadi kesalahan jaringan");
      }
    }
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Buat Akun Baru</h2>
          <p className="text-sm text-gray-400 mt-2">Mulai atur keuanganmu sekarang.</p>
        </div>

        {/* Notifikasi Error/Sukses */}
        {msg && (
          <div className={`mb-6 rounded-xl p-3 text-center text-sm font-bold border ${msg.includes("Berhasil") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>{msg}</div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Nama Lengkap</label>
            <input
              type="text"
              className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              placeholder="Contoh: Sajid Izzulhaq"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Alamat Email</label>
            <input
              type="email"
              className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              placeholder="email@kamu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Password</label>
            <input
              type="password"
              className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition transform active:scale-95"
          >
            Daftar Sekarang
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 transition hover:underline">
            Login disini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

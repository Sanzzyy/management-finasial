import { useState } from "react";
import axios from "axios";
import { WalletMinimal } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Tambahkan ini
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 1. Kunci tombol saat mulai
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      // Simpan data user
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMsg("Login Berhasil! Masuk ke Dashboard...");

      // Arahkan ke Dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        setMsg(error.response.data.msg);
      } else {
        setMsg("Terjadi kesalahan jaringan");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden font-sans">
      {/* Background Decoration (Glow Efek) - Sama dengan Register */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl bg-[#1e293b]/90 backdrop-blur-xl border border-white/5 p-8 shadow-2xl relative z-10">
        {/* Header: Logo & Sapaan */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-2xl shadow-lg shadow-blue-500/30 mb-4 text-white">
            <WalletMinimal />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Login</h2>
          <p className="text-sm text-gray-400 mt-2">Start managing your finances now.</p>
        </div>

        {/* Notifikasi Error/Sukses */}
        {msg && (
          <div className={`mb-6 rounded-xl p-3 text-center text-sm font-bold border ${msg.includes("Berhasil") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>{msg}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Email</label>
            <input
              type="email"
              className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              placeholder="email@your.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
            </div>
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
            disabled={isLoading} // Matikan fungsi klik jika loading
            className={`
              w-full py-3 rounded-xl font-bold transition-all text-white
              ${
                isLoading
                  ? "bg-gray-500 cursor-not-allowed opacity-70" // Gaya saat loading (Abu-abu)
                  : "bg-blue-600 hover:bg-blue-500 hover:shadow-lg active:scale-95" // Gaya normal
              }
            `}
          >
            {/* Ganti teks tombol sesuai kondisi */}
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Memproses...</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-700/50 pt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account ?{" "}
            <Link to="/register" className="font-bold text-blue-400 hover:text-blue-300 transition hover:underline">
              Register for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

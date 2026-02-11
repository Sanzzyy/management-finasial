import { useState, useRef, useEffect } from "react";
import api from "../api/axios"; // Pastikan ini mengarah ke axios yang ada withCredentials: true
import { MessageCircle, Send, Bot, User, Sparkles, ChevronDown, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Halo! Aku Syzen AI 🤖. Mau cek kesehatan finansialmu hari ini?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick Prompts
  const quickPrompts = ["Analisa keuanganku 📊", "Saran hemat dong 💡", "Total pengeluaran bulan ini? 💸", "Target tabunganku aman? 🎯"];

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]); // Tambahkan isOpen biar pas dibuka langsung scroll bawah

  const handleSend = async (textInput = null) => {
    let userMessage = input;

    if (textInput && typeof textInput !== "string") {
      textInput.preventDefault();
    } else if (typeof textInput === "string") {
      userMessage = textInput;
    }

    if (!userMessage.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // --- 1. TAMPILKAN PESAN USER (Cukup sekali di sini) ---
    setMessages((prev) => [...prev, { role: "user", text: userMessage, time: timeNow }]);
    setInput("");

    const user = JSON.parse(localStorage.getItem("user"));
    const restrictedPaths = ["/", "/login", "/register"];
    const isRestrictedPage = restrictedPaths.includes(location.pathname);

    // --- LOGIKA PENGECEKAN LOGIN ---
    if (!user || isRestrictedPage) {
      setIsLoading(true);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Eits, akses ditolak! 🔒\n\nKamu harus Login dulu untuk ngobrol sama aku. Data keuanganmu bersifat rahasia lho!",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsLoading(false);
      }, 500);

      if (isRestrictedPage) {
        localStorage.removeItem("user");
      }
      return; // STOP DISINI
    }

    // --- JIKA LOLOS PENGECEKAN ---
    setIsLoading(true);

    // HAPUS setMessages YANG TADI ADA DISINI (Baris 73 di kode lamamu)

    try {
      const response = await api.post("/chat", {
        message: userMessage,
      });

      setMessages((prev) => [...prev, { role: "ai", text: response.data.reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch (error) {
      console.error("Chat Error:", error);

      let errorMsg = "Maaf, aku lagi pusing. Coba lagi nanti ya.";
      if (error.response?.status === 401) {
        errorMsg = "Sesi kamu habis atau belum login. Silakan login ulang ya! 🔒";
      }

      setMessages((prev) => [...prev, { role: "ai", text: errorMsg, time: timeNow }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: "ai", text: "Chat berhasil dibersihkan. Ada yang lain? ✨", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  };

  return (
    <div className="fixed bottom-24 right-4 z-[60] md:bottom-10 md:right-10 font-sans">
      <style>{`
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background-color: #475569; }
        
        @keyframes messagePop {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-message { animation: messagePop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* --- CHAT WINDOW --- */}
      {isOpen && (
        <div className="flex flex-col mb-4 w-[90vw] h-[550px] md:w-[400px] md:h-[600px] bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden transform transition-all duration-300 origin-bottom-right animate-message">
          {/* 1. HEADER */}
          <div className="bg-[#1e293b]/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/5 shadow-md z-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-white/10">
                  <Bot size={20} className="text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1e293b] rounded-full"></span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm flex items-center gap-1">
                  Syzen AI <Sparkles size={12} className="text-amber-400 fill-amber-400 animate-pulse" />
                </h3>
                <p className="text-blue-200/60 text-[10px] font-medium tracking-wide">Personal Assistant</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={clearChat} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition" title="Clear Chat">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition">
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* 2. MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 chat-scroll bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 animate-message ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${msg.role === "user" ? "bg-gray-700" : "bg-gradient-to-br from-blue-600 to-indigo-600"}`}>
                  {msg.role === "user" ? <User size={14} className="text-gray-300" /> : <Bot size={14} className="text-white" />}
                </div>

                <div className={`flex flex-col max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === "user" ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none" : "bg-[#1e293b] border border-white/10 text-gray-200 rounded-tl-none shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 px-1 opacity-70">{msg.time}</span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 animate-message">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-[#1e293b] border border-white/10 px-4 py-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 3. QUICK PROMPTS */}
          {!isLoading && messages.length < 10 && (
            <div className="px-4 py-2 flex gap-2 overflow-x-auto chat-scroll border-t border-white/5 bg-[#0f172a]/80 backdrop-blur">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="flex-shrink-0 px-3 py-1.5 bg-[#1e293b] hover:bg-blue-600/20 hover:text-blue-300 border border-white/10 hover:border-blue-500/30 rounded-full text-[10px] sm:text-xs text-gray-300 transition-all duration-200 active:scale-95 whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* 4. INPUT AREA */}
          <div className="p-3 bg-[#1e293b]/90 backdrop-blur-md border-t border-white/10">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <input
                type="text"
                placeholder="Tanya apa saja..."
                className="w-full bg-[#0f172a] text-white text-sm pl-4 pr-12 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-white/10 transition-all placeholder:text-gray-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                <Send size={16} className={isLoading ? "opacity-0" : "ml-0.5"} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- FLOATING BUTTON --- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 hover:scale-110 text-white rounded-[1.2rem] shadow-2xl shadow-blue-600/40 transition-all duration-300 active:scale-95 z-[60]"
        >
          <MessageCircle size={28} className="fill-white/20" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#0f172a]"></span>
          </span>
          <span className="absolute right-full mr-3 bg-white text-[#0f172a] px-2 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">Tanya AI</span>
        </button>
      )}
    </div>
  );
};

export default ChatAssistant;

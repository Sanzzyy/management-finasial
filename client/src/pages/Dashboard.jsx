import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Import Lucide Icons
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  ArrowRight,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Utensils,
  Bus,
  Smartphone,
  ShoppingCart,
  Film,
  Gift,
  Settings,
  Activity,
  Sun,
  Moon,
  CloudSun,
  CircleCheckBig,
  AlertTriangle,
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // State Form Input
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [category, setCategory] = useState("Food");

  // State Filter & Simulation
  const [filterType, setFilterType] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [weeklySaving, setWeeklySaving] = useState("");
  const [projection, setProjection] = useState(0);

  // State Greeting
  const [greeting, setGreeting] = useState({ text: "Hello", icon: <Sun /> });

  const navigate = useNavigate();

  // Helper: Format Currency
  const formatCurrency = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    let formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setAmount(formatted);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchTransactions(userData.id);
      determineGreeting(); // Cek waktu untuk sapaan
    }
  }, []);

  // --- LOGIC GREETING (NEW) ---
  const determineGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting({ text: "Good Morning", icon: <Sun className="text-amber-400" /> });
    } else if (hour < 18) {
      setGreeting({ text: "Good Afternoon", icon: <CloudSun className="text-orange-400" /> });
    } else {
      setGreeting({ text: "Good Evening", icon: <Moon className="text-blue-400" /> });
    }
  };

  const fetchTransactions = async (userId) => {
    try {
      const response = await axios.get(`/api/transactions/${userId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replaceAll(".", ""));
    try {
      await axios.post("/api/transactions", {
        title,
        amount: cleanAmount,
        type,
        category,
        userId: user.id,
      });
      setTitle("");
      setAmount("");
      fetchTransactions(user.id);
    } catch (error) {
      alert("Failed to save transaction");
    }
  };

  const calculateProjection = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    let formatted = val.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setWeeklySaving(formatted);
    if (val) setProjection(parseInt(val) * 4 * 6);
    else setProjection(0);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "ALL" && t.type !== filterType) return false;
    if (filterCategory !== "ALL" && t.category !== filterCategory) return false;
    return true;
  });

  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const chartData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ["#10b981", "#ef4444"],
        borderColor: "#1e293b",
        borderWidth: 2,
      },
    ],
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Food":
        return <Utensils size={14} />;
      case "Transport":
        return <Bus size={14} />;
      case "Data":
        return <Smartphone size={14} />;
      case "Shopping":
        return <ShoppingCart size={14} />;
      case "Entertainment":
        return <Film size={14} />;
      case "Allowance":
        return <DollarSign size={14} />;
      default:
        return <Settings size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 selection:bg-blue-500 selection:text-white pb-10 pt-20 md:pt-0">
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        {/* --- WELCOME HEADER (NEW) --- */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
              {greeting.icon} <span>{greeting.text}</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{user?.name?.split(" ")[0]}!</span> 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here is your financial overview for today.</p>
          </div>
          <div className="hidden md:block text-right">
            <div className="bg-[#1e293b] px-4 py-2 rounded-xl border border-gray-700 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Today</p>
                <p className="text-sm font-bold text-white">{new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- TOP SECTION (GRID 3 COLUMNS) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* 1. BALANCE CARD */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex-1 relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-900 via-[#1e293b] to-[#0f172a] p-8 shadow-2xl flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition duration-500"></div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 rounded-full bg-blue-500/20">
                    <Wallet size={16} className="text-blue-400" />
                  </div>
                  <p className="text-blue-200 text-xs font-bold tracking-widest uppercase">Total Balance</p>
                </div>
                <h1 className={`text-4xl lg:text-5xl font-extrabold tracking-tight mt-3 ${balance < 0 ? "text-red-400" : "text-white"}`}>{formatCurrency(balance)}</h1>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-[#0f172a]/50 p-3 rounded-2xl backdrop-blur-sm">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <TrendingUp size={12} /> Income
                  </p>
                  <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-[#0f172a]/50 p-3 rounded-2xl backdrop-blur-sm">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <TrendingDown size={12} /> Expense
                  </p>
                  <p className="text-lg font-bold text-red-400 flex items-center gap-1">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. MIDDLE: CHART & SIMULATION */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex-1 rounded-3xl bg-[#1e293b] p-5 shadow-xl flex flex-col justify-center relative overflow-hidden">
              <div className="flex items-center gap-6 z-10">
                <div className="h-28 w-28 relative flex-shrink-0">
                  <Doughnut data={chartData} options={{ cutout: "70%", plugins: { legend: { display: false } } }} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <PieChart size={24} className="text-gray-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                    <Activity size={16} className="text-blue-400" /> Financial Health
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3 flex items-center gap-1">
                    {totalExpense > totalIncome ? (
                      <>
                        <AlertTriangle size={14} className="text-yellow-500" />
                        <span>High spending! Watch out.</span>
                      </>
                    ) : (
                      <>
                        <CircleCheckBig size={14} className="text-green-500" />
                        <span>Good condition. Keep it up.</span>
                      </>
                    )}
                  </p>
                  <div className="text-[10px] font-bold text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-full w-fit">{totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}% Used</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-[#1e293b] p-5 shadow-xl flex items-center justify-between relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-full"></div>
              <div className="flex-1 mr-4">
                <p className="text-[10px] text-amber-500 font-bold uppercase mb-1 flex items-center gap-1">
                  <Target size={12} /> Saving Goal
                </p>
                <div className="flex items-center gap-2 border-b-1 border-amber-500">
                  <span className="text-gray-500 text-sm">Rp</span>
                  <input type="text" placeholder="0" className="bg-transparent text-lg font-bold text-white placeholder-gray-600 focus:outline-none w-full" value={weeklySaving} onChange={calculateProjection} />
                  <span className="text-xs text-gray-600">/week</span>
                </div>
              </div>
              <div className="text-right bg-[#0f172a] px-4 py-2 rounded-xl">
                <p className="text-[10px] text-gray-500">6 Months Result</p>
                <p className="text-sm font-bold text-amber-400">{formatCurrency(projection)}</p>
              </div>
            </div>
          </div>

          {/* 3. RIGHT: QUICK INPUT */}
          <div className="lg:col-span-4">
            <div className="h-full rounded-3xl bg-[#1e293b] p-6 shadow-xl flex flex-col justify-center relative">
              <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                <ArrowRight size={16} className="text-blue-400" /> Quick Transaction
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-1 bg-[#0f172a] p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setType("EXPENSE")}
                    className={`py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${type === "EXPENSE" ? "bg-red-500 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    <TrendingDown size={14} /> Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("INCOME")}
                    className={`py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${type === "INCOME" ? "bg-emerald-500 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    <TrendingUp size={14} /> Income
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Description (e.g. Lunch)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-2xl bg-[#0f172a] px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
                  />
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-bold text-xs">Rp</span>
                    <input
                      type="text"
                      placeholder="0"
                      value={amount}
                      onChange={handleAmountChange}
                      required
                      className="w-full rounded-2xl bg-[#0f172a] pl-10 pr-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full appearance-none rounded-2xl bg-[#0f172a] px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Data">Data / Bill</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Allowance">Allowance</option>
                        <option value="Others">Others</option>
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                        <Filter size={12} />
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 font-bold shadow-lg shadow-blue-900/20 transition active:scale-95 flex items-center justify-center">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* --- BOTTOM SECTION: HISTORY --- */}
        <div className="rounded-3xl bg-[#1e293b] border border-gray-800 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e293b] sticky top-0 z-10">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" /> Transaction History
              </h3>
              <p className="text-xs text-gray-500">Track your financial flow.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="bg-[#0f172a] p-1 rounded-xl flex w-full sm:w-auto">
                {["ALL", "INCOME", "EXPENSE"].map((ft) => (
                  <button
                    key={ft}
                    onClick={() => setFilterType(ft)}
                    className={`flex-1 sm:flex-none px-4 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition text-center ${filterType === ft ? "bg-gray-700 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    {ft === "ALL" ? "All" : ft.charAt(0) + ft.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-auto">
                <select
                  className="bg-[#0f172a] text-white text-xs font-bold px-4 py-3 sm:py-2 border border-gray-700 focus:outline-none w-full sm:w-auto appearance-none pr-8"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Data">Data</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Allowance">Allowance</option>
                  <option value="Others">Others</option>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-gray-500">
                  <Filter size={12} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1e293b] p-2 md:p-4">
            {filteredTransactions.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center opacity-50">
                <Search size={48} className="mb-2 text-gray-600" />
                <p className="text-sm text-gray-400">No transactions found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((t) => (
                  <div key={t.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#0f172a]/50 border border-gray-800/50 hover:bg-[#0f172a] hover:border-gray-700 transition cursor-default">
                    <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0">
                      <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center shadow-sm ${t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {t.type === "INCOME" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200 text-sm md:text-base line-clamp-1">{t.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700/50 flex items-center gap-1">
                            {getCategoryIcon(t.category)} {t.category}
                          </span>
                          <span className="text-[10px] text-gray-600 flex items-center gap-1">• {new Date(t.date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right pl-14 sm:pl-0">
                      <p className={`text-sm md:text-lg font-bold ${t.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                        {t.type === "INCOME" ? "+ " : "- "}
                        {formatCurrency(t.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

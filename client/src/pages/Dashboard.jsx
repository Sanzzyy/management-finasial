import { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Components
import BudgetCard from "../components/BudgetCard";

// Icons
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  ArrowRight,
  Filter,
  Calendar,
  DollarSign,
  Utensils,
  Bus,
  Smartphone,
  ShoppingCart,
  Film,
  Settings,
  Activity,
  Sun,
  Moon,
  CloudSun,
  CircleCheckBig,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  ChevronDown,
  Edit2,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

// Update untuk trigger deploy vercel
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // --- STATE MANAGEMENT (GROUPED) ---
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // --- PAGINATION STATE ---
  // 1. Transaction Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // 2. Budget Pagination (BARU)
  const [budgetPage, setBudgetPage] = useState(1);
  const budgetItemsPerPage = 3; // Batas 3 konten per halaman

  // Filter State
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All Categories");

  // Loading States
  const [loadingState, setLoadingState] = useState({
    tx: false,
    budget: false,
    edit: false,
  });

  // Forms Data
  const [txForm, setTxForm] = useState({
    title: "",
    amount: "",
    type: "EXPENSE",
    category: "Food",
    priority: "NEED",
  });

  const [budgetForm, setBudgetForm] = useState({
    isOpen: false,
    category: "Food",
    limit: "",
  });

  const [editData, setEditData] = useState(null);

  // Simulation
  const [weeklySaving, setWeeklySaving] = useState("");
  const [projection, setProjection] = useState(0);
  const [greeting, setGreeting] = useState({ text: "Hello", icon: <Sun /> });

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return navigate("/login");

      const userData = JSON.parse(storedUser);
      setUser(userData.user || userData);

      determineGreeting();
      await Promise.all([fetchTransactions(), fetchBudgets()]);
    };
    loadData();
  }, []);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterCategory]);

  const determineGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: "Good Morning", icon: <Sun className="text-amber-400" /> });
    else if (hour < 18) setGreeting({ text: "Good Afternoon", icon: <CloudSun className="text-orange-400" /> });
    else setGreeting({ text: "Good Evening", icon: <Moon className="text-blue-400" /> });
  };

  // --- API FUNCTIONS ---
  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate("/login");
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budget");
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- HANDLERS ---
  const handleTxChange = (field, value) => {
    setTxForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmountFormat = (value) => {
    return value.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    setLoadingState((prev) => ({ ...prev, tx: true }));

    try {
      const cleanAmount = parseFloat(txForm.amount.replaceAll(".", ""));
      await api.post("/transactions", { ...txForm, amount: cleanAmount });

      // Reset & Refresh
      setTxForm({ ...txForm, title: "", amount: "", priority: "NEED" });
      await Promise.all([fetchTransactions(), fetchBudgets()]);

      Swal.fire({ icon: "success", title: "Saved!", timer: 1500, showConfirmButton: false, background: "#1e293b", color: "#fff" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not save transaction", background: "#1e293b", color: "#fff" });
    } finally {
      setLoadingState((prev) => ({ ...prev, tx: false }));
    }
  };

  const handleDeleteTransaction = async (id) => {
    const result = await Swal.fire({
      title: "Delete?",
      text: "Cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      background: "#1e293b",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/transactions/${id}`);
        await Promise.all([fetchTransactions(), fetchBudgets()]);
        Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false, background: "#1e293b", color: "#fff" });
      } catch (error) {
        Swal.fire("Error", "Failed to delete", "error");
      }
    }
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    if (!editData) return;
    setLoadingState((prev) => ({ ...prev, edit: true }));

    try {
      const cleanAmount = parseFloat(String(editData.amount).replace(/[^0-9.]/g, ""));
      await api.put(`/transactions/${editData.id}`, { ...editData, amount: cleanAmount });

      setEditData(null);
      await Promise.all([fetchTransactions(), fetchBudgets()]);

      Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false, background: "#1e293b", color: "#fff" });
    } catch (error) {
      Swal.fire("Error", "Failed to update", "error");
    } finally {
      setLoadingState((prev) => ({ ...prev, edit: false }));
    }
  };

  const handleSaveBudget = async () => {
    if (!budgetForm.limit) return;
    setLoadingState((prev) => ({ ...prev, budget: true }));

    try {
      const cleanLimit = parseFloat(budgetForm.limit.replace(/[^0-9]/g, ""));
      await api.post("/budget", { category: budgetForm.category, limit: cleanLimit });

      setBudgetForm({ isOpen: false, category: "Food", limit: "" });
      await fetchBudgets();

      Swal.fire({ icon: "success", title: "Budget Set!", timer: 1500, showConfirmButton: false, background: "#1e293b", color: "#fff" });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to save budget", background: "#1e293b", color: "#fff" });
    } finally {
      setLoadingState((prev) => ({ ...prev, budget: false }));
    }
  };

  const handleDeleteBudget = async (id) => {
    const result = await Swal.fire({
      title: "Delete Budget?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      background: "#1e293b",
      color: "#fff",
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/budget/${id}`);
        await fetchBudgets();
        Swal.fire({ title: "Deleted!", icon: "success", timer: 1500, showConfirmButton: false, background: "#1e293b", color: "#fff" });
      } catch (error) {
        Swal.fire("Error", "Failed", "error");
      }
    }
  };

  // --- MEMOIZED CALCULATIONS (PERFORMANCE BOOST) ---

  // 1. Transaction Filtering & Pagination
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = filterType === "All" || t.type === filterType.toUpperCase();
      const matchCategory = filterCategory === "All Categories" || t.category === filterCategory;
      return matchType && matchCategory;
    });
  }, [transactions, filterType, filterCategory]);

  const { currentTransactions, totalPages } = useMemo(() => {
    const lastIdx = currentPage * itemsPerPage;
    const firstIdx = lastIdx - itemsPerPage;
    return {
      currentTransactions: filteredTransactions.slice(firstIdx, lastIdx),
      totalPages: Math.ceil(filteredTransactions.length / itemsPerPage) || 1,
    };
  }, [filteredTransactions, currentPage]);

  // 2. Budget Pagination Logic (BARU)
  const { currentBudgets, totalBudgetPages } = useMemo(() => {
    const lastIdx = budgetPage * budgetItemsPerPage;
    const firstIdx = lastIdx - budgetItemsPerPage;
    return {
      currentBudgets: budgets.slice(firstIdx, lastIdx),
      totalBudgetPages: Math.ceil(budgets.length / budgetItemsPerPage) || 1,
    };
  }, [budgets, budgetPage]);

  // 3. Totals
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const income = transactions.filter((t) => t.type === "INCOME").reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions.filter((t) => t.type === "EXPENSE").reduce((acc, curr) => acc + curr.amount, 0);
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [transactions]);

  const chartData = useMemo(
    () => ({
      labels: ["Income", "Expense"],
      datasets: [
        {
          data: [totalIncome, totalExpense],
          backgroundColor: ["#10b981", "#ef4444"],
          borderColor: "#1e293b",
          borderWidth: 2,
        },
      ],
    }),
    [totalIncome, totalExpense],
  );

  const formatCurrency = (val) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 pb-10 pt-20 md:pt-0">
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
              {greeting.icon} <span>{greeting.text}</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{user?.name?.split(" ")[0] || "User"}!</span> 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here is your financial overview.</p>
          </div>
          {/* --- DATE WIDGET (MODERN GLASS) --- */}
          <div className="hidden md:flex items-center gap-3 bg-[#1e293b]/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 shadow-xl shadow-black/20 group hover:border-blue-500/30 transition-all duration-300 cursor-default">
            {/* Icon Box */}
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              <Calendar size={20} />
            </div>

            {/* Text Info */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 group-hover:text-blue-400 transition-colors">Today</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-100">{new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "long" })}</p>
                {/* Indikator Tahun (Optional) */}
                <span className="text-xs font-medium text-gray-600 px-1.5 py-0.5 rounded border border-gray-700">{new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOP SECTION: BALANCE & CHART & FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* 1. BALANCE CARD */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex-1 relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-900 via-[#1e293b] to-[#0f172a] p-8 shadow-2xl flex flex-col justify-between group border border-white/5">
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
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-[#0f172a]/50 p-3 rounded-2xl backdrop-blur-sm">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <TrendingDown size={12} /> Expense
                  </p>
                  <p className="text-lg font-bold text-red-400">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CHART & SAVING */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex-1 rounded-3xl bg-[#1e293b] p-5 shadow-xl flex flex-col justify-center relative overflow-hidden border border-white/5">
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
                        <AlertTriangle size={14} className="text-yellow-500" /> High spending!
                      </>
                    ) : (
                      <>
                        <CircleCheckBig size={14} className="text-green-500" /> Good condition.
                      </>
                    )}
                  </p>
                  <div className="text-[10px] font-bold text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-full w-fit">{totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}% Used</div>
                </div>
              </div>
            </div>
            {/* Savings Goal Calc */}
            <div className="rounded-3xl bg-[#1e293b] p-5 shadow-xl flex items-center justify-between relative overflow-hidden border border-white/5">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-full"></div>
              <div className="flex-1 mr-4">
                <p className="text-[10px] text-amber-500 font-bold uppercase mb-1 flex items-center gap-1">
                  <Target size={12} /> Saving Goal
                </p>
                <div className="flex items-center gap-2 border-b border-amber-500">
                  <span className="text-gray-500 text-sm">Rp</span>
                  <input
                    type="text"
                    placeholder="0"
                    className="bg-transparent text-lg font-bold text-white placeholder-gray-600 focus:outline-none w-full"
                    value={weeklySaving}
                    onChange={(e) => {
                      const val = handleAmountFormat(e.target.value);
                      setWeeklySaving(val);
                      const num = parseInt(val.replaceAll(".", "")) || 0;
                      setProjection(num * 4 * 6);
                    }}
                  />
                  <span className="text-xs text-gray-600">/week</span>
                </div>
              </div>
              <div className="text-right bg-[#0f172a] px-4 py-2 rounded-xl">
                <p className="text-[10px] text-gray-500">6 Months Result</p>
                <p className="text-sm font-bold text-amber-400">{formatCurrency(projection)}</p>
              </div>
            </div>
          </div>

          {/* 3. QUICK TRANSACTION FORM */}
          <div className="lg:col-span-4">
            <div className="h-full rounded-3xl bg-[#1e293b] p-6 shadow-xl flex flex-col justify-center relative border border-white/5">
              <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                <ArrowRight size={16} className="text-blue-400" /> Quick Transaction
              </h3>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-1 bg-[#0f172a] p-1 rounded-2xl">
                  {["EXPENSE", "INCOME"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTxChange("type", t)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${txForm.type === t ? (t === "INCOME" ? "bg-emerald-500" : "bg-red-500") + " text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                    >
                      {t === "INCOME" ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {t === "INCOME" ? "Income" : "Expense"}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Description"
                  required
                  value={txForm.title}
                  onChange={(e) => handleTxChange("title", e.target.value)}
                  className="w-full rounded-2xl bg-[#0f172a] px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
                />
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-bold text-xs">Rp</span>
                  <input
                    type="text"
                    placeholder="0"
                    required
                    value={txForm.amount}
                    onChange={(e) => handleTxChange("amount", handleAmountFormat(e.target.value))}
                    className="w-full rounded-2xl bg-[#0f172a] pl-10 pr-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition placeholder-gray-600"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={txForm.category}
                      onChange={(e) => handleTxChange("category", e.target.value)}
                      className="w-full appearance-none rounded-2xl bg-[#0f172a] px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Food">🍔 Food</option>
                      <option value="Transport">🛵 Transport</option>
                      <option value="Data">⚡ Bill</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Entertainment">🎬 Entertainment</option>
                      <option value="Allowance">💵 Allowance</option>
                      <option value="Others">Others</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-500">
                      <Filter size={12} />
                    </div>
                  </div>
                  <button type="submit" disabled={loadingState.tx} className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 font-bold shadow-lg shadow-blue-900/20 transition active:scale-95 flex items-center justify-center">
                    {loadingState.tx ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  </button>
                </div>
                {txForm.type === "EXPENSE" && (
                  <div className="flex gap-2 mb-3 bg-[#0f172a] p-1 rounded-xl">
                    {["NEED", "WANT"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleTxChange("priority", p)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition border ${txForm.priority === p ? (p === "NEED" ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-purple-600/20 border-purple-500 text-purple-400") : "border-transparent text-gray-500 hover:bg-white/5"}`}
                      >
                        {p === "NEED" ? "🛡️ Needs" : "✨ Wants"}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* BUDGETING SECTION (WITH PAGINATION) */}
        <div className="grid grid-cols-1 mb-8">
          <div className="rounded-3xl bg-[#1e293b] p-6 border border-white/5 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Target size={20} className="text-amber-500" /> Monthly Budgets
              </h3>
              <button onClick={() => setBudgetForm((prev) => ({ ...prev, isOpen: !prev.isOpen }))} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 text-white text-xs font-bold transition">
                <Plus size={16} /> Set Budget
              </button>
            </div>
            {budgetForm.isOpen && (
              <div className="mb-6 bg-[#0f172a] p-4 rounded-2xl border border-blue-500/30 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col md:flex-row gap-3">
                  <select
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                    className="bg-[#1e293b] text-white text-sm rounded-xl p-3 flex-1 border border-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Food">🍔 Food</option>
                    <option value="Transport">🛵 Transport</option>
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Bills">⚡ Bills</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Limit (Rp)"
                    value={budgetForm.limit}
                    onChange={(e) => setBudgetForm({ ...budgetForm, limit: handleAmountFormat(e.target.value) })}
                    className="bg-[#1e293b] text-white text-sm rounded-xl p-3 flex-1 border border-gray-700 focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  />
                  <button onClick={handleSaveBudget} disabled={loadingState.budget} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-900/20 active:scale-95">
                    {loadingState.budget ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentBudgets.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500 text-sm bg-[#0f172a]/50 rounded-2xl border border-dashed border-gray-700">
                  <p>No budgets set yet.</p>
                </div>
              ) : (
                currentBudgets.map((budget, index) => (
                  <BudgetCard
                    key={index}
                    {...budget}
                    onEdit={() => {
                      setBudgetForm({ isOpen: true, category: budget.category, limit: String(budget.limit) });
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    onDelete={() => handleDeleteBudget(budget.id)}
                  />
                ))
              )}
            </div>

            {/* Budget Pagination Footer */}
            {budgets.length > budgetItemsPerPage && (
              <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  Page <span className="text-white font-bold">{budgetPage}</span> of <span className="text-white font-bold">{totalBudgetPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBudgetPage((prev) => Math.max(prev - 1, 1))}
                    disabled={budgetPage === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-[#0f172a] text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    onClick={() => setBudgetPage((prev) => Math.min(prev + 1, totalBudgetPages))}
                    disabled={budgetPage === totalBudgetPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-600/40 disabled:opacity-30 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- TRANSACTION HISTORY SECTION (FINAL) --- */}
        <div className="bg-[#1e293b] rounded-3xl p-6 border border-gray-800 shadow-xl flex flex-col min-h-[500px]">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ReceiptText className="text-blue-500" size={24} /> Transaction History
              </h3>
              <p className="text-sm text-gray-400 mt-1">Track your income and expenses.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none bg-[#0f172a] text-gray-300 pl-4 pr-10 py-2 rounded-xl text-xs font-bold border border-gray-800 hover:border-gray-600 focus:outline-none focus:border-blue-500 transition cursor-pointer"
                >
                  <option value="All Categories">All Categories</option>
                  <option value="Food">🍔 Food</option>
                  <option value="Transport">🛵 Transport</option>
                  <option value="Data">⚡ Bill / Data</option>
                  <option value="Shopping">🛍️ Shopping</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                  <option value="Allowance">💵 Allowance</option>
                  <option value="Others">✨ Others</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
              <div className="flex bg-[#0f172a] p-1 rounded-xl border border-gray-800">
                {["All", "Income", "Expense"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${filterType === type ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {currentTransactions.length > 0 ? (
              currentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#0f172a] border border-gray-800/50 hover:border-blue-500/50 hover:bg-[#162032] transition-all duration-300 gap-4"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${t.type === "INCOME" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                    >
                      {t.type === "INCOME" ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">{t.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-400 mt-1 transition-colors">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {new Date(t.date).toLocaleDateString()}
                        </span>
                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-600"></span>
                        <span
                          className={`px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wider font-bold ${t.type === "INCOME" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-red-500/5 border-red-500/20 text-red-500"}`}
                        >
                          {t.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto relative z-10 pl-[4rem] sm:pl-0">
                    <p className={`text-lg font-bold tracking-tight ${t.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                      {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                    </p>
                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:transform sm:translate-x-2 sm:group-hover:translate-x-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditData(t);
                        }}
                        className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-amber-400 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-lg active:scale-90"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTransaction(t.id);
                        }}
                        className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-lg active:scale-90"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 ring-4 ring-gray-800/30">
                  <Filter size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-200 font-bold text-lg">No transactions found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters.</p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-[#0f172a] text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-600/40 disabled:opacity-30 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* EDIT MODAL */}
          {editData && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setEditData(null)}></div>
              <div className="w-full max-w-md bg-[#1e293b] rounded-3xl border border-gray-700 shadow-2xl relative overflow-hidden animate-in zoom-in-95 z-10 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-gray-700/50 bg-[#1e293b]">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                      <Edit2 size={18} />
                    </div>{" "}
                    Edit Transaction
                  </h3>
                  <button onClick={() => setEditData(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-5 overflow-y-auto custom-scrollbar">
                  <form id="editForm" onSubmit={handleUpdateTransaction} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                      <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full bg-[#0f172a] text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Amount</label>
                      <input
                        type="text"
                        value={editData.amount}
                        onChange={(e) => setEditData({ ...editData, amount: handleAmountFormat(String(e.target.value)) })}
                        className="w-full bg-[#0f172a] text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                      <select
                        value={editData.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="w-full bg-[#0f172a] text-white rounded-xl px-4 py-3 text-sm border border-gray-700 focus:border-blue-500 outline-none appearance-none"
                      >
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Data">Data</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Allowance">Allowance</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    {editData.type === "EXPENSE" && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, priority: "NEED" })}
                          className={`py-2 text-sm font-bold rounded-xl border ${editData.priority === "NEED" ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-[#0f172a] border-gray-700 text-gray-500"}`}
                        >
                          Need
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditData({ ...editData, priority: "WANT" })}
                          className={`py-2 text-sm font-bold rounded-xl border ${editData.priority === "WANT" ? "bg-purple-600/20 border-purple-500 text-purple-400" : "bg-[#0f172a] border-gray-700 text-gray-500"}`}
                        >
                          Want
                        </button>
                      </div>
                    )}
                  </form>
                </div>
                <div className="p-5 border-t border-gray-700/50 bg-[#1e293b]">
                  <button form="editForm" type="submit" disabled={loadingState.edit} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                    {loadingState.edit ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

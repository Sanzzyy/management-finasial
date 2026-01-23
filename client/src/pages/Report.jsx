import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
// Import Lucide Icons
import { BarChart3, PieChart, TrendingUp, TrendingDown, Wallet, Bot, Calendar, ChevronDown } from "lucide-react";

// Register Chart Components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const Report = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  // Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0 = January
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const years = [2024, 2025, 2026, 2027];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchTransactions(userData.id);
    }
  }, []);

  const fetchTransactions = async (userId) => {
    try {
      const response = await axios.get(`/api/transactions/${userId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const formatCurrency = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // --- DATA PROCESSING LOGIC ---

  // 1. Filter transactions based on selected Month & Year
  const filteredData = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === parseInt(selectedMonth) && date.getFullYear() === parseInt(selectedYear);
  });

  // 2. Calculate Totals
  const totalIncome = filteredData.filter((t) => t.type === "INCOME").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredData.filter((t) => t.type === "EXPENSE").reduce((acc, curr) => acc + curr.amount, 0);
  const netSavings = totalIncome - totalExpense;

  // 3. Prepare Line Chart Data (Daily Cashflow)
  const dailyData = {};
  filteredData.forEach((t) => {
    const day = new Date(t.date).getDate();
    if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0 };
    if (t.type === "INCOME") dailyData[day].income += t.amount;
    else dailyData[day].expense += t.amount;
  });

  const lineChartData = {
    labels: Object.keys(dailyData).sort((a, b) => a - b),
    datasets: [
      {
        label: "Income",
        data: Object.keys(dailyData)
          .sort((a, b) => a - b)
          .map((day) => dailyData[day].income),
        borderColor: "#10b981", // Emerald
        backgroundColor: "#10b981",
        tension: 0.4,
      },
      {
        label: "Expense",
        data: Object.keys(dailyData)
          .sort((a, b) => a - b)
          .map((day) => dailyData[day].expense),
        borderColor: "#ef4444", // Red
        backgroundColor: "#ef4444",
        tension: 0.4,
      },
    ],
  };

  // 4. Prepare Doughnut Data (Categories)
  const categoryData = {};
  filteredData
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      if (!categoryData[t.category]) categoryData[t.category] = 0;
      categoryData[t.category] += t.amount;
    });

  const doughnutChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: ["#f87171", "#fb923c", "#facc15", "#a3e635", "#4ade80", "#22d3ee", "#818cf8", "#e879f9"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 pb-32 pt-20 md:pt-0">
      <main className="mx-auto max-w-7xl p-6">
        {/* HEADER & FILTER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 size={24} className="text-blue-500" /> Financial Report
            </h1>
            <p className="text-sm text-gray-400">Analyze your monthly cashflow.</p>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-3 bg-[#1e293b] p-1.5 rounded-2xl border border-gray-700 shadow-lg">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none pl-3 pr-8 py-1.5 cursor-pointer appearance-none hover:text-blue-400 transition"
              >
                {months.map((m, i) => (
                  <option key={i} value={i} className="bg-[#1e293b] text-gray-300">
                    {m}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-2 pointer-events-none text-gray-500">
                <ChevronDown size={14} />
              </div>
            </div>

            <div className="w-px h-6 bg-gray-700"></div>

            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none pl-3 pr-8 py-1.5 cursor-pointer appearance-none hover:text-blue-400 transition"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-[#1e293b] text-gray-300">
                    {y}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-2 pointer-events-none text-gray-500">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* 1. MONTHLY SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl bg-[#1e293b] p-6 border border-gray-800 shadow-lg flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition">
              <TrendingUp size={48} />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">Total Income</p>
            <h2 className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</h2>
          </div>

          <div className="rounded-3xl bg-[#1e293b] p-6 border border-gray-800 shadow-lg flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition">
              <TrendingDown size={48} />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Expense</p>
            <h2 className="text-2xl font-bold text-red-400">{formatCurrency(totalExpense)}</h2>
          </div>

          <div className={`rounded-3xl p-6 border shadow-lg flex flex-col justify-center relative overflow-hidden ${netSavings >= 0 ? "bg-blue-600/10 border-blue-600/30" : "bg-red-600/10 border-red-600/30"}`}>
            <div className="absolute right-0 top-0 p-6 opacity-10">
              <Wallet size={48} />
            </div>
            <p className={`text-xs font-bold uppercase mb-1 ${netSavings >= 0 ? "text-blue-400" : "text-red-400"}`}>{netSavings >= 0 ? "Net Savings (Safe)" : "Deficit (Warning)"}</p>
            <h2 className={`text-2xl font-bold ${netSavings >= 0 ? "text-blue-400" : "text-red-400"}`}>
              {netSavings >= 0 ? "+" : ""}
              {formatCurrency(netSavings)}
            </h2>
          </div>
        </div>

        {/* 2. CHART AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Line Chart (Trend) */}
          <div className="lg:col-span-2 rounded-3xl bg-[#1e293b] p-6 border border-gray-800 shadow-xl">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-gray-400" /> Daily Cashflow
            </h3>
            <div className="h-64">
              {Object.keys(dailyData).length > 0 ? (
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } },
                    scales: {
                      x: { grid: { color: "#334155" }, ticks: { color: "#94a3b8" } },
                      y: { grid: { color: "#334155" }, ticks: { color: "#94a3b8" } },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm opacity-50">
                  <Calendar size={32} className="mb-2" />
                  No data for this month.
                </div>
              )}
            </div>
          </div>

          {/* Doughnut Chart (Category) */}
          <div className="lg:col-span-1 rounded-3xl bg-[#1e293b] p-6 border border-gray-800 shadow-xl flex flex-col">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <PieChart size={18} className="text-gray-400" /> Spending Breakdown
            </h3>
            <div className="flex-1 flex items-center justify-center relative">
              {totalExpense > 0 ? (
                <div className="w-48 h-48">
                  <Doughnut
                    data={doughnutChartData}
                    options={{
                      plugins: { legend: { display: false } },
                      cutout: "70%",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Wallet size={32} className="text-gray-600" />
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm opacity-50 flex flex-col items-center">
                  <Wallet size={32} className="mb-2" />
                  No expense data.
                </div>
              )}
            </div>
            {/* Legend Manual */}
            <div className="mt-6 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
              {Object.keys(categoryData).map((cat, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: doughnutChartData.datasets[0].backgroundColor[idx] }}></span>
                    {cat}
                  </span>
                  <span className="font-bold text-gray-400">{formatCurrency(categoryData[cat])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. INSIGHT AI */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 to-blue-900 p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Bot size={20} className="text-indigo-300" /> Financial Insight
          </h3>
          <p className="text-indigo-200 text-sm leading-relaxed relative z-10">
            {netSavings > 0
              ? `Great job, ${user?.name.split(" ")[0]}! You managed to save ${formatCurrency(netSavings)} this month. Consider allocating 30% of your savings to your Goals.`
              : `Heads up! Your expenses exceeded your income by ${formatCurrency(Math.abs(netSavings))}. Try to cut back on ${Object.keys(categoryData)[0] || "Miscellaneous"} next month!`}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Report;

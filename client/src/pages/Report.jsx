import { useState, useEffect, useMemo, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { BarChart3, PieChart, TrendingUp, TrendingDown, Wallet, Bot, ChevronDown, Loader2, Download, FileSpreadsheet } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const Report = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Ref khusus untuk area cetak (Hidden Template)
  const printRef = useRef();

  const navigate = useNavigate();

  // Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
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
      fetchTransactions();
    }
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // --- LOGIC 1: EXPORT EXCEL PRO (STYLED) ---
  const handleDownloadExcel = async () => {
    setIsExporting(true); // Pakai loading state biar user tau lagi proses

    try {
      // 1. Setup Workbook & Worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Financial Report");

      // 2. Definisi Kolom (Header & Lebar)
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Title", key: "title", width: 30 },
        { header: "Category", key: "category", width: 15 },
        { header: "Type", key: "type", width: 10 },
        { header: "Amount (IDR)", key: "amount", width: 20 },
      ];

      // 3. Style Header (Background Biru, Font Putih Bold)
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }; // Putih
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" }, // Warna Dark Navy (Sesuai tema App)
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      // 4. Masukkan Data
      filteredData.forEach((t) => {
        const row = worksheet.addRow({
          date: new Date(t.date).toLocaleDateString("id-ID"),
          title: t.title,
          category: t.category,
          type: t.type,
          amount: t.amount,
        });

        // Warnai Text Amount (Hijau Income, Merah Expense)
        const amountCell = row.getCell("amount");
        amountCell.font = {
          color: { argb: t.type === "INCOME" ? "FF10B981" : "FFEF4444" }, // Emerald / Red
          bold: true,
        };
        amountCell.numFmt = "#,##0"; // Format angka
      });

      // 5. Generate File & Download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Report_${months[selectedMonth]}_${selectedYear}.xlsx`);
    } catch (error) {
      console.error("Gagal export Excel", error);
      alert("Gagal membuat file Excel");
    } finally {
      setIsExporting(false);
    }
  };

  // --- LOGIC 2: EXPORT PDF (CLEAN DOCUMENT STYLE - DARK THEME) ---
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);

    try {
      // Foto template hidden
      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Resolusi tinggi biar tulisan tajam
        backgroundColor: "#0f172a", // Paksa background gelap sesuai tema
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Report_${months[selectedMonth]}_${selectedYear}.pdf`);
    } catch (error) {
      console.error("Export PDF Error", error);
      alert("Gagal export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // --- DATA PROCESSING ---
  const filteredData = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === parseInt(selectedMonth) && date.getFullYear() === parseInt(selectedYear);
    });
  }, [transactions, selectedMonth, selectedYear]);

  const { totalIncome, totalExpense, netSavings } = useMemo(() => {
    const inc = filteredData.filter((t) => t.type === "INCOME").reduce((acc, curr) => acc + curr.amount, 0);
    const exp = filteredData.filter((t) => t.type === "EXPENSE").reduce((acc, curr) => acc + curr.amount, 0);
    return { totalIncome: inc, totalExpense: exp, netSavings: inc - exp };
  }, [filteredData]);

  const lineChartData = useMemo(() => {
    const dailyData = {};
    filteredData.forEach((t) => {
      const day = new Date(t.date).getDate();
      if (!dailyData[day]) dailyData[day] = { income: 0, expense: 0 };
      if (t.type === "INCOME") dailyData[day].income += t.amount;
      else dailyData[day].expense += t.amount;
    });

    return {
      labels: Object.keys(dailyData).sort((a, b) => a - b),
      datasets: [
        {
          label: "Income",
          data: Object.keys(dailyData)
            .sort((a, b) => a - b)
            .map((day) => dailyData[day].income),
          borderColor: "#10b981",
          backgroundColor: "#10b981",
          tension: 0.4,
        },
        {
          label: "Expense",
          data: Object.keys(dailyData)
            .sort((a, b) => a - b)
            .map((day) => dailyData[day].expense),
          borderColor: "#ef4444",
          backgroundColor: "#ef4444",
          tension: 0.4,
        },
      ],
    };
  }, [filteredData]);

  const { doughnutChartData, categoryData } = useMemo(() => {
    const catData = {};
    filteredData
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        if (!catData[t.category]) catData[t.category] = 0;
        catData[t.category] += t.amount;
      });

    const chartData = {
      labels: Object.keys(catData),
      datasets: [
        {
          data: Object.values(catData),
          backgroundColor: ["#f87171", "#fb923c", "#facc15", "#a3e635", "#4ade80", "#22d3ee", "#818cf8", "#e879f9"],
          borderWidth: 0,
        },
      ],
    };
    return { doughnutChartData: chartData, categoryData: catData };
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 pb-32 pt-20 md:pt-0">
        <main className="mx-auto max-w-7xl p-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-800 rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-gray-800 rounded-3xl"></div>
            <div className="h-32 bg-gray-800 rounded-3xl"></div>
            <div className="h-32 bg-gray-800 rounded-3xl"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 pb-32 pt-20 md:pt-0 relative overflow-x-hidden">
      {/* ===================================================================================== */}
      {/* --- HIDDEN PRINT TEMPLATE (DARK THEME VERSION) --- */}
      {/* Template ini tidak terlihat di layar, tapi akan difoto untuk jadi PDF.
          Sekarang menggunakan tema gelap agar serasi dengan aplikasi.
      */}
      {/* ===================================================================================== */}
      <div
        ref={printRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "210mm",
          minHeight: "297mm",
          backgroundColor: "#0f172a", // Background Gelap (Dark Navy)
          zIndex: -50,
          padding: "40px",
          color: "#ffffff", // Teks Putih
          fontFamily: "sans-serif",
        }}
      >
        {/* 1. Header Surat */}
        <div className="flex justify-between items-start border-b-2 border-slate-700 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-wider text-white">Financial Report</h1>
            <p className="text-slate-400 mt-1 font-medium">
              {months[selectedMonth]} {selectedYear}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-blue-400">ManagementSmart</h2>
            <p className="text-sm text-slate-400">Personal Finance Manager</p>
            <p className="text-sm text-slate-400">{new Date().toLocaleDateString("id-ID")}</p>
          </div>
        </div>

        {/* 2. Summary Cards (Dark Theme) */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Income */}
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "16px" }}>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Income</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
          </div>
          {/* Expense */}
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "16px" }}>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Expense</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(totalExpense)}</p>
          </div>
          {/* Savings */}
          <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "12px", padding: "16px" }}>
            <p className="text-xs font-bold text-slate-400 uppercase">Net Savings</p>
            <p className={`text-xl font-bold ${netSavings >= 0 ? "text-blue-400" : "text-red-400"}`}>{formatCurrency(netSavings)}</p>
          </div>
        </div>

        {/* 3. Transaction Table (Dark Theme) */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase mb-4 border-l-4 border-blue-500 pl-3">Transaction Details</h3>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#1e293b", borderBottom: "2px solid #334155" }}>
                <th className="py-3 px-2 font-bold text-slate-300">Date</th>
                <th className="py-3 px-2 font-bold text-slate-300">Description</th>
                <th className="py-3 px-2 font-bold text-slate-300">Category</th>
                <th className="py-3 px-2 font-bold text-slate-300 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((t, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #334155" }}>
                  <td className="py-3 px-2 text-slate-400">{new Date(t.date).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</td>
                  <td className="py-3 px-2 font-medium text-white">{t.title}</td>
                  <td className="py-3 px-2">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${t.type === "INCOME" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{t.category}</span>
                  </td>
                  <td className={`py-3 px-2 text-right font-bold ${t.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                    {t.type === "INCOME" ? "+" : "-"} {formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500 italic">
                    No transactions found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-slate-700 pt-4 text-center">
          <p className="text-xs text-slate-500">Generated by ManagementSmart App • {new Date().getFullYear()}</p>
        </div>
      </div>
      {/* --- END HIDDEN TEMPLATE --- */}

      {/* --- MAIN DASHBOARD CONTENT (Tetap seperti biasa) --- */}
      <main className="mx-auto max-w-7xl p-6 relative z-10">
        {" "}
        {/* z-10 biar di atas template surat */}
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 size={24} className="text-emerald-400" /> Financial Report
            </h1>
            <p className="text-sm text-gray-400">Analyze your monthly cashflow.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tombol Excel */}
            <button onClick={handleDownloadExcel} className="flex items-center gap-2 bg-[#1e293b] hover:bg-gray-800 text-gray-300 border border-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition active:scale-95">
              <FileSpreadsheet size={16} className="text-green-500" /> Excel
            </button>

            {/* Tombol PDF */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Export PDF
            </button>

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
        </div>
        {/* --- DISPLAY DASHBOARD (DARK MODE - FOR SCREEN) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl bg-[#1e293b] p-6 border border-gray-800 shadow-lg flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110 duration-500">
              <TrendingUp size={48} />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">Total Income</p>
            <h2 className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</h2>
          </div>
          <div className="rounded-3xl bg-[#1e293b] p-6 border border-gray-800 shadow-lg flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110 duration-500">
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
        {/* Charts Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 rounded-3xl bg-[#1e293b] p-6 border border-gray-800 shadow-xl">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-gray-400" /> Daily Cashflow
            </h3>
            <div className="h-64">
              {Object.keys(lineChartData.labels).length > 0 ? (
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } },
                    scales: { x: { grid: { color: "#334155" }, ticks: { color: "#94a3b8" } }, y: { grid: { color: "#334155" }, ticks: { color: "#94a3b8" } } },
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm opacity-50">
                  <BarChart3 size={32} className="mb-2" /> No transaction data.
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-1 rounded-3xl bg-[#1e293b] p-6 border border-gray-800 shadow-xl flex flex-col">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <PieChart size={18} className="text-gray-400" /> Spending Breakdown
            </h3>
            <div className="flex-1 flex items-center justify-center relative">
              {totalExpense > 0 ? (
                <div className="w-48 h-48">
                  <Doughnut data={doughnutChartData} options={{ plugins: { legend: { display: false } }, cutout: "70%" }} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Wallet size={32} className="text-gray-600" />
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm opacity-50 flex flex-col items-center">
                  <Wallet size={32} className="mb-2" /> No expense data.
                </div>
              )}
            </div>
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
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Bot size={20} className="text-indigo-300" /> Financial Insight
          </h3>
          <p className="text-indigo-200 text-sm leading-relaxed relative z-10">
            {netSavings > 0
              ? `Great job! You managed to save ${formatCurrency(netSavings)} this month. Consider allocating 30% of your savings to your Goals.`
              : `Heads up! Your expenses exceeded your income by ${formatCurrency(Math.abs(netSavings))}. Try to cut back on ${Object.keys(categoryData)[0] || "expenses"} next month!`}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Report;

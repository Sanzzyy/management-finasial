import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import Lucide Icons
import { Target, Rocket, Plus, DollarSign, Check, X, Trash2, Trophy, PiggyBank, Sparkles } from "lucide-react";

const Goals = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  // State Saving
  const [savingAmount, setSavingAmount] = useState("");
  const [activeGoalId, setActiveGoalId] = useState(null);

  // Format Currency (IDR is used for value, but label is English)
  const formatCurrency = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleAmountChange = (e, setFunc) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    let formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setFunc(formatted);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchGoals(userData.id);
    }
  }, []);

  const fetchGoals = async (userId) => {
    try {
      const response = await axios.get(`/api/goals/${userId}`);
      setGoals(response.data);
    } catch (error) {
      console.error("Failed to fetch goals", error);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!user) return;
    const cleanAmount = parseFloat(targetAmount.replaceAll(".", ""));

    try {
      await axios.post("/api/goals", {
        title,
        targetAmount: cleanAmount,
        userId: user.id,
      });
      setTitle("");
      setTargetAmount("");
      fetchGoals(user.id);
    } catch (error) {
      alert("Failed to create goal");
    }
  };

  const handleAddSaving = async (e) => {
    e.preventDefault();
    const cleanAmount = parseFloat(savingAmount.replaceAll(".", ""));

    try {
      await axios.put(`/api/goals/${activeGoalId}/save`, {
        amount: cleanAmount,
      });
      setSavingAmount("");
      setActiveGoalId(null);
      fetchGoals(user.id);
    } catch (error) {
      alert("Failed to save money");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await axios.delete(`/api/goals/${id}`);
      fetchGoals(user.id);
    } catch (error) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-gray-100 pb-28 pt-20 md:pt-0">
      <main className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Rocket size={24} className="text-purple-500" /> Dream Goals
          </h1>
          <p className="text-sm text-gray-400">Set your targets and make your dreams come true.</p>
        </div>

        {/* --- PART 1: FORM INPUT (FULL WIDTH TOP) --- */}
        <div className="rounded-3xl bg-[#1e293b] p-6 border border-gray-800 shadow-xl mb-10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
            <span className="bg-purple-500 text-white p-1 rounded flex items-center justify-center">
              <Plus size={12} />
            </span>{" "}
            Create New Goal
          </h3>

          {/* Horizontal Form Grid */}
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Name Input (5 cols) */}
            <div className="md:col-span-5">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1 block">Goal Name / Item</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. New Gaming Laptop"
                  className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition pl-10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <div className="absolute left-3 top-3.5 pointer-events-none text-gray-500">
                  <Target size={14} />
                </div>
              </div>
            </div>

            {/* Price Input (5 cols) */}
            <div className="md:col-span-5">
              <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1 block">Target Amount (Rp)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0"
                  className="w-full rounded-xl bg-[#0f172a] border border-gray-700 px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition font-bold pl-10"
                  value={targetAmount}
                  onChange={(e) => handleAmountChange(e, setTargetAmount)}
                  required
                />
                <div className="absolute left-3 top-3.5 pointer-events-none text-gray-500">
                  <DollarSign size={14} />
                </div>
              </div>
            </div>

            {/* Save Button (2 cols) */}
            <div className="md:col-span-2">
              <button className="w-full rounded-xl bg-purple-600 py-3 font-bold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500 transition active:scale-95 h-[46px] flex items-center justify-center gap-2">
                <Sparkles size={16} /> Save
              </button>
            </div>
          </form>
        </div>

        {/* --- PART 2: GOALS LIST (GRID BOTTOM) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed bg-[#1e293b] border-gray-800 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                <PiggyBank size={48} className="text-gray-500 opacity-50" />
              </div>
              <p className="text-gray-500">No goals yet. Start dreaming above!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const percentage = Math.min(Math.round((goal.savedAmount / goal.targetAmount) * 100), 100);

              return (
                <div key={goal.id} className="group relative flex flex-col justify-between rounded-3xl bg-[#1e293b] border border-gray-800 p-6 hover:border-purple-500/30 transition-all duration-300 shadow-lg">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="pr-2">
                      <h3 className="text-lg font-bold text-white leading-tight line-clamp-1" title={goal.title}>
                        {goal.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Target: {formatCurrency(goal.targetAmount)}</p>
                    </div>
                    <div className={`flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full text-[10px] font-bold ${percentage >= 100 ? "bg-emerald-500 text-white" : "bg-[#0f172a] text-white border border-gray-700"}`}>
                      {percentage}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2.5 w-full rounded-full bg-[#0f172a] overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${percentage >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className="text-gray-400">Collected</span>
                      <span className="font-bold text-white">{formatCurrency(goal.savedAmount)}</span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-auto pt-4 border-t border-gray-800 flex gap-2">
                    {activeGoalId === goal.id ? (
                      <div className="flex-1 flex gap-2 animate-fadeIn">
                        <input
                          type="text"
                          placeholder="Rp..."
                          autoFocus
                          className="w-full bg-[#0f172a] rounded-lg px-3 py-2 text-xs text-white border border-gray-700 focus:outline-none focus:border-purple-500"
                          value={savingAmount}
                          onChange={(e) => handleAmountChange(e, setSavingAmount)}
                        />
                        <button onClick={handleAddSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-1 text-xs font-bold flex items-center justify-center">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setActiveGoalId(null)} className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1 text-xs flex items-center justify-center">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setActiveGoalId(goal.id)}
                          disabled={percentage >= 100}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-2 ${percentage >= 100 ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 text-white"}`}
                        >
                          {percentage >= 100 ? (
                            <>
                              <Trophy size={14} /> Achieved!
                            </>
                          ) : (
                            <>
                              <Plus size={14} /> Add Fund
                            </>
                          )}
                        </button>
                        <button onClick={() => handleDelete(goal.id)} className="px-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition" title="Delete Goal">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Goals;

import { TrendingUp, AlertCircle, Pencil, Trash2 } from "lucide-react";

// Terima props baru: onEdit & onDelete
const BudgetCard = ({ category, limit, spent, percentage, isOverBudget, onEdit, onDelete }) => {
  let colorClass = "bg-green-500";
  if (percentage > 75) colorClass = "bg-yellow-500";
  if (percentage >= 100) colorClass = "bg-red-500";

  return (
    <div className="group relative mb-4 rounded-xl bg-[#1e293b] p-5 border border-white/5 transition-all hover:border-blue-500/30">
      {/* Header Card */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {/* Icon Kategori (Dynamic Color) */}
          <div className={`p-2 rounded-lg ${isOverBudget ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>{isOverBudget ? <AlertCircle size={20} /> : <TrendingUp size={20} />}</div>
          <div>
            <h4 className="font-bold text-gray-200 capitalize text-sm">{category}</h4>
            <p className="text-xs text-gray-500">Limit: Rp {limit.toLocaleString()}</p>
          </div>
        </div>

        {/* ACTION BUTTONS (Edit & Delete) */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition" title="Edit Budget">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete Budget">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Rp {spent.toLocaleString()}</span>
        <span>{percentage}%</span>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default BudgetCard;

import { Clock, TrendUp as TrendingUp, WarningCircle as AlertCircle, CheckCircle as CheckCircle2, Car, Buildings as Building2, Tag, User } from "@phosphor-icons/react/ssr";
// ✅ UPDATED: Import centralized types directly
import type { TaskPriority, TaskCategory } from "@/lib/types";

interface Props {
  priority: TaskPriority;
  setPriority: (p: TaskPriority) => void;
  category: TaskCategory;
  setCategory: (c: TaskCategory) => void;
}

const priorities: { id: TaskPriority; label: string; icon: any; color: string }[] = [
  { id: "low", label: "Low", icon: Clock, color: "text-slate-600 bg-slate-50 border-slate-200" },
  { id: "medium", label: "Medium", icon: TrendingUp, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "high", label: "High", icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "urgent", label: "Urgent", icon: AlertCircle, color: "text-red-600 bg-red-50 border-red-200" },
];

const categories: { id: TaskCategory; label: string; icon: any }[] = [
  { id: "compliance", label: "Compliance", icon: CheckCircle2 },
  { id: "finance", label: "Finance", icon: TrendingUp },
  { id: "maintenance", label: "Maintenance", icon: Car },
  { id: "hr", label: "HR", icon: User },
  { id: "operations", label: "Ops", icon: Building2 },
  { id: "other", label: "Other", icon: Tag },
];

export default function PriorityCategoryPicker({ priority, setPriority, category, setCategory }: Props) {
  return (
    <div className="space-y-3">
      {/* Priority Row */}
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Priority</label>
        <div className="grid grid-cols-4 gap-2">
          {priorities.map((p) => {
            const Icon = p.icon;
            const isActive = priority === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                  isActive ? `${p.color} ring-1 ring-offset-1 ring-indigo-500` : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon size={12} aria-hidden="true" /> {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Row */}
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                  isActive ? "bg-indigo-50 border-indigo-300 text-indigo-700 ring-1 ring-offset-1 ring-indigo-500" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon size={12} aria-hidden="true" /> {c.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

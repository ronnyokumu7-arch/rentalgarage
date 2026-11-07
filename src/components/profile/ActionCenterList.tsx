"use client";

import { 
  CheckCircle as CheckCircle2, Clock, Tag, Calendar, Eye, Briefcase, CurrencyDollar as DollarSign, Car,
  Shield, Users
} from "@phosphor-icons/react/ssr";
import Badge from "@/components/ui/Badge";
import type { Task } from "@/lib/types";

interface ActionCenterListProps {
  tasks: Task[];
  selectedTask: Task | null;
  onSelectTask: (task: Task) => void;
  activeTab: "pending" | "done";
  onTabChange: (tab: "pending" | "done") => void;
  loading: boolean;
  updatingId: number | null;
  onToggleComplete: (taskId: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  compliance: Shield,
  fleet: Car,
  finance: DollarSign,
  booking: Briefcase,
  hr: Users,
  operations: Tag,
  maintenance: Tag,
  other: Tag,
};

const PRIORITY_DOT_COLORS: Record<string, string> = {
  urgent: "bg-rose-500 shadow-[0_0_8px_-2px_rgba(244,63,94,0.6)]",
  high: "bg-amber-500 shadow-[0_0_8px_-2px_rgba(245,158,11,0.6)]",
  medium: "bg-blue-500 shadow-[0_0_8px_-2px_rgba(59,130,246,0.6)]",
  low: "bg-[var(--color-ink-subtle)]",
};

export default function ActionCenterList({
  tasks, selectedTask, onSelectTask,
  activeTab, onTabChange, loading, updatingId,
  onToggleComplete
}: ActionCenterListProps) {

  const displayTasks = activeTab === "done" 
    ? tasks.filter(t => t.status === "completed")
    : tasks.filter(t => t.status !== "completed" && t.status !== "unassigned");

  const pendingCount = tasks.filter(t => t.status !== "completed" && t.status !== "unassigned").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { text: "No due date", isOverdue: false };
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return {
      text: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      isOverdue
    };
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      
      {/* ✅ HEADER: Title + description stacked, tab switcher moved below */}
      <div className="px-3 py-3 sm:px-5 sm:py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20 shrink-0">
        <div className="mb-2.5">
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-ink)]">Action Center</h3>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            Everything that needs your attention — in one place.
          </p>
        </div>

        {/* ✅ Tabs now sit below the title, left-aligned, still scrollable on tiny screens */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 overflow-x-auto w-fit max-w-full">
          <button
            onClick={() => onTabChange("pending")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "pending"
                ? "bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/30"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
            }`}
          >
            Pending
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "pending" 
                ? "bg-white/20 text-white" 
                : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]"
            }`}>
              {pendingCount}
            </span>
          </button>
          
          <button
            onClick={() => onTabChange("done")}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "done"
                ? "bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/30"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
            }`}
          >
            Completed
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "done" 
                ? "bg-white/20 text-white" 
                : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]"
            }`}>
              {completedCount}
            </span>
          </button>
        </div>
      </div>

      {/* TASK LIST - tighter padding on mobile */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-3 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-ink-muted)]">
            <Clock size={24} className="animate-spin mb-3 text-[var(--color-primary)]" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading tasks...</p>
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" aria-hidden="true" />
            </div>
            <p className="text-sm font-bold text-[var(--color-ink)] mb-1">All Caught Up!</p>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-[220px] leading-relaxed">
              No tasks in this view. New items will appear here as they are generated.
            </p>
          </div>
        ) : (
          displayTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isSelected = selectedTask?.id === task.id;
            const dateInfo = formatDate(task.due_date);
            const CategoryIcon = CATEGORY_ICONS[task.category] || Tag;
            const isOverdue = dateInfo.isOverdue && !isCompleted;
            const priorityDotColor = PRIORITY_DOT_COLORS[task.priority] || PRIORITY_DOT_COLORS.low;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`group relative p-2.5 sm:p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 ring-1 ring-[var(--color-primary)]/10"
                    : "bg-[var(--color-surface)] border-[var(--color-surface-border)] hover:border-[var(--color-surface-border)]/80 hover:shadow-sm"
                } ${isCompleted ? "opacity-70" : ""}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  
                  {/* Left: Priority Dot */}
                  <div className="mt-1 flex-shrink-0">
                    {!isCompleted ? (
                      <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-[var(--color-surface)] ${priorityDotColor}`} />
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-500" aria-hidden="true" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-semibold leading-tight ${
                        isCompleted 
                          ? "text-[var(--color-ink-subtle)] line-through decoration-[var(--color-ink-subtle)]/50" 
                          : "text-[var(--color-ink)]"
                      }`}>
                        {task.title}
                      </p>
                      <Badge 
                        variant={
                          task.priority === "urgent" ? "danger" : 
                          task.priority === "high" ? "warning" : 
                          task.priority === "medium" ? "accent" : "default"
                        } 
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                      <span className="flex items-center gap-1">
                        <CategoryIcon size={11} aria-hidden="true" />
                        <span className="capitalize">{task.category}</span>
                      </span>
                      <span className={`flex items-center gap-1 ${isOverdue ? "text-rose-500" : ""}`}>
                        <Calendar size={11} aria-hidden="true" />
                        {dateInfo.text}
                        {isOverdue && <span className="ml-1 px-1 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold">OVERDUE</span>}
                      </span>
                    </div>
                  </div>

                  {/* Done button - icon only on mobile, full text on desktop */}
                  {!isCompleted && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
                      disabled={updatingId === task.id}
                      className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
                    >
                      {updatingId === task.id ? (
                        <Clock size={12} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 size={12} aria-hidden="true" />
                      )}
                      <span className="hidden sm:inline">Done</span>
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                      className="p-2 rounded-lg text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors flex-shrink-0"
                      title="View details"
                    >
                      <Eye size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

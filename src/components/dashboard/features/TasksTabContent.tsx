// src/components/dashboard/features/TasksTabContent.tsx
"use client";

import {
  Calendar, CheckCircle2, Loader2, MoreVertical, UserPlus
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTasksTab } from "@/hooks/dashboard/features/useTasksTab";
import { Car, User, FileText } from "lucide-react";

const getPriorityDotColor = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case 'urgent': return 'bg-rose-500 shadow-sm shadow-rose-500/50';
    case 'high': return 'bg-amber-500 shadow-sm shadow-amber-500/50';
    case 'medium': return 'bg-blue-500 shadow-sm shadow-blue-500/50';
    default: return 'bg-[var(--color-ink-subtle)]';
  }
};

const parseTaskTitle = (title: string): { action: string; subject: string | null } => {
  const separators = [' for ', ' with ', ' regarding ', ' on ', ' about '];
  for (const sep of separators) {
    const idx = title.toLowerCase().indexOf(sep.toLowerCase());
    if (idx !== -1) return { action: title.substring(0, idx).trim(), subject: title.substring(idx + sep.length).trim() };
  }
  return { action: title, subject: null };
};

const getSubjectIcon = (subject: string): LucideIcon => {
  const lower = subject.toLowerCase();
  if (lower.includes('vehicle') || lower.includes('car') || lower.includes('plate') ||
      lower.includes('toyota') || lower.includes('nissan') || lower.includes('mazda') ||
      /\b[km][a-z]\d{3}[a-z]\b/i.test(subject)) return Car;
  if (lower.includes('booking') || lower.includes('rental') || lower.includes('trip') ||
      lower.includes('reservation') || /^bk-\d+$/i.test(subject)) return Calendar;
  if (lower.includes('document') || lower.includes('contract') || lower.includes('invoice') ||
      lower.includes('receipt') || lower.includes('agreement')) return FileText;
  return User;
};

const isOverdue = (dateStr: string) => !!dateStr && new Date(dateStr) < new Date();

const formatDate = (dateStr: string) => {
  if (!dateStr) return "No due date";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function TasksTabContent() {
  const {
    tasks, loading, updatingId, openMenuId,
    setOpenMenuId, handleClaimTask, handleCompleteTask, closeMenu
  } = useTasksTab();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)]">
        <Loader2 size={24} className="animate-spin mb-3 text-[var(--color-primary)]" />
        <p className="text-sm font-medium">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
          <CheckCircle2 size={24} />
        </div>
        <p className="text-sm font-bold text-[var(--color-ink)]">All caught up!</p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">No pending tasks right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-in fade-in duration-200">
      {tasks.map((task) => {
        const overdue = task.due_date ? isOverdue(task.due_date) : false;
        const safeTaskId = (task as any).id ?? (task as any).task_id;
        const hasActions = task.status !== "completed";
        const { action, subject } = parseTaskTitle(task.title);
        const SubjectIcon = subject ? getSubjectIcon(subject) : null;

        return (
          <div key={`task-${safeTaskId}`} className="group relative p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ring-2 ring-[var(--color-surface)] ${getPriorityDotColor(task.priority)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight text-[var(--color-ink)]">{action}</p>
                {subject && SubjectIcon && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <SubjectIcon size={13} className="text-[var(--color-ink-muted)] flex-shrink-0" />
                    <span className="text-xs text-[var(--color-ink-muted)] truncate">{subject}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className={`flex items-center gap-1.5 mt-2 text-[11px] font-bold uppercase tracking-wider ${overdue ? "text-rose-600 dark:text-rose-400" : "text-[var(--color-ink-subtle)]"}`}>
                    <Calendar size={12} />
                    {formatDate(task.due_date)}
                    {overdue && <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[9px] font-extrabold">OVERDUE</span>}
                  </div>
                )}
              </div>

              {hasActions && (
                <div className="relative flex-shrink-0" data-task-menu>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === safeTaskId ? null : safeTaskId); }}
                    className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
                  >
                    {updatingId === safeTaskId ? <Loader2 size={15} className="animate-spin" /> : <MoreVertical size={15} />}
                  </button>
                  {openMenuId === safeTaskId && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-lg shadow-black/5 z-20 overflow-hidden animate-in fade-in slide-up duration-150">
                      {task.status === "unassigned" && (
                        <button onClick={(e) => { e.stopPropagation(); closeMenu(); handleClaimTask(safeTaskId); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
                          <UserPlus size={14} /> Claim Task
                        </button>
                      )}
                      {task.status !== "unassigned" && task.status !== "completed" && (
                        <button onClick={(e) => { e.stopPropagation(); closeMenu(); handleCompleteTask(safeTaskId); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                          <CheckCircle2 size={14} /> Mark Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { Calendar, Tag, WarningCircle as AlertCircle, CheckCircle as CheckCircle2, Clock, Prohibit as Ban } from "@phosphor-icons/react/ssr";
import type { Task } from "@/lib/types";

interface TaskContextBarProps {
  task: Task;
}

export default function TaskContextBar({ task }: TaskContextBarProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { text: "No due date", isOverdue: false };
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return {
      text: date.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
      isOverdue
    };
  };

  const dateInfo = formatDate(task.due_date);

  const getPriorityStyle = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
      case 'high':
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
      case 'medium':
        return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]";
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'in_progress': return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
      case 'in_review': return "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20";
      case 'blocked': return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
      case 'completed': return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case 'unassigned': return "text-[var(--color-ink-subtle)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]";
      default: return "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'in_progress': return <Clock size={9} aria-hidden="true" />;
      case 'in_review': return <AlertCircle size={9} aria-hidden="true" />;
      case 'blocked': return <Ban size={9} aria-hidden="true" />;
      case 'completed': return <CheckCircle2 size={9} aria-hidden="true" />;
      default: return <Clock size={9} aria-hidden="true" />;
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);
  const statusStyle = getStatusStyle(task.status);

  const truncateDescription = (text: string, wordLimit: number = 20): string => {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const truncatedDesc = task.description ? truncateDescription(task.description, 20) : "";

  return (
    // ✅ MOBILE: Tighter padding (px-3 py-3), desktop restores to px-6 py-4
    <div className="px-3 py-3 sm:px-6 sm:py-4 bg-[var(--color-surface-hover)]/30 border-b border-[var(--color-surface-border)]">
      
      {/* Badges Row - wraps on mobile if needed */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-1.5">
        {task.priority && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${priorityStyle}`}>
            <AlertCircle size={9} aria-hidden="true" />
            {task.priority}
          </span>
        )}
        {task.status && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${statusStyle}`}>
            {getStatusIcon(task.status)}
            <span className="capitalize">{task.status.replace("_", " ")}</span>
          </span>
        )}
      </div>

      {/* Title - separate row for mobile clarity */}
      <h3 className="text-sm font-bold text-[var(--color-ink)] leading-tight mb-2">
        {task.title}
      </h3>

      {/* Description */}
      {truncatedDesc && (
        <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-3 line-clamp-2">
          {truncatedDesc}
        </p>
      )}

      {/* Meta Info: Category + Due Date */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
        {task.category && (
          <span className="flex items-center gap-1.5 text-[var(--color-ink-subtle)]">
            <Tag size={10} aria-hidden="true" />
            <span className="capitalize">{task.category}</span>
          </span>
        )}

        <span className={`flex items-center gap-1.5 ${
          dateInfo.isOverdue 
            ? "text-rose-600 dark:text-rose-400" 
            : "text-[var(--color-ink-subtle)]"
        }`}>
          <Calendar size={10} aria-hidden="true" />
          {dateInfo.text}
          {dateInfo.isOverdue && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] font-extrabold">OVERDUE</span>
          )}
        </span>
      </div>
    </div>
  );
}

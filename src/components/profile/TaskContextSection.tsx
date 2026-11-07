"use client";

import { Calendar, Tag, WarningCircle as AlertCircle, Clock, ArrowRight, CheckCircle as CheckCircle2, Prohibit as Ban } from "@phosphor-icons/react/ssr";
import type { Task } from "@/lib/types";

interface TaskContextSectionProps {
  task: Task;
}

export default function TaskContextSection({ task }: TaskContextSectionProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return { text: "No due date", isOverdue: false };
    const date = new Date(dateStr);
    const isOverdue = date < new Date();
    return {
      text: date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
      isOverdue
    };
  };

  const dateInfo = formatDate(task.due_date);

  const getPriorityStyle = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/10";
      case 'high':
        return "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/10";
      case 'medium':
        return "text-blue-600 dark:text-blue-400 bg-blue-500/5 border-blue-500/10";
      default:
        return "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]";
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'in_progress': return "text-blue-600 dark:text-blue-400 bg-blue-500/5 border-blue-500/10";
      case 'in_review': return "text-purple-600 dark:text-purple-400 bg-purple-500/5 border-purple-500/10";
      case 'blocked': return "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/10";
      case 'completed': return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10";
      case 'unassigned': return "text-[var(--color-ink-subtle)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]";
      default: return "text-slate-600 dark:text-slate-400 bg-slate-500/5 border-slate-500/10";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'in_progress': return <Clock size={10} className="shrink-0" aria-hidden="true" />;
      case 'in_review': return <AlertCircle size={10} className="shrink-0" aria-hidden="true" />;
      case 'blocked': return <Ban size={10} className="shrink-0" aria-hidden="true" />;
      case 'completed': return <CheckCircle2 size={10} className="shrink-0" aria-hidden="true" />;
      default: return <Clock size={10} className="shrink-0" aria-hidden="true" />;
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);
  const statusStyle = getStatusStyle(task.status);

  return (
    <div className="p-3.5 sm:p-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
      
      {/* Context Header */}
      <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
        <div className="w-1 h-3.5 sm:h-4 rounded-full bg-[var(--color-primary)] shrink-0" />
        <h3 className="text-[9px] sm:text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">
          Task Context
        </h3>
      </div>

      {/* Task Identity */}
      <div className="space-y-2.5 sm:space-y-3">
        <div>
          <p className="text-xs sm:text-sm font-bold text-[var(--color-ink)] leading-snug">
            {task.title}
          </p>
          {task.description && (
            <p className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-1 sm:mt-1.5 leading-relaxed line-clamp-3 sm:line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Meta Badges Wrapper */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 border-t border-[var(--color-surface-border)]/50">
          
          {/* Priority Badge */}
          {task.priority && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border shrink-0 ${priorityStyle}`}>
              <AlertCircle size={10} className="shrink-0" aria-hidden="true" />
              {task.priority}
            </span>
          )}

          {/* Status Badge */}
          {task.status && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border shrink-0 ${statusStyle}`}>
              {getStatusIcon(task.status)}
              <span className="capitalize">{task.status.replace("_", " ")}</span>
            </span>
          )}

          {/* Category Tag */}
          {task.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)] shrink-0">
              <Tag size={10} className="shrink-0" aria-hidden="true" />
              {task.category}
            </span>
          )}

          {/* Due Date */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] shrink-0 ${
            dateInfo.isOverdue 
              ? "text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/5" 
              : "text-[var(--color-ink-muted)]"
          }`}>
            <Calendar size={10} className="shrink-0" aria-hidden="true" />
            {dateInfo.text}
            {dateInfo.isOverdue && (
              <span className="ml-0.5 px-1 py-0.2 rounded bg-rose-500/15 text-[8px] sm:text-[9px] font-extrabold text-rose-600 dark:text-rose-400">
                OVERDUE
              </span>
            )}
          </span>

          {/* Target Reference Link */}
          {task.target_type && task.target_id && (
            <a 
              href={`/dashboard/${task.target_type}s/${task.target_id}`}
              className="w-full sm:w-auto sm:ml-auto pt-1 sm:pt-0 inline-flex items-center justify-end sm:justify-start gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors group shrink-0"
            >
              View {task.target_type} <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform shrink-0" aria-hidden="true" />
            </a>
          )}

        </div>
      </div>
    </div>
  );
}

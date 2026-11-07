// src/components/scheduler/UserStatsFooter.tsx
"use client";

import { Briefcase, CheckCircle as CheckCircle2, Warning as AlertTriangle } from "@phosphor-icons/react/ssr";
import { TeamMember, ScheduledTask } from "@/hooks/scheduler/useTaskSchedulerTimeline";
import { isBefore, startOfDay } from "date-fns";

interface UserStatsFooterProps {
  user: TeamMember;
  tasks: ScheduledTask[];
  onClose: () => void;
}

export default function UserStatsFooter({ user, tasks, onClose:_onClose }: UserStatsFooterProps) {
  const userTasks = tasks.filter((t) => t.assignedUserId === user.id);
  const activeTasks = userTasks.filter((t) => t.status !== "completed");
  const completedTasks = userTasks.filter((t) => t.status === "completed");
  
  const today = startOfDay(new Date());
  const overdueTasks = activeTasks.filter((t) => isBefore(startOfDay(new Date(t.dueDate)), today));
  
  const completionRate = userTasks.length > 0 
    ? Math.round((completedTasks.length / userTasks.length) * 100) 
    : 0;
    
  const capacityUtilization = Math.min(100, Math.round((activeTasks.length / 5) * 100));

  return (
    <div className="flex-none px-5 py-3.5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface)]/95 backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center justify-between gap-6">
        
        {/* Left: User Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[var(--color-primary)]">{user.fullName.charAt(0)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[var(--color-ink)] leading-tight truncate">{user.fullName}</h3>
            <p className="text-[11px] text-[var(--color-ink-muted)] truncate">
              {user.role} • {user.maxCapacityHours}h/wk
            </p>
          </div>
        </div>

        {/* Center: Stats in a single line */}
        <div className="flex items-center gap-6">
          {/* Active */}
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-[var(--color-primary)]" aria-hidden="true" />
            <div>
              <p className="text-[9px] font-bold uppercase text-[var(--color-ink-subtle)] leading-none">Active</p>
              <p className="text-sm font-extrabold text-[var(--color-ink)] tabular-nums leading-none mt-0.5">{activeTasks.length}</p>
            </div>
          </div>

          {/* Completed */}
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" aria-hidden="true" />
            <div>
              <p className="text-[9px] font-bold uppercase text-[var(--color-ink-subtle)] leading-none">Done</p>
              <p className="text-sm font-extrabold text-emerald-500 tabular-nums leading-none mt-0.5">{completedTasks.length}</p>
            </div>
          </div>

          {/* Overdue */}
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className={overdueTasks.length > 0 ? "text-rose-500" : "text-emerald-500"} aria-hidden="true" />
            <div>
              <p className="text-[9px] font-bold uppercase text-[var(--color-ink-subtle)] leading-none">Overdue</p>
              <p className={`text-sm font-extrabold tabular-nums leading-none mt-0.5 ${
                overdueTasks.length > 0 ? "text-rose-500" : "text-emerald-500"
              }`}>
                {overdueTasks.length}
              </p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="flex items-center gap-2 pl-4 border-l border-[var(--color-surface-border)]">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase text-[var(--color-ink-subtle)] leading-none">Rate</p>
              <p className="text-sm font-extrabold text-[var(--color-ink)] tabular-nums leading-none mt-0.5">{completionRate}%</p>
            </div>
          </div>

          {/* Capacity Bar */}
          <div className="w-32">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase text-[var(--color-ink-subtle)]">Capacity</span>
              <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{capacityUtilization}%</span>
            </div>
            <div className="w-full h-1.5 bg-[var(--color-surface-border)] rounded-full overflow-hidden">
              <div
                style={{ width: `${capacityUtilization}%` }}
                className={`h-full transition-all duration-500 ${
                  capacityUtilization > 90 ? "bg-rose-500" :
                  capacityUtilization > 70 ? "bg-amber-500" :
                  "bg-[var(--color-primary)]"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

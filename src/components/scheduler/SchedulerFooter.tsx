// src/components/scheduler/SchedulerFooter.tsx
"use client";

import { ChartBar as BarChart2, Pulse as Activity, Warning as AlertTriangle, TrendUp as TrendingUp } from "@phosphor-icons/react/ssr";

interface SchedulerFooterProps {
  activeCount: number;
  overdueCount: number;
  capacityUtilization: number;
  avgTasksPerUser: number;
  completionRate: number;
  burnoutRiskUsers: number;
}

export default function SchedulerFooter({
  activeCount,
  overdueCount,
  capacityUtilization,
  avgTasksPerUser,
  completionRate,
  burnoutRiskUsers,
}: SchedulerFooterProps) {
  return (
    <div className="flex-none px-5 py-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/40 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-6">
        
        {/* Left: Core Metrics - spread evenly */}
        <div className="flex items-center gap-8 flex-1">
          {/* Active Tasks */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <BarChart2 size={15} className="text-[var(--color-primary)]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] leading-none">Active</p>
              <p className="text-base font-extrabold text-[var(--color-ink)] tabular-nums leading-none mt-1">{activeCount}</p>
            </div>
          </div>

          {/* Overdue */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              overdueCount > 0 ? "bg-rose-500/10" : "bg-emerald-500/10"
            }`}>
              <AlertTriangle 
                size={15} 
                className={overdueCount > 0 ? "text-rose-500" : "text-emerald-500"} aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] leading-none">Overdue</p>
              <p className={`text-base font-extrabold tabular-nums leading-none mt-1 ${
                overdueCount > 0 ? "text-rose-500" : "text-emerald-500"
              }`}>
                {overdueCount}
              </p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <TrendingUp size={15} className="text-blue-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] leading-none">Completion</p>
              <p className="text-base font-extrabold text-[var(--color-ink)] tabular-nums leading-none mt-1">{completionRate}%</p>
            </div>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <Activity size={15} className="text-[var(--color-primary)]" aria-hidden="true" />
            </div>
            <div className="w-40">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] leading-none">Capacity</p>
                <p className="text-xs font-bold text-[var(--color-ink)] tabular-nums leading-none">{capacityUtilization}%</p>
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

        {/* Right: Health Warnings */}
        {(burnoutRiskUsers > 0 || avgTasksPerUser > 5) && (
          <div className="flex items-center gap-2 pl-4 border-l border-[var(--color-surface-border)]">
            {burnoutRiskUsers > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <AlertTriangle size={12} className="shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold">{burnoutRiskUsers} at burnout risk</span>
              </div>
            )}
            {avgTasksPerUser > 5 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Activity size={12} className="shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold">Avg {avgTasksPerUser.toFixed(1)} tasks/user</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

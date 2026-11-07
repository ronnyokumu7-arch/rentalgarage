"use client";

import { Calendar, TrendUp as TrendingUp } from "@phosphor-icons/react/ssr";
import SectionCard from "@/components/ui/SectionCard";
import type { ClientStats } from "@/hooks/useClientProfile";

interface ClientStatsCardProps {
  stats: ClientStats;
}

export default function ClientStatsCard({ stats }: ClientStatsCardProps) {
  return (
    <SectionCard className="!p-0 overflow-hidden shadow-2xs border-[var(--color-surface-border)] rounded-xl group/card">
      
      {/* Executive Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/10">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
          <h3 className="text-[10px] font-mono font-bold text-[var(--color-ink)] uppercase tracking-widest">
            Performance Index
          </h3>
        </div>
        <span className="text-[9px] font-mono font-semibold text-[var(--color-ink-subtle)] uppercase tracking-wider">
          LTV Metrics
        </span>
      </div>

      {/* Unboxed Open Metric Grid */}
      <div className="grid grid-cols-2 divide-x divide-[var(--color-surface-border)] p-3.5 relative">
        
        {/* Subtle Background Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/2 via-transparent to-emerald-500/2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Total Bookings Column */}
        <div className="pr-3.5 flex flex-col justify-between space-y-2 relative z-10">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-ink-muted)] flex items-center gap-1.5">
              <Calendar size={11} className="text-[var(--color-ink-subtle)]" aria-hidden="true" />
              Bookings
            </span>
            <span className="text-[9px] font-mono px-1 rounded text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
              Count
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-black text-[var(--color-ink)] tracking-tight">
              {stats.totalBookings.toLocaleString()}
            </span>
            <span className="text-[9px] font-mono font-bold text-[var(--color-ink-subtle)] uppercase tracking-wider">
              {stats.totalBookings === 1 ? "trip" : "trips"}
            </span>
          </div>
        </div>

        {/* Total Revenue Column */}
        <div className="pl-3.5 flex flex-col justify-between space-y-2 relative z-10">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-ink-muted)] flex items-center gap-1.5">
              <TrendingUp size={11} className="text-emerald-500" aria-hidden="true" />
              Revenue
            </span>
            <span className="text-[9px] font-mono px-1 rounded text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold">
              Gross
            </span>
          </div>

          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-[10px] font-mono font-bold text-emerald-600/70 dark:text-emerald-400/70 shrink-0">
              {stats.currencyCode}
            </span>
            <span className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
              {stats.totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

    </SectionCard>
  );
}

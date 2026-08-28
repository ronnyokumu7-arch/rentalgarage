// src/components/financials/overview/RevenueOverviewWidget.tsx
"use client";

import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Sparkles, Clock } from "lucide-react";
import type { RevenueOverview } from "@/hooks/financials/useFinancialOverview";

interface Props {
  data: RevenueOverview;
}

export default function RevenueOverviewWidget({ data }: Props) {
  const maxAmount = Math.max(...data.monthly_trend.map(m => m.amount), 1);

  // ✅ Smart formatting: removes .00 for whole numbers, keeps 2 decimals for cents
  const formatCurrency = (amount: number) => {
    const rounded = Math.round(amount * 100) / 100;
    if (rounded === Math.floor(rounded)) {
      return `KES ${rounded.toLocaleString()}`;
    } else {
      return `KES ${rounded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Calculate month-over-month change
  const getTrend = () => {
    const trend = data.monthly_trend;
    if (trend.length < 2) return { change: 0, positive: true };
    const last = trend[trend.length - 1].amount;
    const prev = trend[trend.length - 2].amount;
    if (prev === 0) return { change: 0, positive: true };
    const change = ((last - prev) / prev) * 100;
    return { change: Math.abs(change), positive: change >= 0 };
  };

  const trend = getTrend();

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]">
      
      {/* Header - Unified with other widgets */}
      <div className="px-5 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
              <Wallet size={16} />
            </div>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Revenue Overview</h3>
              <p className="text-[10px] text-[var(--color-ink-subtle)]">Monthly performance &amp; trends</p>
            </div>
          </div>
          {trend.change > 0 && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold border ${
              trend.positive 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            }`}>
              {trend.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend.change.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="p-5 space-y-4">
        
        {/* Row 1: Total Revenue - Premium Hero Card */}
        <div className="relative bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-primary)]/5 to-transparent rounded-2xl p-4 border border-[var(--color-primary)]/20 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Total Revenue</p>
              <div className="flex items-center gap-1">
                <Sparkles size={12} className="text-[var(--color-primary)] opacity-60" />
                <span className="text-[8px] font-medium text-[var(--color-ink-muted)] uppercase tracking-wider">Lifetime</span>
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[var(--color-ink)] tabular-nums tracking-tight">
              {formatCurrency(data.total_revenue)}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">Lifetime earnings</span>
              <span className="w-px h-3 bg-[var(--color-surface-border)]" />
              <div className={`flex items-center gap-1 text-[10px] font-bold ${
                trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}>
                {trend.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend.positive ? "+" : ""}{trend.change.toFixed(1)}% vs last month
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Two-column stats with improved visual hierarchy */}
        <div className="grid grid-cols-2 gap-3">
          {/* Avg Monthly */}
          <div className="bg-[var(--color-surface-hover)]/30 rounded-xl p-3.5 border border-[var(--color-surface-border)] transition-all duration-200 hover:border-[var(--color-primary)]/20 hover:bg-[var(--color-surface-hover)]/50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Avg. Monthly</p>
              <TrendingUp size={12} className="text-emerald-500/60" />
            </div>
            <p className="text-base font-extrabold text-[var(--color-ink)] tabular-nums">
              {formatCurrency(data.avg_monthly_revenue)}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-medium text-emerald-600 dark:text-emerald-400">Stable</span>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-[var(--color-surface-hover)]/30 rounded-xl p-3.5 border border-[var(--color-surface-border)] transition-all duration-200 hover:border-amber-500/20 hover:bg-[var(--color-surface-hover)]/50">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Pending</p>
              <Clock size={12} className="text-amber-500/60" />
            </div>
            <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
              {formatCurrency(data.total_pending)}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[8px] font-medium text-[var(--color-ink-muted)]">Awaiting collection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart - Premium with better visual feedback */}
      <div className="px-5 pb-5">
        <div className="bg-[var(--color-surface-hover)]/20 rounded-xl p-4 border border-[var(--color-surface-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              <p className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Monthly Trend</p>
            </div>
            <span className="text-[8px] font-medium text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] px-2 py-0.5 rounded-full border border-[var(--color-surface-border)]">
              Last {data.monthly_trend.length} months
            </span>
          </div>
          
          <div className="h-32 flex items-end justify-between gap-1.5">
            {data.monthly_trend.map((item, index) => {
              const heightPercent = (item.amount / maxAmount) * 100;
              const isLast = index === data.monthly_trend.length - 1;
              const isSecondLast = index === data.monthly_trend.length - 2;
              
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full relative flex items-end h-20">
                    {/* Bar with gradient and hover effects */}
                    <div 
                      className={`w-full rounded-t transition-all duration-500 origin-bottom ${
                        isLast 
                          ? "bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary)]/70 shadow-lg shadow-[var(--color-primary)]/20" 
                          : isSecondLast
                          ? "bg-[var(--color-primary)]/30 group-hover:bg-[var(--color-primary)]/50"
                          : "bg-[var(--color-primary)]/20 group-hover:bg-[var(--color-primary)]/30"
                      }`}
                      style={{ 
                        height: `${Math.max(heightPercent, 4)}%`,
                        transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                      <span className="text-[8px] font-bold text-[var(--color-ink)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded shadow-sm border border-[var(--color-surface-border)] whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    {/* Pulse dot on last bar */}
                    {isLast && (
                      <div className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[8px] font-medium transition-colors ${
                    isLast ? "text-[var(--color-primary)] font-bold" : "text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]"
                  }`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

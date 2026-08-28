// src/components/financials/overview/InvoiceStatusWidget.tsx
import { CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { InvoiceStatusSummary } from "@/hooks/financials/useFinancialOverview";

interface Props {
  data: InvoiceStatusSummary;
}

export default function InvoiceStatusWidget({ data }: Props) {
  // Calculate if collection rate is trending
  const getTrendIcon = (rate: number) => {
    if (rate >= 70) return <TrendingUp size={14} className="text-emerald-500" />;
    if (rate >= 40) return <Minus size={14} className="text-amber-500" />;
    return <TrendingDown size={14} className="text-rose-500" />;
  };

  const getTrendLabel = (rate: number) => {
    if (rate >= 70) return "Healthy";
    if (rate >= 40) return "Moderate";
    return "Needs attention";
  };

  const statuses = [
    {
      key: "paid",
      label: "Paid",
      count: data.paid_count,
      percentage: data.paid_percentage,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      hoverBg: "hover:bg-emerald-500/15",
      progressColor: "bg-emerald-500",
    },
    {
      key: "pending",
      label: "Pending",
      count: data.pending_count,
      percentage: data.pending_percentage,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      hoverBg: "hover:bg-amber-500/15",
      progressColor: "bg-amber-500",
    },
    {
      key: "overdue",
      label: "Overdue",
      count: data.overdue_count,
      percentage: data.overdue_percentage,
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      hoverBg: "hover:bg-rose-500/15",
      progressColor: "bg-rose-500",
    },
  ];

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-6 flex flex-col h-full transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]">
      {/* Header with gradient accent */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Invoice Status</h3>
            <p className="text-[10px] text-[var(--color-ink-subtle)]">Real-time invoice health</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Total</span>
          <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">
            {data.paid_count + data.pending_count + data.overdue_count}
          </span>
        </div>
      </div>

      {/* Status Cards - Grid with hover effects */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {statuses.map((status) => {
          const Icon = status.icon;
          return (
            <div
              key={status.key}
              className={`relative group ${status.bg} border ${status.border} rounded-xl p-3.5 flex flex-col items-center text-center transition-all duration-200 ${status.hoverBg} hover:border-opacity-40 hover:shadow-sm cursor-default`}
            >
              <div className={`${status.color} mb-1.5 transition-transform group-hover:scale-110 duration-200`}>
                <Icon size={17} strokeWidth={2} />
              </div>
              <p className="text-xl font-bold text-[var(--color-ink)] tabular-nums leading-none">
                {status.count}
              </p>
              <p className={`text-[10px] font-medium ${status.color} mt-1`}>
                {status.percentage}%
              </p>
              <p className="text-[9px] font-medium text-[var(--color-ink-muted)] uppercase tracking-wider mt-0.5">
                {status.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Collection Rate - Premium Progress */}
      <div className="mt-auto pt-4 border-t border-[var(--color-surface-border)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Collection Rate</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
              {getTrendIcon(data.collection_rate)}
              <span className="text-[9px] font-medium text-[var(--color-ink-muted)]">
                {getTrendLabel(data.collection_rate)}
              </span>
            </div>
          </div>
          <span className="text-base font-bold text-[var(--color-ink)] tabular-nums">
            {data.collection_rate}%
          </span>
        </div>
        
        {/* Animated Progress Bar with Gradient */}
        <div className="relative w-full h-2.5 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
          <div 
            className="absolute inset-0 h-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${Math.min(data.collection_rate, 100)}%`,
              opacity: data.collection_rate > 0 ? 1 : 0.3
            }}
          />
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"
            style={{ 
              width: `${Math.min(data.collection_rate, 100)}%`,
              animation: 'shimmer 3s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* Subtle status indicators */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            {statuses.map((status) => (
              <div key={status.key} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${status.bg} border ${status.border}`} />
                <span className="text-[9px] font-medium text-[var(--color-ink-muted)]">
                  {status.percentage}%
                </span>
              </div>
            ))}
          </div>
          <span className="text-[9px] font-medium text-[var(--color-ink-faint)] uppercase tracking-wider">
            {data.collection_rate >= 70 ? '✅ On track' : data.collection_rate >= 40 ? '⚡ Improving' : '⚠️ Review needed'}
          </span>
        </div>
      </div>
    </div>
  );
}

// src/components/tenants/health/SupportTicketTrend.tsx
import { Chat as MessageSquare, Clock, CheckCircle as CheckCircle2, TrendUp as TrendingUp, TrendDown as TrendingDown, Minus } from "@phosphor-icons/react/ssr";
import type { SupportTicketTrend } from '@/lib/types';

interface SupportTicketTrendProps {
  data: SupportTicketTrend;
}

export function SupportTicketTrend({ data }: SupportTicketTrendProps) {
  // Determine trend color
  const getTrendConfig = (trend: string) => {
    switch (trend) {
      case 'up': return { color: 'text-rose-400', icon: TrendingUp, label: 'Increasing' };
      case 'down': return { color: 'text-emerald-400', icon: TrendingDown, label: 'Decreasing' };
      default: return { color: 'text-slate-400', icon: Minus, label: 'Stable' };
    }
  };

  const trend = getTrendConfig(data.trend);
  const TrendIcon = trend.icon;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      {/* Header - Fixed Height */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
            <MessageSquare size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Support Tickets</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Agency satisfaction signal</p>
          </div>
        </div>
        
        {/* Trend Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] ${trend.color}`}>
          <TrendIcon size={12} aria-hidden="true" />
          {trend.label}
        </div>
      </div>

      {/* Body - Flexible Space Distribution */}
      <div className="flex-1 flex flex-col p-5 min-h-0">
        
        {/* Hero Metric - Takes top space */}
        <div className="flex-1 flex items-start pt-2 min-h-0">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[var(--color-ink)] tracking-tight">
              {data.openTickets}
            </span>
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">
              open <span className="text-[var(--color-ink-subtle)]">tickets</span>
            </span>
          </div>
        </div>

        {/* Secondary Metrics - Fixed at bottom */}
        <div className="shrink-0">
          <div className="h-px bg-[var(--color-surface-border)]/50 mb-4" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 size={11} className="opacity-50" aria-hidden="true" /> Resolved (30d)
              </label>
              <p className="text-lg font-bold text-[var(--color-ink)]">{data.closedThisMonth}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={11} className="opacity-50" aria-hidden="true" /> Avg Resolution
              </label>
              <p className="text-lg font-bold text-[var(--color-ink)]">
                {data.avgResolutionTimeHours}
                <span className="text-xs font-medium text-[var(--color-ink-muted)] ml-1">hrs</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

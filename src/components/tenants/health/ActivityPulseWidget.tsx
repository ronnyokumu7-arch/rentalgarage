// src/components/tenants/health/ActivityPulseWidget.tsx
import { CursorClick as MousePointerClick, Clock, CalendarDots as CalendarDays, Lightning as Zap } from "@phosphor-icons/react/ssr";
import type { ActivityPulse } from '@/lib/types';

interface ActivityPulseWidgetProps {
  data: ActivityPulse;
}

export function ActivityPulseWidget({ data }: ActivityPulseWidgetProps) {
  // Smart relative time formatter
  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isActiveRecently = data.lastActiveAt && (new Date().getTime() - new Date(data.lastActiveAt).getTime()) < 86400000 * 3;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <MousePointerClick size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Activity Pulse</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Platform engagement</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-5">
        {/* Hero Metric */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-[var(--color-ink)] tracking-tight">
            {data.loginsLast7Days}
          </span>
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">
            logins <span className="text-[var(--color-ink-subtle)]">(7d)</span>
          </span>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
            {data.loginsLast30Days} <span className="text-[var(--color-ink-subtle)]">/ 30d</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--color-surface-border)]/50" />

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-1.5">
              <CalendarDays size={11} className="opacity-50" aria-hidden="true" /> Active Days
            </label>
            <p className="text-lg font-bold text-[var(--color-ink)]">
              {data.activeDaysThisMonth}
              <span className="text-xs font-medium text-[var(--color-ink-muted)] ml-1">/ 30</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={11} className="opacity-50" aria-hidden="true" /> Avg Session
            </label>
            <p className="text-lg font-bold text-[var(--color-ink)]">
              {data.avgSessionDurationMinutes}
              <span className="text-xs font-medium text-[var(--color-ink-muted)] ml-1">min</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Live Heartbeat */}
      <div className="px-5 py-3 border-t border-[var(--color-surface-border)]/50 bg-[var(--color-surface-hover)]/20 flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">
          Last Active
        </span>
        <div className="flex items-center gap-1.5">
          <Zap size={12} className={isActiveRecently ? "text-emerald-400" : "text-slate-500"} aria-hidden="true" />
          <span className={`text-xs font-semibold ${isActiveRecently ? "text-emerald-400" : "text-slate-500"}`}>
            {formatLastActive(data.lastActiveAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

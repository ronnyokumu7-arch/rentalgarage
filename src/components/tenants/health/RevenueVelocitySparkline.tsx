// src/components/tenants/health/RevenueVelocitySparkline.tsx
import { TrendUp as TrendingUp, TrendDown as TrendingDown, Minus, ChartBar as BarChart3 } from "@phosphor-icons/react/ssr";
import type { RevenueVelocity } from '@/lib/types';

interface RevenueVelocitySparklineProps {
  data: RevenueVelocity;
}

export function RevenueVelocitySparkline({ data }: RevenueVelocitySparklineProps) {
  // Calculate trend indicator color and icon
  const getTrendConfig = (trend: string) => {
    switch (trend) {
      case 'up': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: TrendingUp };
      case 'down': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: TrendingDown };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Minus };
    }
  };

  const trend = getTrendConfig(data.trend);
  const TrendIcon = trend.icon;

  // Generate SVG path for sparkline
  const generateSparklinePath = (values: number[]) => {
    if (values.length < 2) return '';
    const max = Math.max(...values, 1);
    const width = 100;
    const height = 40;
    const stepX = width / (values.length - 1);
    
    const points = values.map((val, i) => {
      const x = i * stepX;
      const y = height - (val / max) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const sparklinePath = generateSparklinePath(data.weeklyData);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
            <BarChart3 size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Revenue Velocity</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Booking momentum</p>
          </div>
        </div>
        
        {/* Trend Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${trend.bg} ${trend.color} ${trend.border}`}>
          <TrendIcon size={12} aria-hidden="true" />
          {data.trend === 'up' ? 'Growing' : data.trend === 'down' ? 'Declining' : 'Stable'}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-5">
        
        {/* Hero Metric */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-[var(--color-ink)] tracking-tight">
            {data.bookingsThisWeek}
          </span>
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">
            bookings <span className="text-[var(--color-ink-subtle)]">(this week)</span>
          </span>
        </div>

        {/* Sparkline Chart */}
        <div className="relative h-12 w-full">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <path
              d={sparklinePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-violet-400"
            />
            {/* End point dot */}
            {data.weeklyData.length > 0 && (
              <circle
                cx="100"
                cy={40 - (data.weeklyData[data.weeklyData.length - 1] / Math.max(...data.weeklyData, 1)) * 40}
                r="3"
                className="fill-violet-400"
              />
            )}
          </svg>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--color-surface-border)]/50" />

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Last Week</label>
            <p className="text-lg font-bold text-[var(--color-ink)]">{data.bookingsLastWeek}</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">This Month</label>
            <p className="text-lg font-bold text-[var(--color-ink)]">{data.bookingsThisMonth}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

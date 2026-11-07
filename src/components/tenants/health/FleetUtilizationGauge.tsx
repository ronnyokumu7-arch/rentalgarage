// src/components/tenants/health/FleetUtilizationGauge.tsx
import { Car } from "@phosphor-icons/react/ssr";
import type { FleetUtilization } from '@/lib/types';

interface FleetUtilizationGaugeProps {
  data: FleetUtilization;
}

export function FleetUtilizationGauge({ data }: FleetUtilizationGaugeProps) {
  // Determine color based on utilization health
  const getHealthColor = (pct: number) => {
    if (pct >= 70) return { text: 'text-emerald-400', ring: 'stroke-emerald-400', bg: 'bg-emerald-500/10' };
    if (pct >= 40) return { text: 'text-amber-400', ring: 'stroke-amber-400', bg: 'bg-amber-500/10' };
    return { text: 'text-rose-400', ring: 'stroke-rose-400', bg: 'bg-rose-500/10' };
  };

  const colors = getHealthColor(data.utilizationPercentage);

  // Calculate SVG arc
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.utilizationPercentage / 100) * circumference;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      {/* Header - Fixed Height */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
            <Car size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Fleet Utilization</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Asset efficiency</p>
          </div>
        </div>
      </div>

      {/* Body - Flexible Space Distribution */}
      <div className="flex-1 flex flex-col p-5 min-h-0">
        
        {/* Gauge Container - Takes remaining space, centers content */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="relative w-full max-w-[144px] aspect-square flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-[var(--color-surface-border)]"
              />
              {/* Progress Arc */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`${colors.ring} transition-all duration-1000 ease-out`}
              />
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${colors.text}`}>
                {data.utilizationPercentage}%
              </span>
              <span className="text-[9px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mt-1">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats & Badge - Fixed at bottom */}
        <div className="space-y-4 pt-4 shrink-0">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 w-full border-t border-[var(--color-surface-border)]/50 pt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Active</label>
              <p className="text-lg font-bold text-[var(--color-ink)]">{data.activeVehicles}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Idle</label>
              <p className="text-lg font-bold text-[var(--color-ink-muted)]">{data.idleVehiclesCount}</p>
            </div>
          </div>

          {/* Total Fleet Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-[var(--color-ink-muted)] w-full justify-center">
            <Car size={12} aria-hidden="true" />
            Total Fleet: {data.totalVehicles} vehicles
          </div>
        </div>
      </div>
    </div>
  );
}

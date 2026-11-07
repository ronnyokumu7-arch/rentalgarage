// src/components/tenants/health/HealthScoreCard.tsx
import { Pulse as Activity, TrendUp as TrendingUp, TrendDown as TrendingDown, Minus, Warning as AlertTriangle, ShieldCheck, ShieldWarning as ShieldAlert } from "@phosphor-icons/react/ssr";
import type { HealthScore } from '@/lib/types';

interface HealthScoreCardProps {
  score: HealthScore;
}

export function HealthScoreCard({ score }: HealthScoreCardProps) {
  // Determine colors based on risk level
  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'low':
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          ring: 'stroke-emerald-400',
          icon: ShieldCheck,
        };
      case 'medium':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          ring: 'stroke-amber-400',
          icon: Activity,
        };
      case 'high':
        return {
          text: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
          ring: 'stroke-orange-400',
          icon: AlertTriangle,
        };
      case 'critical':
        return {
          text: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          ring: 'stroke-rose-400',
          icon: ShieldAlert,
        };
      default:
        return {
          text: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          ring: 'stroke-slate-400',
          icon: Activity,
        };
    }
  };

  const styles = getRiskStyles(score.riskLevel);
  const RiskIcon = styles.icon;

  // Calculate SVG ring progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score.score / 100) * circumference;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      {/* Header - Fixed Height */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Activity size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Agency Health Score</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Composite performance metric</p>
          </div>
        </div>
      </div>

      {/* Body - Flexible Space Distribution */}
      <div className="flex-1 flex flex-col p-5 min-h-0">
        
        {/* Gauge Container - Takes remaining space, centers content */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="relative w-full max-w-[160px] aspect-square flex items-center justify-center">
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
              {/* Progress Ring */}
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
                className={`${styles.ring} transition-all duration-1000 ease-out`}
              />
            </svg>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${styles.text}`}>
                {score.score}
              </span>
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mt-1">
                / 100
              </span>
            </div>
          </div>
        </div>

        {/* Badges & Footer - Fixed at bottom */}
        <div className="space-y-4 pt-4 shrink-0">
          {/* Risk Level Badge & Trend */}
          <div className="flex items-center justify-center gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${styles.bg} ${styles.text} ${styles.border}`}>
              <RiskIcon size={14} aria-hidden="true" />
              {score.riskLevel} Risk
            </div>
            
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] ${
              score.trend === 'up' ? 'text-emerald-400' : 
              score.trend === 'down' ? 'text-rose-400' : 'text-slate-400'
            }`}>
              {score.trend === 'up' && <TrendingUp size={14} aria-hidden="true" />}
              {score.trend === 'down' && <TrendingDown size={14} aria-hidden="true" />}
              {score.trend === 'stable' && <Minus size={14} aria-hidden="true" />}
              {score.trend === 'up' ? 'Improving' : score.trend === 'down' ? 'Declining' : 'Stable'}
            </div>
          </div>

          {/* Last Calculated */}
          <div className="text-center border-t border-[var(--color-surface-border)]/50 pt-3">
            <p className="text-[9px] text-[var(--color-ink-subtle)] uppercase tracking-widest mb-1">
              Last calculated
            </p>
            <p className="text-xs font-medium text-[var(--color-ink-muted)]">
              {new Date(score.lastCalculatedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/tenants/health/PaymentReliabilityStreak.tsx
import { CreditCard, CheckCircle as CheckCircle2, WarningCircle as AlertCircle, TrendUp as TrendingUp } from "@phosphor-icons/react/ssr";
import type { PaymentReliability } from '@/lib/types';

interface PaymentReliabilityStreakProps {
  data: PaymentReliability;
}

export function PaymentReliabilityStreak({ data }: PaymentReliabilityStreakProps) {
  // Determine streak color based on reliability
  const getReliabilityColor = (rate: number) => {
    if (rate >= 95) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    if (rate >= 80) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
  };

  const colors = getReliabilityColor(data.onTimePaymentRate);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text}`}>
            <CreditCard size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Payment Reliability</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Financial trust score</p>
          </div>
        </div>
        
        {/* Rate Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
          <TrendingUp size={12} aria-hidden="true" />
          {data.onTimePaymentRate}% On-Time
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-5">
        
        {/* Hero Streak Metric */}
        <div className="flex items-baseline gap-3">
          <span className={`text-3xl font-bold ${colors.text} tracking-tight`}>
            {data.currentStreak}
          </span>
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">
            consecutive <span className="text-[var(--color-ink-subtle)]">on-time payments</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--color-surface-border)]/50" />

        {/* Secondary Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-1.5">
              <CheckCircle2 size={11} className="opacity-50" aria-hidden="true" /> Paid Invoices
            </label>
            <p className="text-lg font-bold text-[var(--color-ink)]">{data.totalInvoicesPaid}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle size={11} className="opacity-50" aria-hidden="true" /> Overdue
            </label>
            <p className={`text-lg font-bold ${data.overdueInvoicesCount > 0 ? 'text-rose-400' : 'text-[var(--color-ink)]'}`}>
              {data.overdueInvoicesCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

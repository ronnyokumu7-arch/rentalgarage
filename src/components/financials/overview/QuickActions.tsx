// src/components/financials/overview/QuickActions.tsx
import { Plus, DollarSign, FileText } from "lucide-react";

interface QuickActionsProps {
  onCreateInvoice: () => void;
  onRecordPayment: () => void;
  onGenerateContract: () => void;
}

export default function QuickActions({ onCreateInvoice, onRecordPayment, onGenerateContract }: QuickActionsProps) {
  return (
    <div className="space-y-3">
      {/* Create Invoice */}
      <button 
        onClick={onCreateInvoice}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/10 transition-colors text-left group"
      >
        <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-primary)] shadow-sm transition-transform group-hover:scale-105">
          <Plus size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-ink)]">Create Invoice</p>
          <p className="text-xs text-[var(--color-ink-muted)]">Bill a client instantly</p>
        </div>
      </button>
      
      {/* Record Payment */}
      <button 
        onClick={onRecordPayment}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-success-bg)]/30 border border-[var(--color-success-bg)] hover:bg-[var(--color-success-bg)]/50 transition-colors text-left group"
      >
        <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-success-text)] shadow-sm transition-transform group-hover:scale-105">
          <DollarSign size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-ink)]">Record Payment</p>
          <p className="text-xs text-[var(--color-ink-muted)]">Log offline transactions</p>
        </div>
      </button>

      {/* ✅ Generate Contract */}
      <button 
        onClick={onGenerateContract}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20 hover:bg-violet-500/10 transition-colors text-left group"
      >
        <div className="w-9 h-9 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm transition-transform group-hover:scale-105">
          <FileText size={16} />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--color-ink)]">Generate Contract</p>
          <p className="text-xs text-[var(--color-ink-muted)]">Create rental agreement</p>
        </div>
      </button>
    </div>
  );
}

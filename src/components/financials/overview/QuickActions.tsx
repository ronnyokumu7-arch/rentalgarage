// src/components/financials/overview/QuickActions.tsx
import { Plus, CreditCard, FileText, ChevronRight } from "lucide-react";

interface QuickActionsProps {
  onOpenCreateInvoice: () => void;
  onOpenRecordPayment: () => void;
  onOpenGenerateContract: () => void;
}

export default function QuickActions({ 
  onOpenCreateInvoice, 
  onOpenRecordPayment, 
  onOpenGenerateContract 
}: QuickActionsProps) {
  const actions = [
    {
      icon: Plus,
      label: "Create Invoice",
      description: "Bill a client instantly",
      onClick: onOpenCreateInvoice,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      hoverBg: "hover:bg-emerald-500/5"
    },
    {
      icon: CreditCard,
      label: "Record Payment",
      description: "Log offline transactions",
      onClick: onOpenRecordPayment,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
      hoverBg: "hover:bg-blue-500/5"
    },
    {
      icon: FileText,
      label: "Generate Contract",
      description: "Create rental agreement",
      onClick: onOpenGenerateContract,
      color: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
      hoverBg: "hover:bg-violet-500/5"
    }
  ];

  return (
    <div className="space-y-2.5">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className="group w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/20 transition-all duration-200 hover:shadow-sm text-left"
          >
            {/* Icon with gradient background matching Activity Feed style */}
            <div className={`relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${action.color} border`}>
              <Icon size={15} />
            </div>
            
            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-ink)]">{action.label}</p>
              <p className="text-[11px] text-[var(--color-ink-muted)] truncate">{action.description}</p>
            </div>
            
            {/* Chevron indicator matching Activity Feed */}
            <ChevronRight 
              size={14} 
              className="text-[var(--color-ink-faint)] group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all flex-shrink-0" 
            />
          </button>
        );
      })}
    </div>
  );
}

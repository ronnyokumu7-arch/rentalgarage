// src/components/dashboard/features/BookingActionsSheet.tsx
"use client";

import { useState } from "react";
import {
  Loader2
} from "lucide-react";
import Modal from "@/components/ui/Modal";

export type SheetStatusTone = "success" | "warning" | "danger" | "info";

export interface SheetAction {
  kind: "view" | "action";
  label: string;
  icon?: React.ElementType;
  tone?: "success" | "danger" | "default";
  onClick: () => void | Promise<void>;
}

interface BookingActionsSheetProps {
  open: boolean;
  onClose: () => void;
  statusLabel: string;
  statusTone: SheetStatusTone;
  actions: SheetAction[];
}

export default function BookingActionsSheet({
  open,
  onClose,
  statusLabel,
  statusTone,
  actions,
}: BookingActionsSheetProps) {
  const [pending, setPending] = useState<string | null>(null);

  const toneColor = {
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-rose-600 dark:text-rose-400",
    info: "text-blue-600 dark:text-blue-400",
  }[statusTone];

  const toneBg = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-blue-500",
  }[statusTone];

  const actionTone = {
    success: "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20",
    danger: "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border-rose-500/20",
    default: "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]/60",
  };

  const handleAction = async (action: SheetAction) => {
    if (action.kind === "view") {
      action.onClick();
      onClose();
      return;
    }
    
    setPending(action.label);
    try {
      await action.onClick();
      onClose();
    } finally {
      setPending(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Booking Actions"
      subtitle={statusLabel}
      size="sm"
    >
      <div className="space-y-2.5">
        {/* ✅ Clean Status Chip */}
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]/60 mb-2 ${toneColor}`}>
          <span className={`w-2 h-2 rounded-full ${toneBg}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {statusLabel}
          </span>
        </div>

        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => handleAction(action)}
            disabled={pending !== null}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold border transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              action.kind === "view" 
                ? "text-[var(--color-ink)] bg-[var(--color-surface-hover)]/50 hover:bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]/60"
                : actionTone[action.tone || "default"]
            }`}
          >
            {pending === action.label ? (
              <Loader2 size={16} className="animate-spin" />
            ) : action.icon ? (
              <action.icon size={16} />
            ) : null}
            {action.label}
          </button>
        ))}

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 px-4 py-3 rounded-xl text-sm font-bold text-[var(--color-ink-muted)] bg-transparent hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}

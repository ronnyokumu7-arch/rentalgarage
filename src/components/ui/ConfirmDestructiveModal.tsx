// src/components/ui/ConfirmDestructiveModal.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDestructiveModalProps {
  open: boolean;
  title: string;
  message: string;
  /** The string the user must type to confirm (e.g. tenant name). */
  confirmWord: string;
  confirmLabel?: string;
  dangerVariant?: "danger" | "warning";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDestructiveModal({
  open, title, message, confirmWord, confirmLabel = "Confirm",
  dangerVariant = "danger", loading = false, onConfirm, onCancel,
}: ConfirmDestructiveModalProps) {
  const [input, setInput] = useState("");
  const canConfirm = input === confirmWord;

  useEffect(() => {
    if (open) setInput("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onCancel]);

  if (!open) return null;

  const accent =
    dangerVariant === "danger"
      ? {
          bg: "bg-[var(--color-danger-bg)]",
          icon: "text-[var(--color-danger-text)]",
          btn: "bg-[var(--color-danger)] hover:opacity-90",
        }
      : {
          bg: "bg-[var(--color-warning-bg)]",
          icon: "text-[var(--color-warning-text)]",
          btn: "bg-amber-500 hover:opacity-90",
        };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-xl)] overflow-hidden">
        <div className={`px-5 py-4 ${accent.bg} flex items-start gap-3`}>
          <AlertTriangle className={`w-5 h-5 ${accent.icon} shrink-0 mt-0.5`} />
          <div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">{title}</h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <span className="label">
              Type <strong className="font-mono">{confirmWord}</strong> to confirm
            </span>
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={confirmWord}
              className="input font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canConfirm) onConfirm();
              }}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button onClick={onCancel} disabled={loading} className="btn btn-secondary flex-1 text-xs">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canConfirm || loading}
              className={`btn text-xs flex-1 text-white ${accent.btn}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

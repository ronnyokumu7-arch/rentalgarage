// src/components/ui/ConfirmDestructiveModal.tsx
"use client";

import { useEffect, useState } from "react";
import { CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";
import Modal from "./Modal";

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

  if (!open) return null;

  const accent =
    dangerVariant === "danger"
      ? {
          btn: "bg-[var(--color-danger)] hover:opacity-90",
        }
      : {
          btn: "bg-amber-500 hover:opacity-90",
        };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      subtitle={message}
      size="sm"
      bodyClassName="p-0"
    >
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

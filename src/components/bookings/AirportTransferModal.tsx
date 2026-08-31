"use client";

import { X } from "lucide-react";
import AirportTransferForm from "./AirportTransferForm";

interface AirportTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AirportTransferModal({ isOpen, onClose }: AirportTransferModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-[var(--color-bg)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-surface-border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-ink)]">New Airport Transfer Booking</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-6">
          <AirportTransferForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

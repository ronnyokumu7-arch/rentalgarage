// src/components/modals/SelfDriveBookingModal.tsx
"use client";

import { X, CheckCircle } from "lucide-react";
import BookingForm from "./BookingForm";

interface SelfDriveBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SelfDriveBookingModal({ isOpen, onClose }: SelfDriveBookingModalProps) {
  if (!isOpen) return null;

  return (
    // Outer container: Full screen bottom sheet on mobile, centered card on desktop
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative w-full sm:max-w-5xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] border-b-0 sm:border-b rounded-t-2xl sm:rounded-2xl shadow-[var(--shadow-2xl)] flex flex-col max-h-[95vh] sm:max-h-[90vh] pb-[env(safe-area-inset-bottom,0px)] animate-in slide-in-from-bottom sm:zoom-in-95 sm:slide-in-from-bottom-0 duration-300 ease-out">
        
        {/* iOS drag handle indicator — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 -mb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-surface-border)]" />
        </div>

        {/* ── Sticky Header ────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] rounded-t-2xl sm:rounded-t-none">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-ink)] tracking-tight">
              New Self-Drive Booking
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-0.5">
              Create a new rental reservation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-150 active:scale-95"
            aria-label="Close modal"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* ── Scrollable Form Content ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-[var(--color-bg)]">
          <BookingForm formId="selfdrive-booking-form" onClose={onClose} />
        </div>

        {/* ── Sticky Footer ────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-4 sm:px-6 py-4 sm:py-5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface)] sm:rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="selfdrive-booking-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40 transition-all active:scale-[0.98]"
          >
            <CheckCircle size={16} />
            Create Booking
          </button>
        </div>
        
      </div>
    </div>
  );
}

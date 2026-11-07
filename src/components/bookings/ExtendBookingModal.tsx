// src/components/bookings/ExtendBookingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { CircleNotch as Loader2, Calendar } from "@phosphor-icons/react/ssr";
import Modal from "@/components/ui/Modal";
import type { Booking } from "@/lib/types";
import type { ExtendBookingPayload } from "@/lib/api/bookings";

interface ExtendBookingModalProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
  onExtend: (payload: ExtendBookingPayload) => Promise<void>;
  isLoading: boolean;
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export default function ExtendBookingModal({ open, onClose, booking, onExtend, isLoading }: ExtendBookingModalProps) {
  const [newEndDate, setNewEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open && booking) {
      setNewEndDate(formatDateForInput(booking.end_date));
      setReason("");
    } else {
      setNewEndDate("");
      setReason("");
    }
  }, [open, booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !newEndDate) return;

    await onExtend({
      new_end_date: new Date(newEndDate).toISOString(),
      extension_reason: reason.trim() || undefined,
    });
    
    // IMPORTANT: The parent component MUST set open={false} after this resolves.
  };

  if (!booking) return null;

  return (
    <Modal open={open} onClose={onClose} title="Extend Booking" subtitle={`For booking ${booking.booking_number || ""}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-ink-muted)]">Current End Date:</span>
            <span className="font-semibold text-[var(--color-ink)]">{new Date(booking.end_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-ink-muted)]">Daily Rate:</span>
            <span className="font-semibold text-[var(--color-ink)]">{booking.currency_code} {Number(booking.daily_rate || 0).toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className={labelClass}>New End Date <span className="text-[var(--color-danger)]">*</span></label>
          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)]" aria-hidden="true" />
            <input
              type="datetime-local"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              min={formatDateForInput(booking.end_date)}
              className={`${inputClass} pl-10`}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Extension Reason (Optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="e.g., Client requested 2 extra days"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all">
            Cancel
          </button>
          <button type="submit" disabled={isLoading || !newEndDate} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50">
            {isLoading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Calendar size={14} aria-hidden="true" />}
            {isLoading ? "Processing..." : "Confirm Extension"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

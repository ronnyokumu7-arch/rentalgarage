"use client";

import { useState } from "react";
import { X, Calendar, Loader2 } from "lucide-react";
import type { PublicInvoiceView } from "@/lib/types";

interface PublicRescheduleModalProps {
  invoice: PublicInvoiceView;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (pickupAt: string, returnAt: string) => void;
}

export default function PublicRescheduleModal({
  invoice, isOpen, isSubmitting, onClose, onSubmit,
}: PublicRescheduleModalProps) {
  const [pickupAt, setPickupAt] = useState(invoice.booking_start_date || "");
  const [returnAt, setReturnAt] = useState(invoice.booking_end_date || "");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Normalize dates to YYYY-MM-DDTHH:MM for datetime-local input
  const toLocalInput = (iso: string | null | undefined): string => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pickupAt || !returnAt) {
      setError("Both dates are required");
      return;
    }
    const pickup = new Date(pickupAt);
    const ret = new Date(returnAt);
    const now = new Date();

    if (pickup <= now) {
      setError("Pickup time must be in the future");
      return;
    }
    if (ret <= pickup) {
      setError("Return must be after pickup");
      return;
    }

    onSubmit(pickup.toISOString(), ret.toISOString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Reschedule Booking</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Propose a new schedule. The quotation will be re-priced and you'll need to confirm again.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Pickup Date & Time *</label>
            <input
              type="datetime-local"
              value={toLocalInput(pickupAt)}
              onChange={(e) => setPickupAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Return Date & Time *</label>
            <input
              type="datetime-local"
              value={toLocalInput(returnAt)}
              onChange={(e) => setReturnAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
              ) : (
                <>Update Schedule</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

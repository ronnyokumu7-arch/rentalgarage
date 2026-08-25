// src/components/financials/invoices/CreateInvoiceModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { bookingsApi } from "@/lib/api/bookings";
import { invoicesApi } from "@/lib/api/invoices";
import type { Booking, Invoice } from "@/lib/types";
import toast from "react-hot-toast";

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

// ── Design System Constants ──────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const labelClass = "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function CreateInvoiceModal({ open, onClose, onCreated }: CreateInvoiceModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const [customAmount, setCustomAmount] = useState<string>("");
  const [customRate, setCustomRate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [rateLocked, setRateLocked] = useState(false); // true = amount drives rate, false = rate drives amount

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open) {
      setFetching(true);
      Promise.all([
        bookingsApi.list(),
        invoicesApi.list()
      ])
        .then(([bData, iData]) => {
          setBookings(bData);
          setInvoices(iData);
        })
        .catch(() => toast.error("Failed to load data"))
        .finally(() => setFetching(false));
    }
  }, [open]);

  const eligibleBookings = useMemo(() => {
    const invoiceMap = new Map(invoices.map(inv => [inv.booking_id, inv]));

    return bookings.filter(b => {
      const isBookingActive = ['pending', 'confirmed', 'active'].includes(b.status);
      if (!isBookingActive) return false;

      const invoice = invoiceMap.get(b.id);
      if (!invoice) return true;

      return invoice.status !== 'paid' && invoice.status !== 'void';
    });
  }, [bookings, invoices]);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);
  const existingInvoice = invoices.find(inv => inv.booking_id === selectedBookingId);

  // ✅ ENGINE RULE (matches backend): ceil(duration / 24h), min 1 day.
  // Uses pickup_at / scheduled_return_at when available, falls back to dates.
  const billableDays = useMemo(() => {
    if (!selectedBooking) return 1;
    const startStr = selectedBooking.pickup_at || selectedBooking.start_date;
    const endStr = selectedBooking.scheduled_return_at || selectedBooking.end_date;
    if (!startStr || !endStr) return 1;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (!isFinite(hours) || hours <= 0) return 1;
    return Math.max(1, Math.ceil(hours / 24));
  }, [selectedBooking]);

  // ✅ Source of truth: booking.daily_rate ONLY.
  // ❌ Removed: total_amount / billableDays fallback.
  // The backend engine used daily_rate × days to compute total_amount, so
  // reversing that division is lossy and produces ghost numbers (e.g. 0.50).
  // If daily_rate is missing, we have no reliable source — return 0 and
  // require the user to enter a rate explicitly.
  const effectiveDailyRate = useMemo(() => {
    if (!selectedBooking) return 0;
    return Number(selectedBooking.daily_rate) || 0;
  }, [selectedBooking]);

  // ✅ Pre-fill form when booking changes
  useEffect(() => {
    if (selectedBooking) {
      const rate = effectiveDailyRate;
      const amount = existingInvoice
        ? Number(existingInvoice.amount_due)
        : (effectiveDailyRate > 0 ? effectiveDailyRate * billableDays : Number(selectedBooking.total_amount));

      setCustomRate(rate > 0 ? rate.toFixed(2) : "");
      setCustomAmount(amount > 0 ? amount.toFixed(2) : "");
      setDueDate((existingInvoice?.due_date || selectedBooking.end_date).split('T')[0]);
      setNotes(existingInvoice?.notes || `Auto-generated for Booking #${selectedBooking.booking_number}`);
      setRateLocked(false); // default: rate drives amount
    } else {
      setCustomRate("");
      setCustomAmount("");
      setDueDate("");
      setNotes("");
    }
  }, [selectedBookingId, selectedBooking, existingInvoice, effectiveDailyRate, billableDays]);

  // ✅ Rate → Amount auto-recompute (when rate is the driver)
  // Guards: only compute when rate is a valid positive number.
  const handleRateChange = (value: string) => {
    setCustomRate(value);
    if (!rateLocked && value && billableDays > 0) {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed > 0) {
        setCustomAmount((parsed * billableDays).toFixed(2));
      }
    }
  };

  // ✅ Amount → Rate auto-recompute (when amount is the driver)
  // Guards: only compute when amount is a valid positive number.
  const handleAmountChange = (value: string) => {
    setCustomAmount(value);
    if (rateLocked && value && billableDays > 0) {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed > 0) {
        setCustomRate((parsed / billableDays).toFixed(2));
      }
    }
  };

  // ✅ Unified submit — always uses generate-invoice (handles create AND update, writes rate to booking)
  const handleSubmit = async () => {
    if (!selectedBookingId || !customAmount || !dueDate) return;

    const amountNum = parseFloat(customAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Total amount must be a positive number");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        custom_amount: amountNum,
        due_date: new Date(dueDate).toISOString(),
        notes: notes,
      };

      // ✅ Only send rate if it differs from effective (prevents noise on no-op updates)
      const rateNum = customRate ? parseFloat(customRate) : NaN;
      if (!isNaN(rateNum) && rateNum > 0 && rateNum !== effectiveDailyRate) {
        payload.custom_rate = rateNum;
      }

      await bookingsApi.generateInvoice(selectedBookingId, payload);
      toast.success(
        existingInvoice
          ? "Invoice updated successfully! Regenerate the contract to reflect new rate."
          : "Invoice generated successfully!"
      );

      onCreated();
      handleClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || "Failed to process invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedBookingId(null);
    onClose();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid": return "bg-[var(--color-success-bg)] text-[var(--color-success-text)]";
      case "overdue": return "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]";
      case "void": return "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]";
      case "sent": return "bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]";
      default: return "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Customize Invoice" subtitle="Override rates, amounts, or due dates" size="md">
      <div className="space-y-6">

        {/* Booking Selection */}
        <div>
          <label className={labelClass}>
            Select Booking <span className="text-[var(--color-danger)]">*</span>
          </label>
          <select
            value={selectedBookingId || ""}
            onChange={(e) => setSelectedBookingId(Number(e.target.value))}
            className={inputClass}
            disabled={fetching}
          >
            <option value="">
              {fetching ? "Loading bookings..." : eligibleBookings.length === 0 ? "No eligible bookings" : "Select a booking..."}
            </option>
            {eligibleBookings.map(b => {
              const invoice = invoices.find(inv => inv.booking_id === b.id);
              const statusLabel = invoice ? `Invoice: ${invoice.status}` : `No Invoice Yet`;
              return (
                <option key={b.id} value={b.id}>
                  {b.booking_number || `Booking #${b.id}`} — {statusLabel}
                </option>
              );
            })}
          </select>

          {eligibleBookings.length === 0 && !fetching && (
            <div className="mt-3 p-4 rounded-xl bg-[var(--color-warning-bg)]/30 border border-[var(--color-warning-bg)] flex items-start gap-3">
              <AlertCircle size={16} className="text-[var(--color-warning-text)] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[var(--color-warning-text)] font-medium">
                No bookings are eligible. Ensure bookings are &apos;Pending/Active&apos; and invoices are not &apos;Paid&apos;.
              </p>
            </div>
          )}
        </div>

        {/* Booking & Invoice Preview */}
        {selectedBooking && (
          <div className="p-5 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Booking Details</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--color-surface)] text-[var(--color-ink-muted)]">
                  {billableDays} day{billableDays > 1 ? 's' : ''}
                </span>
                {existingInvoice && (
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(existingInvoice.status)}`}>
                    {existingInvoice.status}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Start</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {new Date(selectedBooking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">End</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {new Date(selectedBooking.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Current Total</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {selectedBooking.currency_code} {Number(selectedBooking.total_amount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customization Form */}
        {selectedBooking && (
          <div className="space-y-4">
            {/* ✅ Driver Toggle — Rate drives Amount, or Amount drives Rate */}
            <div>
              <label className={labelClass}>Edit Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRateLocked(false)}
                  className={`p-2.5 rounded-xl border-2 text-left text-xs font-semibold transition-all ${
                    !rateLocked
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                      : "border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)]"
                  }`}
                >
                  Rate → Total
                </button>
                <button
                  type="button"
                  onClick={() => setRateLocked(true)}
                  className={`p-2.5 rounded-xl border-2 text-left text-xs font-semibold transition-all ${
                    rateLocked
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                      : "border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)]"
                  }`}
                >
                  Total → Rate
                </button>
              </div>
              <p className="text-[10px] text-[var(--color-ink-muted)] mt-1.5">
                {!rateLocked
                  ? "Daily rate drives the total (rate × days). Edit the rate."
                  : "Total amount drives the rate (amount ÷ days). Edit the total."}
              </p>
            </div>

            {/* ✅ Daily Rate Field */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Daily Rate ({selectedBooking.currency_code}) <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customRate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  disabled={rateLocked}
                  className={`${inputClass} ${rateLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={labelClass}>
                  Total Amount ({selectedBooking.currency_code}) <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  disabled={!rateLocked}
                  className={`${inputClass} ${!rateLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* ✅ Live breakdown hint */}
            {customRate && customAmount && billableDays > 0 && (
              <p className="text-[11px] text-[var(--color-ink-muted)] -mt-2">
                = {customRate} × {billableDays} day{billableDays > 1 ? 's' : ''} → {customAmount}
              </p>
            )}

            <div>
              <label className={labelClass}>
                Due Date <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Notes / Add-ons</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="e.g., +KES 500 for airport pickup, 10% loyalty discount applied..."
              />
            </div>

            {/* ✅ Regenerate hint */}
            {existingInvoice && (
              <div className="p-3 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-start gap-2">
                <AlertCircle size={14} className="text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-[var(--color-ink)] font-medium">
                  After updating, <strong>regenerate the contract</strong> so it reflects the new rate and total.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedBookingId || !customAmount || !customRate || !dueDate}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            {loading ? "Processing..." : existingInvoice ? "Update Invoice" : "Generate Invoice"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

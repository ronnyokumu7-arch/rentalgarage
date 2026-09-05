// src/components/financials/invoices/CreateInvoiceModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, FileText, AlertCircle, CalendarDays, User, Car } from "lucide-react";
import Modal from "@/components/ui/Modal";
import PremiumEntitySelector from "@/components/financials/shared/PremiumEntitySelector";
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
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBookingObj, setSelectedBookingObj] = useState<Booking | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [customAmount, setCustomAmount] = useState<string>("");
  const [customRate, setCustomRate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [rateLocked, setRateLocked] = useState(false);

  const [loading, setLoading] = useState(false);

  // ✅ Fetch invoices when modal opens (for existing invoice lookup)
  useEffect(() => {
    if (open) {
      invoicesApi.list().then(setInvoices).catch(() => toast.error("Failed to load invoices"));
    }
  }, [open]);

  // ✅ Use the reusable hook to fetch eligible bookings
  const fetchEligibleBookings = async () => {
    const [bData, iData] = await Promise.all([
      bookingsApi.list(),
      invoicesApi.list()
    ]);

    const invoiceMap = new Map(iData.map((inv: any) => [inv.booking_id, inv]));

    // Filter to only eligible bookings
    return bData.filter((b: any) => {
      const isBookingActive = ['pending', 'confirmed', 'active'].includes(b.status);
      if (!isBookingActive) return false;

      const invoice = invoiceMap.get(b.id);
      if (!invoice) return true;

      return invoice.status !== 'paid' && invoice.status !== 'void';
    });
  };

  const existingInvoice = invoices.find((inv) => inv.booking_id === selectedBookingId);

  // ✅ ENGINE RULE (matches backend): ceil(duration / 24h), min 1 day.
  const billableDays = useMemo(() => {
    if (!selectedBookingObj) return 1;
    const startStr = selectedBookingObj.pickup_at || selectedBookingObj.start_date;
    const endStr = selectedBookingObj.scheduled_return_at || selectedBookingObj.end_date;
    if (!startStr || !endStr) return 1;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (!isFinite(hours) || hours <= 0) return 1;
    return Math.max(1, Math.ceil(hours / 24));
  }, [selectedBookingObj]);

  const effectiveDailyRate = useMemo(() => {
    if (!selectedBookingObj) return 0;
    return Number(selectedBookingObj.daily_rate) || 0;
  }, [selectedBookingObj]);

  // ✅ Pre-fill form when booking changes
  useEffect(() => {
    if (selectedBookingObj) {
      const rate = effectiveDailyRate;
      const amount = existingInvoice
        ? Number(existingInvoice.amount_due)
        : (effectiveDailyRate > 0 ? effectiveDailyRate * billableDays : Number(selectedBookingObj.total_amount));

      setCustomRate(rate > 0 ? rate.toFixed(2) : "");
      setCustomAmount(amount > 0 ? amount.toFixed(2) : "");
      setDueDate((existingInvoice?.due_date || selectedBookingObj.end_date).split('T')[0]);
      setNotes(existingInvoice?.notes || `Auto-generated for Booking #${selectedBookingObj.booking_number}`);
      setRateLocked(false);
    } else {
      setCustomRate("");
      setCustomAmount("");
      setDueDate("");
      setNotes("");
    }
  }, [selectedBookingObj, existingInvoice, effectiveDailyRate, billableDays]);

  const handleRateChange = (value: string) => {
    setCustomRate(value);
    if (!rateLocked && value && billableDays > 0) {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed > 0) {
        setCustomAmount((parsed * billableDays).toFixed(2));
      }
    }
  };

  const handleAmountChange = (value: string) => {
    setCustomAmount(value);
    if (rateLocked && value && billableDays > 0) {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && parsed > 0) {
        setCustomRate((parsed / billableDays).toFixed(2));
      }
    }
  };

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
      
      // ✅ AUTO-REFRESH: notify invoices list to refetch (new/updated invoice appears instantly)
      window.dispatchEvent(new CustomEvent('invoice:updated'));

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
    setSelectedBookingObj(null);
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

  // ✅ Render premium booking card for the selector (Uses enriched fields)
  const renderBookingCard = (booking: any) => {
    const invoice = invoices.find((inv) => inv.booking_id === booking.id);
    const statusLabel = invoice ? `Invoice: ${invoice.status}` : "No Invoice Yet";
    const statusStyle = invoice ? getStatusStyle(invoice.status) : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]";
    const clientName = booking.client_name || booking.client?.full_name || "Unknown Client";
    const vehiclePlate = booking.vehicle_plate || booking.vehicle?.plate_number || "N/A";

    return (
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
          <FileText size={16} className="text-[var(--color-primary)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[var(--color-ink)] truncate">
              {booking.booking_number || `Booking #${booking.id}`}
            </p>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[var(--color-ink-muted)] flex items-center gap-1">
              <User size={10} />
              {clientName}
            </span>
            <span className="text-[10px] text-[var(--color-ink-subtle)]">•</span>
            <span className="text-[10px] font-mono text-[var(--color-ink-muted)] flex items-center gap-1">
              <Car size={10} />
              {vehiclePlate}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[var(--color-ink-muted)] flex items-center gap-1">
              <CalendarDays size={10} />
              {new Date(booking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} → {new Date(booking.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="text-[10px] text-[var(--color-ink-subtle)]">•</span>
            <span className="text-[10px] font-bold text-[var(--color-primary)]">
              {booking.currency_code} {Number(booking.total_amount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} title="Customize Invoice" subtitle="Override rates, amounts, or due dates" size="md">
      <div className="space-y-6">

        {/* ✅ Premium Entity Selector */}
        <PremiumEntitySelector
          fetcher={fetchEligibleBookings}
          // ✅ FIXED: Removed nested keys (client.full_name, vehicle.plate_number)
          searchKeys={["booking_number", "client_name", "id"]}
          placeholder="Select a booking..."
          emptyMessage="No eligible bookings. Ensure bookings are Pending/Active and invoices are not Paid."
          renderEntityCard={renderBookingCard}
          selectedId={selectedBookingId}
          onSelect={(id) => {
            setSelectedBookingId(id);
            setSelectedBookingObj((prev) => prev);
          }}
          onSelectEntity={(booking) => {
            setSelectedBookingObj(booking as Booking);
          }}
          label="Select Booking"
          required
        />

        {/* Booking & Invoice Preview */}
        {selectedBookingObj && (
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
                  {new Date(selectedBookingObj.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">End</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {new Date(selectedBookingObj.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Current Total</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {selectedBookingObj.currency_code} {Number(selectedBookingObj.total_amount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customization Form */}
        {selectedBookingObj && (
          <div className="space-y-4">
            {/* ✅ Driver Toggle */}
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

            {/* ✅ Daily Rate & Amount Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Daily Rate ({selectedBookingObj.currency_code}) <span className="text-[var(--color-danger)]">*</span>
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
                  Total Amount ({selectedBookingObj.currency_code}) <span className="text-[var(--color-danger)]">*</span>
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

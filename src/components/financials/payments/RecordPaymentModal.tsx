// src/components/financials/invoices/RecordPaymentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { CircleNotch as Loader2, Money as Banknote, WarningCircle as AlertCircle } from "@phosphor-icons/react/ssr";
import Modal from "@/components/ui/Modal";
import { invoicesApi } from "@/lib/api/invoices";
import type { Invoice, PaymentMethod } from "@/lib/types";
import toast from "react-hot-toast";

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPaymentRecorded: () => void;
  invoice: Invoice | null;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

export default function RecordPaymentModal({
  open,
  onClose,
  onPaymentRecorded,
  invoice,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setReference("");
    setMethod("mpesa");
  }, [open]);

  const remainingBalance = invoice
    ? Number(invoice.amount_due) - Number(invoice.amount_paid || 0)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return toast.error("No invoice selected");

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0)
      return toast.error("Enter a valid amount");
    if (paymentAmount > remainingBalance)
      return toast.error("Amount exceeds remaining balance");

    setLoading(true);
    try {
      await invoicesApi.recordPayment(invoice.id, {
        amount: paymentAmount,
        currency_code: invoice.currency_code,
        method,
        reference,
      });

      toast.success("Payment recorded successfully!");
      onPaymentRecorded();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to record payment");
    } finally {
      setLoading(false);
    }
    return;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Offline Payment"
      subtitle={`For invoice ${invoice?.invoice_number || ""}`}
      size="md"
    >
      {!invoice ? (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle size={32} className="text-[var(--color-warning-text)] mb-3" aria-hidden="true" />
          <p className="text-sm text-[var(--color-ink-muted)]">
            No invoice selected. Please select an invoice first.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Balance Info Card */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                Total Due
              </span>
              <span className="text-sm font-bold text-[var(--color-ink)]">
                {invoice.currency_code}{" "}
                {Number(invoice.amount_due).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                Already Paid
              </span>
              <span className="text-sm font-medium text-[var(--color-ink-muted)]">
                {invoice.currency_code}{" "}
                {Number(invoice.amount_paid || 0).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-[var(--color-surface-border)] my-3" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">
                Remaining Balance
              </span>
              <span className="text-lg font-extrabold text-[var(--color-primary)]">
                {invoice.currency_code} {remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className={labelClass}>
              Payment Amount <span className="text-[var(--color-danger)]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)] text-sm font-semibold">
                {invoice.currency_code}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={remainingBalance}
                step="0.01"
                min="0.01"
                className={`${inputClass} pl-16`}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Method <span className="text-[var(--color-danger)]">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className={inputClass}
              >
                <option value="mpesa">M-Pesa</option>
                <option value="manual">Bank / Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Reference <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className={inputClass}
                placeholder={
                  method === "mpesa" ? "e.g., QFG34HJ8L" : "Receipt #"
                }
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Banknote size={14} aria-hidden="true" />
              )}
              {loading ? "Processing..." : "Record Payment"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

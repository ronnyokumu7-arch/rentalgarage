// src/components/financials/invoices/RecordPaymentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, Banknote, ReceiptText, User, Phone } from "lucide-react";
import Modal from "@/components/ui/Modal";
import PremiumEntitySelector from "@/components/financials/shared/PremiumEntitySelector";
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
  invoice: preselectedInvoice,
}: RecordPaymentModalProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(preselectedInvoice);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedInvoice(preselectedInvoice);
      setAmount("");
      setReference("");
      setMethod("mpesa");
    }
  }, [open, preselectedInvoice]);

  const fetchEligibleInvoices = async () => {
    const data = await invoicesApi.list();
    return data.filter(
      (inv: any) =>
        inv.status === "pending" ||
        inv.status === "sent" ||
        inv.status === "overdue" ||
        inv.status === "partially_paid"
    );
  };

  const remainingBalance = selectedInvoice
    ? Number(selectedInvoice.amount_due) - Number(selectedInvoice.amount_paid || 0)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return toast.error("No invoice selected");

    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0)
      return toast.error("Enter a valid amount");
    if (paymentAmount > remainingBalance)
      return toast.error("Amount exceeds remaining balance");

    setLoading(true);
    try {
      await invoicesApi.recordPayment(selectedInvoice.id, {
        amount: paymentAmount,
        currency_code: selectedInvoice.currency_code,
        method,
        reference,
      });

      toast.success("Payment recorded successfully!");
      
      // ✅ AUTO-REFRESH: notify payments list + invoices list to refetch
      window.dispatchEvent(new CustomEvent('payment:created'));
      window.dispatchEvent(new CustomEvent('invoice:updated'));
      
      onPaymentRecorded();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to record payment");
    } finally {
      setLoading(false);
    }
    return;
  };

  const renderInvoiceCard = (inv: any) => {
    const balance = Number(inv.amount_due) - Number(inv.amount_paid || 0);
    const statusStyle = 
      inv.status === "paid" ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]" :
      inv.status === "overdue" ? "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]" :
      inv.status === "sent" ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]" :
      "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
    const clientName = inv.client_name || inv.client?.full_name || "Unknown Client";
    const clientPhone = inv.client_phone || inv.client?.phone || null;

    return (
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
          <ReceiptText size={16} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[var(--color-ink)] truncate">
              {inv.invoice_number || `Invoice #${inv.id}`}
            </p>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusStyle}`}>
              {inv.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[var(--color-ink-muted)] flex items-center gap-1">
              <User size={10} />
              {clientName}
            </span>
            {clientPhone && (
              <>
                <span className="text-[10px] text-[var(--color-ink-subtle)]">•</span>
                <span className="text-[10px] text-[var(--color-ink-muted)] flex items-center gap-1">
                  <Phone size={10} />
                  {clientPhone}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-[var(--color-ink-muted)]">
              {inv.booking_number ? `BK: ${inv.booking_number}` : ""}
            </span>
            <span className="text-[10px] text-[var(--color-ink-subtle)]">•</span>
            <span className="text-[10px] font-bold text-[var(--color-primary)]">
              Balance: {inv.currency_code} {balance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Offline Payment"
      subtitle={selectedInvoice ? `For invoice ${selectedInvoice.invoice_number}` : "Select an invoice to record payment"}
      size="md"
    >
      <div className="space-y-6">
        <PremiumEntitySelector
          fetcher={fetchEligibleInvoices}
          searchKeys={["invoice_number", "client_name", "booking_number", "id"]}
          placeholder="Select an invoice..."
          emptyMessage="No eligible invoices. Only unpaid/partially paid/overdue invoices can be paid."
          renderEntityCard={renderInvoiceCard}
          selectedId={selectedInvoice?.id || null}
          onSelect={() => {
            setSelectedInvoice((prev) => prev);
          }}
          onSelectEntity={(inv) => {
            setSelectedInvoice(inv as Invoice);
          }}
          label="Select Invoice"
          required
        />

        {selectedInvoice && (
          <div className="p-5 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Total Due</span>
              <span className="text-sm font-bold text-[var(--color-ink)]">
                {selectedInvoice.currency_code} {Number(selectedInvoice.amount_due).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Already Paid</span>
              <span className="text-sm font-medium text-[var(--color-ink-muted)]">
                {selectedInvoice.currency_code} {Number(selectedInvoice.amount_paid || 0).toLocaleString()}
              </span>
            </div>
            <div className="border-t border-[var(--color-surface-border)] my-3" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">Remaining Balance</span>
              <span className="text-lg font-extrabold text-[var(--color-primary)]">
                {selectedInvoice.currency_code} {remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {selectedInvoice && (
          <>
            <div>
              <label className={labelClass}>Payment Amount <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-[var(--color-ink-subtle)] text-sm font-semibold">
                  {selectedInvoice.currency_code}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Method <span className="text-[var(--color-danger)]">*</span></label>
                <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={inputClass}>
                  <option value="mpesa">M-Pesa</option>
                  <option value="manual">Bank / Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Reference <span className="text-[var(--color-danger)]">*</span></label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className={inputClass}
                  placeholder={method === "mpesa" ? "e.g., QFG34HJ8L" : "Receipt #"}
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading || !selectedInvoice || !amount || !reference} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
            {loading ? "Processing..." : "Record Payment"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

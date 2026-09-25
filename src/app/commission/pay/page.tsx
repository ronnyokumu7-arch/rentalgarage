// src/app/commission/pay/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Wallet, Landmark, Loader2, CheckCircle2, AlertCircle, Clock,
  Smartphone, Copy, History, ArrowLeft, BadgeCheck, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { useCommissionPayment } from "@/hooks/useCommissionPayment";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

export default function CommissionPayPage() {
  // ✅ NEW: accept `error` and `refresh` from the hardened hook
  const { info, payments, loading, submitting, error, refresh, submit } = useCommissionPayment();

  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  // Prefill amount with what's owed once data lands
  useEffect(() => {
    if (info && !amount) {
      const owed = parseFloat(info.outstanding_balance);
      if (owed > 0) setAmount(owed.toFixed(2));
    }
  }, [info, amount]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (reference.trim().length < 4) {
      toast.error("Enter the M-Pesa confirmation code");
      return;
    }
    try {
      await submit({ amount: amt, reference: reference.trim(), notes: notes.trim() || undefined });
      toast.success("Payment submitted! We'll verify it shortly.");
      setReference("");
      setNotes("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to submit payment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ✅ CRITICAL FIX: "Settled" is only ever rendered from a SUCCESSFUL fetch.
  // A failed fetch (info === null) now routes to the error state instead of
  // the silent "You're all settled!" lie.
  const infoLoaded = info !== null;
  const owed = info ? parseFloat(info.outstanding_balance) : 0;
  const hasPending = !!info?.pending_payment;
  // ✅ Paybill is usable only when BOTH the business number and account number exist
  const hasPaybill = !!(info?.platform_paybill && info?.platform_account_number);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg border border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Wallet size={20} />
            </div>
            Pay Platform Commission
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Settle your pay-as-you-go commission via M-Pesa
          </p>
        </div>
        {/* ✅ Manual refresh button — always available once initial load completes */}
        {infoLoaded && (
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 rounded-lg border border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        )}
      </div>

      {/* ✅ NEW: ERROR STATE — never renders "settled" from a failed fetch */}
      {error && !infoLoaded && (
        <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-center">
          <AlertCircle size={32} className="text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[var(--color-ink)] mb-1">Couldn't load your account</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4 max-w-sm mx-auto">
            {error}
          </p>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary)]/90 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Retrying..." : "Try Again"}
          </button>
        </div>
      )}

      {/* ✅ All settled state — ONLY when we successfully fetched and owed is zero */}
      {infoLoaded && !error && owed <= 0 && !hasPending && (
        <div className="p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-center">
          <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[var(--color-ink)] mb-1">You're all settled!</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            No outstanding commission. New trips will appear here daily.
          </p>
        </div>
      )}

      {/* ✅ Pending verification banner (form hidden while pending) */}
      {infoLoaded && hasPending && (
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
          <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-500">Payment awaiting verification</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              KES {parseFloat(info!.pending_payment!.amount).toLocaleString()} • Code{" "}
              <span className="font-mono font-bold">{info!.pending_payment!.reference}</span> •
              submitted {new Date(info!.pending_payment!.created_at).toLocaleString()}
            </p>
            <p className="text-xs text-[var(--color-ink-subtle)] mt-1">
              We're confirming it against our statement. You'll be unlocked once verified.
            </p>
          </div>
        </div>
      )}

      {/* ✅ Owed + Instructions + Form */}
      {infoLoaded && !error && owed > 0 && (
        <>
          {/* Outstanding balance hero */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
              Outstanding Commission
            </p>
            <p className="text-3xl font-extrabold text-[var(--color-ink)] tabular-nums mt-1">
              KES {owed.toLocaleString()}
            </p>
            <p className="text-xs text-[var(--color-ink-subtle)] mt-1">
              {info?.outstanding_count} unpaid trip{(info?.outstanding_count ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Payment instructions — the real M-Pesa Paybill flow */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
            <h3 className="text-sm font-bold text-[var(--color-ink)] mb-3 flex items-center gap-2">
              <Smartphone size={16} className="text-emerald-500" /> How to Pay via M-Pesa
            </h3>

            {hasPaybill ? (
              <div className="space-y-2.5 text-xs text-[var(--color-ink-muted)]">
                <p>1. Go to M-Pesa → <span className="font-bold text-[var(--color-ink)]">Lipa na M-Pesa</span> → <span className="font-bold text-[var(--color-ink)]">PayBill</span></p>

                <p className="flex items-center gap-2">
                  2. Business Number:
                  <span className="font-mono font-bold text-[var(--color-ink)]">{info!.platform_paybill}</span>
                  <button type="button" onClick={() => copy(info!.platform_paybill!, "Paybill number")} className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-subtle)]">
                    <Copy size={12} />
                  </button>
                </p>

                <p className="flex items-center gap-2">
                  3. Account Number:
                  <span className="font-mono font-bold text-[var(--color-ink)]">{info!.platform_account_number}</span>
                  <button type="button" onClick={() => copy(info!.platform_account_number!, "Account number")} className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-subtle)]">
                    <Copy size={12} />
                  </button>
                </p>

                {info!.platform_account_name && (
                  <p className="flex items-start gap-1.5 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <BadgeCheck size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      4. Confirm the account name shows as{" "}
                      <span className="font-bold text-emerald-500">{info!.platform_account_name}</span> before
                      sending — this confirms you're paying the right recipient.
                    </span>
                  </p>
                )}

                <p>5. Enter the amount, your PIN, and send.</p>
                <p>6. Copy the <span className="font-bold text-[var(--color-ink)]">M-Pesa confirmation code</span> and paste it in the form below.</p>

                {(info!.platform_phone || info!.platform_email) && (
                  <p className="text-[10px] text-[var(--color-ink-subtle)] pt-1 flex items-center gap-1">
                    <Landmark size={11} />
                    Questions? {info!.platform_phone} {info!.platform_email ? `• ${info!.platform_email}` : ""}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--color-ink-muted)]">
                  Online payment details are being configured. Please contact support
                  {info?.platform_phone ? ` at ${info.platform_phone}` : ""}
                  {info?.platform_email ? ` or ${info.platform_email}` : ""} to settle your balance.
                </p>
              </div>
            )}
          </div>

          {/* Submission form (hidden while a payment is pending) */}
          {!hasPending && hasPaybill && (
            <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] space-y-4">
              <h3 className="text-sm font-bold text-[var(--color-ink)]">I've Paid — Record It</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                    Amount Paid (KES) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                    M-Pesa Confirmation Code *
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    placeholder="e.g., QFG34HJ8L"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything we should know?"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary)]/90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--color-primary)]/20"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {submitting ? "Submitting..." : "Submit Payment for Verification"}
              </button>
            </form>
          )}
        </>
      )}

      {/* ✅ Payment history */}
      {payments.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
          <h3 className="text-sm font-bold text-[var(--color-ink)] mb-3 flex items-center gap-2">
            <History size={16} className="text-[var(--color-ink-muted)]" /> Payment History
          </h3>
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                <div>
                  <p className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                    KES {parseFloat(p.amount).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[var(--color-ink-subtle)] font-mono">
                    {p.reference} • {new Date(p.created_at).toLocaleDateString()}
                  </p>
                  {p.status === "rejected" && p.notes && (
                    <p className="text-[10px] text-rose-500 mt-0.5">Reason: {p.notes}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold capitalize border ${STATUS_STYLES[p.status]}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

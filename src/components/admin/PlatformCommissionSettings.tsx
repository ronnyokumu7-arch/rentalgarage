// src/components/admin/PlatformCommissionSettings.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Wallet, Bank as Landmark, Phone, CircleNotch as Loader2, FloppyDisk as Save, Info } from "@phosphor-icons/react/ssr";
import toast from "react-hot-toast";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30";
const labelCls = "block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5";
const hintCls = "text-[10px] text-[var(--color-ink-subtle)] mt-1";

export default function PlatformCommissionSettings() {
  const { settings, loading, saving, save } = usePlatformSettings();

  const [commissionAmount, setCommissionAmount] = useState("");
  const [graceDays, setGraceDays] = useState("3");
  const [paybill, setPaybill] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // ✅ Hydrate the form once settings land
  useEffect(() => {
    if (settings) {
      setCommissionAmount(parseFloat(settings.commission_amount).toString());
      setGraceDays(settings.grace_period_days.toString());
      setPaybill(settings.platform_paybill || "");
      setAccountNumber(settings.platform_account_number || "");
      setAccountName(settings.platform_account_name || "");
      setPhone(settings.platform_phone || "");
      setEmail(settings.platform_email || "");
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(commissionAmount);
    const grace = parseInt(graceDays, 10);

    if (!amt || amt <= 0) {
      toast.error("Commission amount must be greater than 0");
      return;
    }
    if (isNaN(grace) || grace < 0 || grace > 30) {
      toast.error("Grace period must be between 0 and 30 days");
      return;
    }

    try {
      await save({
        commission_amount: amt,
        grace_period_days: grace,
        platform_paybill: paybill.trim() || null,
        platform_account_number: accountNumber.trim() || null,
        platform_account_name: accountName.trim() || null,
        platform_phone: phone.trim() || null,
        platform_email: email.trim() || null,
      });
      toast.success("Platform settings saved — live for all tenants.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save settings.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} aria-hidden="true" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* ── PAYG ENGINE ─────────────────────────────────────── */}
      <section className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
          <Wallet size={16} className="text-emerald-500" aria-hidden="true" /> PAYG Commission Engine
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Commission per trip (KES) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={commissionAmount}
              onChange={(e) => setCommissionAmount(e.target.value)}
              className={inputCls}
              required
            />
            <p className={hintCls}>Charged on every activated trip. Applies to NEW trips only.</p>
          </div>
          <div>
            <label className={labelCls}>Grace period (days) *</label>
            <input
              type="number"
              min="0"
              max="30"
              value={graceDays}
              onChange={(e) => setGraceDays(e.target.value)}
              className={inputCls}
              required
            />
            <p className={hintCls}>Days before unpaid commission soft-locks a tenant. 0 = immediate.</p>
          </div>
        </div>
      </section>

      {/* ── M-PESA PAYBILL TRIPLE ───────────────────────────── */}
      <section className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
          <Landmark size={16} className="text-blue-500" aria-hidden="true" /> M-Pesa Paybill — where tenants pay you
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Paybill (Business) Number</label>
            <input
              type="text"
              value={paybill}
              onChange={(e) => setPaybill(e.target.value)}
              placeholder="e.g., 400200"
              className={`${inputCls} font-mono`}
            />
          </div>
          <div>
            <label className={labelCls}>Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Your bank account behind the Paybill"
              className={`${inputCls} font-mono`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Account Name (recipient confirmation)</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Name the account was opened with"
              className={inputCls}
            />
            <p className={hintCls}>
              Tenants see this name on the pay page so they can confirm the right recipient before sending money.
            </p>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-2">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[11px] text-[var(--color-ink-muted)]">
            Changes go live instantly on every Tenant&apos;s <span className="font-bold">/commission/pay</span> page.
            You reconcile payments by matching the M-Pesa confirmation codes in the Commission tab.
          </p>
        </div>
      </section>

      {/* ── RECORD KEEPING ──────────────────────────────────── */}
      <section className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
        <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2 mb-4">
          <Phone size={16} className="text-amber-500" aria-hidden="true" /> Record Keeping & Support Contacts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Platform Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2547..."
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Platform Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="payments@..."
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] text-[var(--color-ink-subtle)]">
          {settings ? `Last updated ${new Date(settings.updated_at).toLocaleString()}` : ""}
        </p>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--color-primary)]/20"
        >
          {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

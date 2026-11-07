"use client";

import React, { useState } from "react";
import { 
  ShareNetwork as Share2, Copy, Check, CurrencyDollar as DollarSign,
  Receipt, ArrowUpRight, ShieldCheck, CircleNotch as Loader2,
  Sparkle as Sparkles
} from "@phosphor-icons/react/ssr";
import toast from "react-hot-toast";
import { invoicesApi } from "@/lib/api/invoices";
import type { Booking, Invoice } from "@/lib/types";

interface FinancialsWidgetProps {
  booking: Booking;
  initialInvoice?: Invoice | null;
  onInvoiceGenerated?: (invoice: Invoice) => void;
  onRefresh?: () => void;
}

export function FinancialsWidget({
  booking,
  initialInvoice,
  onInvoiceGenerated,
  onRefresh,
}: FinancialsWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Safely extract domain origin for public share link construction
  const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
      return process.env.NEXT_PUBLIC_FRONTEND_URL;
    }
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  };

  const [shareUrl, setShareUrl] = useState<string | null>(
    initialInvoice?.share_token
      ? `${getBaseUrl()}/invoice/${initialInvoice.share_token}`
      : null
  );

  const currency = booking.currency_code || "KES";
  const totalAmount = Number(booking.total_amount || 0);

  // Helper to extract clean string error messages from FastAPI / Axios payloads
  const formatErrorMessage = (error: any): string => {
    if (!error) return "An unexpected error occurred.";

    const responseData = error?.response?.data;

    // FastAPI Pydantic Validation Error Array: [{ type, loc, msg, input }]
    if (responseData?.detail && Array.isArray(responseData.detail)) {
      return responseData.detail
        .map((err: any) => `${err.loc?.[err.loc.length - 1] || "Field"}: ${err.msg}`)
        .join(" | ");
    }

    // Standard string detail from FastAPI HTTPException
    if (typeof responseData?.detail === "string") {
      return responseData.detail;
    }

    // Standard message field
    if (typeof responseData?.message === "string") {
      return responseData.message;
    }

    // Direct JS Error object message
    if (typeof error?.message === "string") {
      return error.message;
    }

    return "Failed to generate official invoice.";
  };

  const handleGenerateOfficialInvoice = async () => {
    try {
      setLoading(true);

      // 1. Create or retrieve existing invoice for this booking
      const invoice = await invoicesApi.create({
        booking_id: booking.id,
        amount_due: totalAmount,
        currency_code: currency,
        due_date: booking.end_date || new Date().toISOString(),
      });

      if (!invoice) {
        throw new Error("No response returned from invoice service.");
      }

      // Handle response wrapping if nested under `.data`
      const rawInvoice = (invoice as any).data || invoice;
      const invoiceId = rawInvoice.id;

      if (!invoiceId) {
        throw new Error("Invalid invoice instance. Missing primary identifier.");
      }

      // 2. Generate share link token via backend API
      const shareData = await invoicesApi.generateShareLink(invoiceId);
      const rawShare = (shareData as any).data || shareData;

      // Construct robust URL
      const baseUrl = getBaseUrl();
      const rawToken = rawShare?.share_token || rawShare?.token || rawInvoice?.share_token;
      const finalShareUrl = rawShare?.share_token || (rawToken ? `${baseUrl}/invoice/${rawToken}` : null);

      if (!finalShareUrl) {
        throw new Error("Could not construct share URL from response payload.");
      }

      setShareUrl(finalShareUrl);

      // 3. Auto-copy share link to clipboard
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(finalShareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        toast.success("Official invoice link created & copied to clipboard!");
      }

      if (onInvoiceGenerated) onInvoiceGenerated(rawInvoice);
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error("Invoice Generation Error:", error);
      const cleanMessage = formatErrorMessage(error);
      toast.error(cleanMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-6 relative overflow-hidden group">
      {/* Background Decorative Accent Pill */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-[var(--color-surface-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 text-[var(--color-primary)] border border-[var(--color-primary)]/10 shadow-sm">
            <Receipt size={18} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-muted)]">
                Billing & Settlement
              </span>
              <Sparkles size={11} className="text-[var(--color-primary)] animate-pulse" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black text-[var(--color-ink)] leading-none mt-0.5 tracking-tight">
              Financial Overview
            </h3>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--color-surface-hover)] text-[var(--color-ink)] border border-[var(--color-surface-border)] shadow-sm">
          {currency} Ledger
        </span>
      </div>

      {/* Main Total Display Glassmorphic Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--color-surface-hover)]/90 via-[var(--color-surface-hover)]/40 to-transparent border border-[var(--color-surface-border)] space-y-3 relative overflow-hidden shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Total Statement Balance
          </span>
          <div className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <DollarSign size={15} aria-hidden="true" />
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight font-mono">
            {currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[var(--color-ink-muted)] font-medium mt-1">
            Includes all rate items, taxes, and service charges.
          </p>
        </div>
      </div>

      {/* Invoice Link Action Section */}
      <div className="space-y-3">
        {shareUrl ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--color-ink)]">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check size={14} className="stroke-[3]" aria-hidden="true" /> Official Share Link Active
              </span>
              <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">Valid for 30 days</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] shadow-sm">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent text-xs font-mono text-[var(--color-ink-muted)] flex-1 px-2 border-none focus:outline-none truncate"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-[var(--color-ink)] hover:text-[var(--color-primary)] transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-xs"
              >
                {copied ? <Check size={13} className="text-emerald-500" aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-all shrink-0 shadow-xs"
                title="Open Share Link"
              >
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGenerateOfficialInvoice}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[var(--color-primary)] to-indigo-600 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md transition-all disabled:opacity-50 group tracking-wide uppercase"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Generating Link...
              </>
            ) : (
              <>
                <Share2 size={15} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                Generate Official Invoice Link
              </>
            )}
          </button>
        )}
      </div>

      {/* Security & Audit Footer Note */}
      <div className="pt-3 border-t border-[var(--color-surface-border)] flex items-center justify-between text-[11px] text-[var(--color-ink-muted)]">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck size={13} className="text-emerald-500" aria-hidden="true" />
          Encrypted Billing Protocol
        </span>
        <span className="font-mono text-[10px] font-bold tracking-wider opacity-80">VERIFIED</span>
      </div>
    </div>
  );
}

export default FinancialsWidget;

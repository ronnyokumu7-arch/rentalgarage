"use client";

import { FileText, CheckCircle2, Download, XCircle, Send, Loader2 } from "lucide-react";
import type { PublicInvoiceView } from "@/lib/types";

interface PublicInvoiceStatusBannerProps {
  invoice: PublicInvoiceView;
  onDownloadPdf: () => void;
  isDownloadingPdf?: boolean;
}

export default function PublicInvoiceStatusBanner({ invoice, onDownloadPdf, isDownloadingPdf = false }: PublicInvoiceStatusBannerProps) {
  const isQuotation = invoice.doc_type === "quotation";
  const isPaid = invoice.status === "paid";
  const isVoid = invoice.status === "void";

  // ✅ MORPH: banner text adapts to doc_type (quotation vs invoice)
  const state = (() => {
    if (isVoid) {
      return {
        bg: "bg-red-50",
        icon: <XCircle className="h-5 w-5 text-red-600 shrink-0" />,
        title: isQuotation ? "Quotation Cancelled" : "Invoice Voided",
        subtitle: "This document has been cancelled. Please contact the agency for a new one.",
        titleColor: "text-red-900",
        subtitleColor: "text-red-700",
      };
    }
    if (isQuotation) {
      return {
        bg: "bg-indigo-50",
        icon: <Send className="h-5 w-5 text-indigo-600 shrink-0" />,
        title: "Quotation Ready",
        subtitle: "Review the details below and accept to confirm your booking.",
        titleColor: "text-indigo-900",
        subtitleColor: "text-indigo-700",
      };
    }
    if (isPaid) {
      return {
        bg: "bg-emerald-50",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
        title: "Invoice Fully Paid",
        subtitle: "Thank you for your payment.",
        titleColor: "text-emerald-900",
        subtitleColor: "text-emerald-700",
      };
    }
    return {
      bg: "bg-blue-50",
      icon: <FileText className="h-5 w-5 text-blue-600 shrink-0" />,
      title: "Pending Payment",
      subtitle: "Please review the details below and arrange payment.",
      titleColor: "text-blue-900",
      subtitleColor: "text-blue-700",
    };
  })();

  return (
    <div className={`p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 ${state.bg}`}>
      <div className="flex items-center gap-3">
        {state.icon}
        <div>
          <p className={`text-sm font-bold ${state.titleColor}`}>
            {state.title}
          </p>
          <p className={`text-xs ${state.subtitleColor}`}>
            {state.subtitle}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDownloadPdf}
        disabled={isDownloadingPdf}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 active:shadow-inner"
      >
        {isDownloadingPdf ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Generating PDF...
          </>
        ) : (
          <>
            <Download size={14} /> Download PDF
          </>
        )}
      </button>
    </div>
  );
}

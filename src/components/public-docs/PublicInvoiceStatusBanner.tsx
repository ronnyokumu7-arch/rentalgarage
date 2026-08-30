// src/components/public-docs/PublicInvoiceStatusBanner.tsx
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
        bg: 'rgba(185, 28, 28, 0.05)',
        icon: <XCircle className="h-5 w-5 shrink-0" style={{ color: '#B91C1C' }} />,
        title: isQuotation ? "Quotation Cancelled" : "Invoice Voided",
        subtitle: "This document has been cancelled. Please contact the agency for a new one.",
        titleColor: '#B91C1C',
        subtitleColor: '#B91C1C',
      };
    }
    if (isQuotation) {
      return {
        bg: 'rgba(109, 40, 217, 0.05)',
        icon: <Send className="h-5 w-5 shrink-0" style={{ color: '#6D28D9' }} />,
        title: "Quotation Ready",
        subtitle: "Review the details below and accept to confirm your booking.",
        titleColor: '#6D28D9',
        subtitleColor: '#6D28D9',
      };
    }
    if (isPaid) {
      return {
        bg: 'rgba(4, 120, 87, 0.05)',
        icon: <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: '#047857' }} />,
        title: "Invoice Fully Paid",
        subtitle: "Thank you for your payment.",
        titleColor: '#047857',
        subtitleColor: '#047857',
      };
    }
    return {
      bg: 'rgba(29, 78, 216, 0.05)',
      icon: <FileText className="h-5 w-5 shrink-0" style={{ color: '#1D4ED8' }} />,
      title: "Pending Payment",
      subtitle: "Please review the details below and arrange payment.",
      titleColor: '#1D4ED8',
      subtitleColor: '#1D4ED8',
    };
  })();

  const downloadButtonStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    background: '#FFFFFF',
    border: '1px solid rgba(28, 25, 23, 0.10)',
    color: '#44403C',
    fontSize: '0.75rem',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(28, 25, 23, 0.08)',
    cursor: isDownloadingPdf ? 'not-allowed' : 'pointer',
    opacity: isDownloadingPdf ? 0.6 : 1,
    transition: 'all 0.2s ease',
    flexShrink: 0,
  };

  return (
    <div 
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
      style={{
        padding: '1rem',
        borderBottom: '1px solid rgba(28, 25, 23, 0.06)',
        background: state.bg,
      }}
    >
      <div className="flex items-center gap-3">
        {state.icon}
        <div>
          <p 
            className="text-sm font-bold"
            style={{ color: state.titleColor }}
          >
            {state.title}
          </p>
          <p 
            className="text-xs"
            style={{ color: state.subtitleColor }}
          >
            {state.subtitle}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDownloadPdf}
        disabled={isDownloadingPdf}
        style={downloadButtonStyle}
        onMouseEnter={(e) => {
          if (!isDownloadingPdf) {
            e.currentTarget.style.background = '#F5F3F0';
            e.currentTarget.style.borderColor = 'rgba(28, 25, 23, 0.18)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#FFFFFF';
          e.currentTarget.style.borderColor = 'rgba(28, 25, 23, 0.10)';
        }}
        onMouseDown={(e) => {
          if (!isDownloadingPdf) {
            e.currentTarget.style.transform = 'scale(0.95)';
            e.currentTarget.style.boxShadow = '0 0 0 0 rgba(28, 25, 23, 0.08)';
          }
        }}
        onMouseUp={(e) => {
          if (!isDownloadingPdf) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(28, 25, 23, 0.08)';
          }
        }}
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

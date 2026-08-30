// src/app/(public)/invoice/[token]/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { invoicesApi } from "@/lib/api/invoices";
import { Loader2, AlertCircle, FileText, CheckCircle2, Download, XCircle, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { usePublicInvoice } from "@/hooks/public-docs/usePublicInvoice";
import "@/app/public.css";

import PublicInvoiceHeader from "@/components/public-docs/PublicInvoiceHeader";
import PublicInvoiceDetails from "@/components/public-docs/PublicInvoiceDetails";
import PublicInvoicePaymentChannels from "@/components/public-docs/PublicInvoicePaymentChannels";
import PublicInvoicePaymentForm from "@/components/public-docs/PublicInvoicePaymentForm";
import PublicQuotationActions from "@/components/public-docs/PublicQuotationActions";
import PublicRescheduleModal from "@/components/public-docs/PublicRescheduleModal";

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  const {
    invoice, loading, error, isPaying, handleRecordPayment,
    isAccepting, isCancelling, isRescheduling,
    handleAccept, handleCancel, handleReschedule,
  } = usePublicInvoice(token);

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!invoice || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const res = await invoicesApi.downloadPdfByToken(token);
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="public-root min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAF9F7' }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#6D28D9' }} />
          <p className="font-medium text-sm sm:text-base" style={{ color: '#57534E' }}>Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="public-root min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: '#FAF9F7' }}>
        <div 
          className="max-w-md w-full rounded-xl p-6 sm:p-8 text-center"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(28, 25, 23, 0.08)',
            border: '1px solid rgba(28, 25, 23, 0.10)',
          }}
        >
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(185, 28, 28, 0.10)' }}
          >
            <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: '#B91C1C' }} />
          </div>
          <h1 className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#1C1917' }}>Unavailable</h1>
          <p className="text-xs sm:text-sm mb-6" style={{ color: '#57534E' }}>{error || "This link is invalid or has expired."}</p>
          <p className="text-xs" style={{ color: '#78716C' }}>Please contact the rental agency for a new link.</p>
        </div>
      </div>
    );
  }

  const isQuotation = invoice.doc_type === "quotation";
  const isPaid = invoice.status === "paid";
  const isVoid = invoice.status === "void";

  // Banner state
  const bannerState = (() => {
    if (isVoid) {
      return {
        bg: 'rgba(185, 28, 28, 0.05)',
        iconBg: 'rgba(185, 28, 28, 0.10)',
        icon: <XCircle className="h-5 w-5 shrink-0" style={{ color: '#B91C1C' }} />,
        title: isQuotation ? "Quotation Cancelled" : "Invoice Voided",
        subtitle: "This document has been cancelled. Please contact the agency for a new one.",
        textColor: '#B91C1C',
      };
    }
    if (isQuotation) {
      return {
        bg: 'rgba(109, 40, 217, 0.05)',
        iconBg: 'rgba(109, 40, 217, 0.10)',
        icon: <Send className="h-5 w-5 shrink-0" style={{ color: '#6D28D9' }} />,
        title: "Quotation Ready",
        subtitle: "Review the details below and accept to confirm your booking.",
        textColor: '#6D28D9',
      };
    }
    if (isPaid) {
      return {
        bg: 'rgba(4, 120, 87, 0.05)',
        iconBg: 'rgba(4, 120, 87, 0.10)',
        icon: <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: '#047857' }} />,
        title: "Invoice Fully Paid",
        subtitle: "Thank you for your payment.",
        textColor: '#047857',
      };
    }
    return {
      bg: 'rgba(29, 78, 216, 0.05)',
      iconBg: 'rgba(29, 78, 216, 0.10)',
      icon: <FileText className="h-5 w-5 shrink-0" style={{ color: '#1D4ED8' }} />,
      title: "Pending Payment",
      subtitle: "Please review the details below and arrange payment.",
      textColor: '#1D4ED8',
    };
  })();

  return (
    <div 
      className="public-root min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8" 
      style={{ backgroundColor: '#FAF9F7' }}
    >
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <PublicInvoiceHeader invoice={invoice} />

        <div 
          className="rounded-xl sm:rounded-2xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 12px 24px -4px rgba(28, 25, 23, 0.10)',
            border: '1px solid rgba(28, 25, 23, 0.10)',
          }}
        >
          {/* Status Banner - mobile stacks, desktop side-by-side */}
          <div 
            className="p-4 sm:p-5"
            style={{
              borderBottom: '1px solid rgba(28, 25, 23, 0.08)',
              background: bannerState.bg,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Left: Status icon + text */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: bannerState.iconBg }}
                >
                  {bannerState.icon}
                </div>
                <div className="min-w-0">
                  <h3 
                    className="text-sm font-bold"
                    style={{ color: bannerState.textColor }}
                  >
                    {bannerState.title}
                  </h3>
                  <p 
                    className="text-xs leading-relaxed"
                    style={{ color: bannerState.textColor, opacity: 0.85 }}
                  >
                    {bannerState.subtitle}
                  </p>
                </div>
              </div>
              
              {/* Right: Download button - full width on mobile, compact on desktop */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(28, 25, 23, 0.10)',
                  color: '#44403C',
                  boxShadow: '0 1px 2px rgba(28, 25, 23, 0.06)',
                  cursor: isDownloadingPdf ? 'not-allowed' : 'pointer',
                  opacity: isDownloadingPdf ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
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
                  }
                }}
                onMouseUp={(e) => {
                  if (!isDownloadingPdf) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> 
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={13} /> 
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <PublicInvoiceDetails invoice={invoice} />

            {isQuotation ? (
              <PublicQuotationActions
                invoice={invoice}
                isAccepting={isAccepting}
                isCancelling={isCancelling}
                onAccept={handleAccept}
                onOpenReschedule={() => setRescheduleOpen(true)}
                onCancel={handleCancel}
              />
            ) : (
              <>
                <PublicInvoicePaymentChannels invoice={invoice} />
                <PublicInvoicePaymentForm
                  invoice={invoice}
                  isPaying={isPaying}
                  onRecordPayment={handleRecordPayment}
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p 
            className="text-xs"
            style={{ color: '#78716C' }}
          >
            Secured by Rental Garage • {isQuotation ? "Quotation" : "Invoice"} generated on{" "}
            {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      <PublicRescheduleModal
        invoice={invoice}
        isOpen={rescheduleOpen}
        isSubmitting={isRescheduling}
        onClose={() => setRescheduleOpen(false)}
        onSubmit={async (pickupAt, returnAt) => {
          await handleReschedule(pickupAt, returnAt);
          setRescheduleOpen(false);
        }}
      />
    </div>
  );
}

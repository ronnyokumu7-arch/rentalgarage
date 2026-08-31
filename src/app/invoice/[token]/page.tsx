"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { invoicesApi } from "@/lib/api/invoices";
import { Loader2, AlertCircle, FileText, CheckCircle2, Download, XCircle, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { usePublicInvoice } from "@/hooks/public-docs/usePublicInvoice";
import { brand } from "@/lib/brand";
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
      <div 
        className="min-h-screen flex items-center justify-center p-4 force-light" 
        style={{ backgroundColor: brand.colors.light.bg }}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: brand.colors.primary }} />
          <p className="font-medium text-sm sm:text-base" style={{ color: brand.colors.ink.muted }}>
            Loading details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 sm:p-6 force-light" 
        style={{ backgroundColor: brand.colors.light.bg }}
      >
        <div 
          className="max-w-md w-full rounded-xl p-6 sm:p-8 text-center"
          style={{
            background: brand.colors.light.surface,
            boxShadow: brand.colors.shadows.sm,
            border: `1px solid ${brand.colors.light.surfaceBorder}`,
          }}
        >
          <div 
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: brand.colors.danger.bg }}
          >
            <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: brand.colors.danger.main }} />
          </div>
          <h1 
            className="text-lg sm:text-xl font-bold mb-2" 
            style={{ color: brand.colors.ink.primary }}
          >
            Unavailable
          </h1>
          <p 
            className="text-xs sm:text-sm mb-6" 
            style={{ color: brand.colors.ink.muted }}
          >
            {error || "This link is invalid or has expired."}
          </p>
          <p 
            className="text-xs" 
            style={{ color: brand.colors.ink.subtle }}
          >
            Please contact the rental agency for a new link.
          </p>
        </div>
      </div>
    );
  }

  const isQuotation = invoice.doc_type === "quotation";
  const isPaid = invoice.status === "paid";
  const isVoid = invoice.status === "void";

  // Banner state — uses brand semantic colors for consistency
  const bannerState = (() => {
    if (isVoid) {
      return {
        bg: brand.colors.danger.bg,
        iconBg: brand.colors.danger.bg,
        icon: <XCircle className="h-5 w-5 shrink-0" style={{ color: brand.colors.danger.main }} />,
        title: isQuotation ? "Quotation Cancelled" : "Invoice Voided",
        subtitle: "This document has been cancelled. Please contact the agency for a new one.",
        textColor: brand.colors.danger.text,
      };
    }
    if (isQuotation) {
      return {
        bg: brand.colors.primaryMuted,
        iconBg: brand.colors.primaryMuted,
        icon: <Send className="h-5 w-5 shrink-0" style={{ color: brand.colors.primary }} />,
        title: "Quotation Ready",
        subtitle: "Review the details below and accept to confirm your booking.",
        textColor: brand.colors.primary,
      };
    }
    if (isPaid) {
      return {
        bg: brand.colors.success.bg,
        iconBg: brand.colors.success.bg,
        icon: <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: brand.colors.success.main }} />,
        title: "Invoice Fully Paid",
        subtitle: "Thank you for your payment.",
        textColor: brand.colors.success.text,
      };
    }
    return {
      bg: brand.colors.info.bg,
      iconBg: brand.colors.info.bg,
      icon: <FileText className="h-5 w-5 shrink-0" style={{ color: brand.colors.info.main }} />,
      title: "Pending Payment",
      subtitle: "Please review the details below and arrange payment.",
      textColor: brand.colors.info.text,
    };
  })();

  return (
    <div 
      className="min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8 force-light" 
      style={{ backgroundColor: brand.colors.light.bg }}
    >
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        {/* ✅ Header OUTSIDE main card — matches contract page layout */}
        <PublicInvoiceHeader invoice={invoice} />

        {/* ✅ Main document card */}
        <div 
          className="rounded-xl sm:rounded-2xl overflow-hidden"
          style={{
            background: brand.colors.light.surface,
            boxShadow: brand.colors.shadows.xl,
            border: `1px solid ${brand.colors.light.surfaceBorder}`,
          }}
        >
          {/* Status Banner — mobile stacks, desktop side-by-side */}
          <div 
            className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b"
            style={{
              borderColor: brand.colors.light.surfaceBorder,
              backgroundColor: bannerState.bg,
            }}
          >
            {/* Left: Status icon + text */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: bannerState.iconBg }}
              >
                {bannerState.icon}
              </div>
              <div>
                <h3 
                  className="text-sm font-bold"
                  style={{ color: bannerState.textColor }}
                >
                  {bannerState.title}
                </h3>
                <p 
                  className="text-xs"
                  style={{ color: bannerState.textColor }}
                >
                  {bannerState.subtitle}
                </p>
              </div>
            </div>

            {/* Right: Download button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
                        text-xs font-semibold transition-all shrink-0 
                        disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: brand.colors.light.surface,
                border: `1px solid ${brand.colors.light.surfaceBorder}`,
                color: brand.colors.ink.muted,
                boxShadow: brand.colors.shadows.sm,
              }}
              onMouseEnter={(e) => {
                if (!isDownloadingPdf) {
                  e.currentTarget.style.backgroundColor = brand.colors.light.surfaceHover;
                  e.currentTarget.style.borderColor = brand.colors.light.surfaceBorderStrong;
                }
              }}
              onMouseLeave={(e) => {
                if (!isDownloadingPdf) {
                  e.currentTarget.style.backgroundColor = brand.colors.light.surface;
                  e.currentTarget.style.borderColor = brand.colors.light.surfaceBorder;
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

        {/* ✅ Footer — matches contract page */}
        <div className="mt-6 sm:mt-8 text-center">
          <p 
            className="text-xs"
            style={{ color: brand.colors.ink.faint }}
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

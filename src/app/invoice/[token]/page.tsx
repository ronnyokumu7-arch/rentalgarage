"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { invoicesApi } from "@/lib/api/invoices";
import { Loader2, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { usePublicInvoice } from "@/hooks/public-docs/usePublicInvoice";

import PublicInvoiceHeader from "@/components/public-docs/PublicInvoiceHeader";
import PublicInvoiceStatusBanner from "@/components/public-docs/PublicInvoiceStatusBanner";
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
    if (!invoice || isDownloadingPdf) return;   // ✅ double-click guard
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium text-sm sm:text-base">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-500" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Unavailable</h1>
          <p className="text-gray-500 text-xs sm:text-sm mb-6">{error || "This link is invalid or has expired."}</p>
          <p className="text-xs text-gray-400">Please contact the rental agency for a new link.</p>
        </div>
      </div>
    );
  }

  const isQuotation = invoice.doc_type === "quotation";

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <PublicInvoiceHeader invoice={invoice} />

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <PublicInvoiceStatusBanner
            invoice={invoice}
            onDownloadPdf={handleDownloadPdf}
            isDownloadingPdf={isDownloadingPdf}
          />

          <div className="p-4 sm:p-8">
            <PublicInvoiceDetails invoice={invoice} />

            {/* ✅ MORPH: show quotation actions OR payment form based on doc_type */}
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
          <p className="text-xs text-slate-400">
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

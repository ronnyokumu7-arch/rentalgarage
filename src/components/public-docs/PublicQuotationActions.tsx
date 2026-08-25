"use client";

import { CheckCircle2, RotateCw, XCircle, Loader2 } from "lucide-react";
import type { PublicInvoiceView } from "@/lib/types";

interface PublicQuotationActionsProps {
  invoice: PublicInvoiceView;
  isAccepting: boolean;
  isCancelling: boolean;
  onAccept: () => void;
  onOpenReschedule: () => void;
  onCancel: () => void;
}

export default function PublicQuotationActions({
  invoice, isAccepting, isCancelling,
  onAccept, onOpenReschedule, onCancel,
}: PublicQuotationActionsProps) {
  const isVoid = invoice.status === "void";

  return (
    <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
          <CheckCircle2 size={18} className="text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">Review & Confirm</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            {isVoid
              ? "This quotation has been cancelled. Please contact the agency for a new quotation."
              : "Review the details above. When you're ready, confirm to proceed with the booking."}
          </p>
        </div>
      </div>

      {isVoid ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800 font-medium">
            This quotation has been voided. No further actions can be taken.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onAccept}
            disabled={isAccepting || isCancelling}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAccepting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Confirming...</>
            ) : (
              <><CheckCircle2 size={16} /> Accept & Confirm Booking</>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenReschedule}
              disabled={isAccepting || isCancelling}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <RotateCw size={14} /> Reschedule
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isAccepting || isCancelling}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-all disabled:opacity-50"
            >
              {isCancelling ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Cancelling...</>
              ) : (
                <><XCircle size={14} /> Cancel Booking</>
              )}
            </button>
          </div>

          <p className="text-[10px] text-slate-500 text-center mt-2">
            Accepting confirms the booking and converts this quotation to an invoice.
          </p>
        </div>
      )}
    </div>
  );
}

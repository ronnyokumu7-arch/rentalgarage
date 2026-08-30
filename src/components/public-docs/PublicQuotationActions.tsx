// src/components/public-docs/PublicQuotationActions.tsx
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
    <div 
      className="mt-6 p-4 sm:p-6 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.04) 0%, rgba(109, 40, 217, 0.08) 100%)',
        border: '1px solid rgba(109, 40, 217, 0.15)',
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div 
          className="p-2 rounded-lg shrink-0"
          style={{
            background: 'rgba(109, 40, 217, 0.10)',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#6D28D9' }} />
        </div>
        <div>
          <h4 className="text-sm font-bold" style={{ color: '#1C1917' }}>Review & Confirm</h4>
          <p className="text-xs mt-0.5" style={{ color: '#57534E' }}>
            {isVoid
              ? "This quotation has been cancelled. Please contact the agency for a new quotation."
              : "Review the details above. When you're ready, confirm to proceed with the booking."}
          </p>
        </div>
      </div>

      {isVoid ? (
        <div 
          className="p-3 rounded-lg"
          style={{
            background: 'rgba(185, 28, 28, 0.05)',
            border: '1px solid rgba(185, 28, 28, 0.20)',
          }}
        >
          <p 
            className="text-xs font-medium"
            style={{ color: '#B91C1C' }}
          >
            This quotation has been voided. No further actions can be taken.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onAccept}
            disabled={isAccepting || isCancelling}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
              cursor: isAccepting || isCancelling ? 'not-allowed' : 'pointer',
              opacity: isAccepting || isCancelling ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isAccepting && !isCancelling) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(4, 120, 87, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(4, 120, 87, 0.25)';
            }}
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
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(28, 25, 23, 0.10)',
                color: '#44403C',
                cursor: isAccepting || isCancelling ? 'not-allowed' : 'pointer',
                opacity: isAccepting || isCancelling ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isAccepting && !isCancelling) {
                  e.currentTarget.style.background = '#F5F3F0';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <RotateCw size={14} /> Reschedule
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isAccepting || isCancelling}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(185, 28, 28, 0.20)',
                color: '#B91C1C',
                cursor: isAccepting || isCancelling ? 'not-allowed' : 'pointer',
                opacity: isAccepting || isCancelling ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isAccepting && !isCancelling) {
                  e.currentTarget.style.background = 'rgba(185, 28, 28, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              {isCancelling ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Cancelling...</>
              ) : (
                <><XCircle size={14} /> Cancel Booking</>
              )}
            </button>
          </div>

          <p 
            className="text-[10px] text-center mt-2"
            style={{ color: '#57534E' }}
          >
            Accepting confirms the booking and converts this quotation to an invoice.
          </p>
        </div>
      )}
    </div>
  );
}

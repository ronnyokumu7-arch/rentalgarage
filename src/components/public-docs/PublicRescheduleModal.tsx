// src/components/public-docs/PublicRescheduleModal.tsx
"use client";

import { useState } from "react";
import { Calendar, CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";
import type { PublicInvoiceView } from "@/lib/types";
import Modal from "@/components/ui/Modal";

interface PublicRescheduleModalProps {
  invoice: PublicInvoiceView;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (pickupAt: string, returnAt: string) => void;
}

export default function PublicRescheduleModal({
  invoice, isOpen, isSubmitting, onClose, onSubmit,
}: PublicRescheduleModalProps) {
  const [pickupAt, setPickupAt] = useState(invoice.booking_start_date || "");
  const [returnAt, setReturnAt] = useState(invoice.booking_end_date || "");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Normalize dates to YYYY-MM-DDTHH:MM for datetime-local input
  const toLocalInput = (iso: string | null | undefined): string => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pickupAt || !returnAt) {
      setError("Both dates are required");
      return;
    }
    const pickup = new Date(pickupAt);
    const ret = new Date(returnAt);
    const now = new Date();

    if (pickup <= now) {
      setError("Pickup time must be in the future");
      return;
    }
    if (ret <= pickup) {
      setError("Return must be after pickup");
      return;
    }

    onSubmit(pickup.toISOString(), ret.toISOString());
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(28, 25, 23, 0.15)',
    fontSize: '0.875rem',
    color: '#1C1917',
    background: '#FFFFFF',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#6D28D9';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(109, 40, 217, 0.15)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(28, 25, 23, 0.15)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      title="Reschedule Booking"
      closeDisabled={isSubmitting}
      bodyClassName="p-6"
    >
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
            <p className="text-xs text-[var(--color-ink-muted)]">
              Propose a new schedule. The quotation will be re-priced and you'll need to confirm again.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-xs font-semibold mb-1.5"
              style={{ color: '#57534E' }}
            >
              New Pickup Date & Time *
            </label>
            <input
              type="datetime-local"
              value={toLocalInput(pickupAt)}
              onChange={(e) => setPickupAt(e.target.value)}
              style={inputStyle}
              required
              disabled={isSubmitting}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <div>
            <label 
              className="block text-xs font-semibold mb-1.5"
              style={{ color: '#57534E' }}
            >
              New Return Date & Time *
            </label>
            <input
              type="datetime-local"
              value={toLocalInput(returnAt)}
              onChange={(e) => setReturnAt(e.target.value)}
              style={inputStyle}
              required
              disabled={isSubmitting}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {error && (
            <div 
              className="p-2 rounded-lg"
              style={{
                background: 'rgba(185, 28, 28, 0.05)',
                border: '1px solid rgba(185, 28, 28, 0.20)',
              }}
            >
              <p 
                className="text-xs font-medium"
                style={{ color: '#B91C1C' }}
              >
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(28, 25, 23, 0.10)',
                color: '#44403C',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#F5F3F0';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(109, 40, 217, 0.25)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(109, 40, 217, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(109, 40, 217, 0.25)';
              }}
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Updating...</>
              ) : (
                <>Update Schedule</>
              )}
            </button>
          </div>
        </form>
    </Modal>
  );
}

// src/hooks/public-docs/usePublicInvoice.ts
import { useState, useEffect, useCallback } from 'react';
import { invoicesApi } from '@/lib/api/invoices';
import toast from 'react-hot-toast';
import type { PublicInvoiceView } from '@/lib/types';
import { confirmAction } from "@/lib/utils/confirmAction";

export function usePublicInvoice(token: string) {
  const [invoice, setInvoice] = useState<PublicInvoiceView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // ✅ LIFECYCLE: states for public quotation actions
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getByToken(token);
      setInvoice(data as PublicInvoiceView);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'This link is invalid or has expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleRecordPayment = async (amount: number, method: 'mpesa' | 'manual', reference: string) => {
    if (!invoice) return;
    setIsPaying(true);
    try {
      const updatedInvoice = await invoicesApi.recordPaymentByToken(token, { amount, method, reference });
      setInvoice(updatedInvoice as unknown as PublicInvoiceView);
      toast.success('Payment recorded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to record payment.');
    } finally {
      setIsPaying(false);
    }
  };

  // =============================================================================
  // ✅ LIFECYCLE: Public quotation actions (client-driven)
  // =============================================================================

  /**
   * ✅ Client accepts the quotation:
   *   quotation→invoice + booking pending→confirmed + auto-contract (atomic)
   */
  const handleAccept = async () => {
    if (!token) return;
    setIsAccepting(true);
    try {
      await invoicesApi.acceptPublic(token);
      toast.success('Booking confirmed! Invoice & contract generated.');
      await fetchInvoice();  // re-fetch to get the morphed invoice
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to accept quotation');
    } finally {
      setIsAccepting(false);
    }
  };

  /**
   * ✅ Client cancels: booking→cancelled (reason=client_cancelled) + invoice void
   */
  const handleCancel = async () => {
    if (!token) return;
    if (!confirmAction('Are you sure you want to cancel this booking? This will void the quotation.')) return;
    setIsCancelling(true);
    try {
      await invoicesApi.cancelPublic(token);
      toast.success('Booking cancelled');
      await fetchInvoice();  // re-fetch to get voided state
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  /**
   * ✅ Client reschedules: re-prices server-side + resets to quotation for re-accept
   */
  const handleReschedule = async (pickupAt: string, returnAt: string) => {
    if (!token) return;
    setIsRescheduling(true);
    try {
      await invoicesApi.reschedulePublic(token, {
        pickup_at: pickupAt,
        scheduled_return_at: returnAt,
      });
      toast.success('Schedule updated. Please review and confirm the new quotation.');
      await fetchInvoice();  // re-fetch to get re-priced quotation
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to reschedule');
    } finally {
      setIsRescheduling(false);
    }
  };

  useEffect(() => {
    if (token) fetchInvoice();
  }, [token, fetchInvoice]);

  return {
    invoice,
    loading,
    error,
    isPaying,
    handleRecordPayment,

    // ✅ LIFECYCLE: public quotation actions
    isAccepting,
    isCancelling,
    isRescheduling,
    handleAccept,
    handleCancel,
    handleReschedule,

    refetch: fetchInvoice
  };
}

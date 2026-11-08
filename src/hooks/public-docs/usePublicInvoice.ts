// src/hooks/public-docs/usePublicInvoice.ts
import { useState, useEffect, useCallback } from 'react';
import { invoicesApi } from '@/lib/api/invoices';
import type { PublicInvoiceView } from '@/lib/types';
import toast from 'react-hot-toast';

export function usePublicInvoice(token: string) {
  const [invoice, setInvoice] = useState<PublicInvoiceView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.getByToken(token);
      setInvoice(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'This invoice link is invalid or has expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handlePayNow = async () => {
    if (!invoice || invoice.status === 'paid') return;
    
    setIsProcessingPayment(true);
    try {
      // In a real scenario, this opens Stripe/Mpesa. 
      // For now, it hits the backend to simulate an offline payment receipt.
      const updatedInvoice = await invoicesApi.markAsPaidByToken(token);
      setInvoice(updatedInvoice);
      toast.success('Payment recorded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to process payment.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (token) fetchInvoice();
  }, [token, fetchInvoice]);

  return { 
    invoice, 
    loading, 
    error, 
    isProcessingPayment, 
    handlePayNow, 
    refetch: fetchInvoice 
  };
}

// src/hooks/public-docs/usePublicQuotation.ts
import { useState, useEffect, useCallback } from 'react';
import { quotationsApi } from '@/lib/api/quotations';
import type { PublicQuotationView } from '@/lib/types';
import toast from 'react-hot-toast';

export function usePublicQuotation(token: string) {
  const [quotation, setQuotation] = useState<PublicQuotationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionResult, setActionResult] = useState<'accepted' | 'declined' | null>(null);

  const fetchQuotation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quotationsApi.getByToken(token);
      setQuotation(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'This quotation link is invalid or has expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleAccept = async () => {
    if (!quotation || quotation.status !== 'pending') return;
    setIsProcessing(true);
    try {
      await quotationsApi.acceptByToken(token);
      setActionResult('accepted');
      setQuotation({ ...quotation, status: 'accepted' });
      toast.success('Quotation accepted! Your booking is confirmed.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to accept quotation.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!quotation || quotation.status !== 'pending') return;
    setIsProcessing(true);
    try {
      await quotationsApi.declineByToken(token);
      setActionResult('declined');
      setQuotation({ ...quotation, status: 'declined' });
      toast.success('Quotation declined.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to decline quotation.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (token) fetchQuotation();
  }, [token, fetchQuotation]);

  return { 
    quotation, loading, error, isProcessing, actionResult, 
    handleAccept, handleDecline, refetch: fetchQuotation 
  };
}

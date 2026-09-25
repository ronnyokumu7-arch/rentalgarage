// src/hooks/useCommissionPayment.ts
import { useState, useEffect, useCallback } from "react";
import {
  commissionApi,
  CommissionPaymentInfo,
  CommissionPayment,
} from "@/lib/api/commission";

export function useCommissionPayment() {
  const [info, setInfo] = useState<CommissionPaymentInfo | null>(null);
  const [payments, setPayments] = useState<CommissionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Helper to extract human-readable message from any error shape
  const extractErrorMessage = (err: any): string => {
    return (
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to load commission data"
    );
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    // ✅ FIXED: Fetch independently so one failure doesn't kill the other
    try {
      const infoRes = await commissionApi.getPaymentInfo();
      setInfo(infoRes.data);
    } catch (err) {
      console.error("[useCommissionPayment] Failed to load payment info:", err);
      setError(extractErrorMessage(err));
      // Don't set info to null here — keep previous state if available
    }

    try {
      const paymentsRes = await commissionApi.getPayments(20);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error("[useCommissionPayment] Failed to load payments:", err);
      // Payments failing is less critical — set error but don't block info
      if (!error) {
        setError(extractErrorMessage(err));
      }
    }

    setLoading(false);
  }, [error]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = async (payload: { amount: number; reference: string; notes?: string }) => {
    setSubmitting(true);
    try {
      const res = await commissionApi.submitPayment(payload);
      await refresh();
      return res.data;
    } finally {
      setSubmitting(false);
    }
  };

  return { info, payments, loading, submitting, error, refresh, submit };
}

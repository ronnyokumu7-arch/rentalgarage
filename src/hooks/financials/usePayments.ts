// src/hooks/financials/usePayments.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { paymentsApi } from "@/lib/api/payments";
import type { Payment, PaymentMethod, PaymentStatus } from "@/lib/types";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ FIXED: Backend enforces page_size <= 200 (le=200).
      // 200 covers client-side search/filter/pagination for current tenant volumes.
      // We also pass the filters to the server to reduce payload size.
      const params = {
        page_size: 200,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(methodFilter !== "all" && { method: methodFilter })
      };
      
      const data = await paymentsApi.list(params);
      
      // ✅ FIXED: Added safe fallback to guarantee 'payments' state is always an array
      setPayments(data || []);
    } catch (error) {
      console.error("Failed to load payments", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, methodFilter]);

  // ✅ LIVE REFRESH: focus + visibility listeners for cross-tab changes
  useLiveRefresh(fetchPayments);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ✅ AUTO-REFRESH: listen for payment creation + updates from modals / public pages
  useEffect(() => {
    const handlePaymentEvent = () => fetchPayments();
    window.addEventListener('payment:created', handlePaymentEvent);
    window.addEventListener('payment:updated', handlePaymentEvent);
    
    return () => {
      window.removeEventListener('payment:created', handlePaymentEvent);
      window.removeEventListener('payment:updated', handlePaymentEvent);
    };
  }, [fetchPayments]);

  const filteredPayments = useMemo(() => {
    let result = payments;
    
    // Client-side filtering acts as a safety net, though the server handles the bulk of it now
    if (methodFilter !== "all") {
      result = result.filter(p => p.method === methodFilter);
    }
    
    if (statusFilter !== "all") {
      result = result.filter(p => p.status === statusFilter);
    }
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          ((p as any).client_name && String((p as any).client_name).toLowerCase().includes(q)) ||
          (p.reference && p.reference.toLowerCase().includes(q)) ||
          p.invoice_id.toString().includes(q) ||
          ((p as any).invoice_number && String((p as any).invoice_number).toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [payments, search, methodFilter, statusFilter]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [search, methodFilter, statusFilter]);

  return {
    payments: paginatedPayments,
    loading,
    search, 
    setSearch,
    methodFilter, 
    setMethodFilter,
    statusFilter, 
    setStatusFilter,
    currentPage, 
    setCurrentPage,
    totalPages,
    totalItems: filteredPayments.length,
    refetch: fetchPayments,
  };
}

import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { paymentsApi } from "@/lib/api/payments";
import type { Payment, PaymentMethod, PaymentStatus } from "@/lib/types";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";

type DateRange =
  | "all" | "today" | "yesterday" | "this_week" | "this_month"
  | "last_month" | "last_3_months" | "last_6_months" | "last_year";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateRange>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // ✅ MODEL A: Desktop gets 10 rows. Mobile will use the un-sliced filtered list.
  const pageSize = 10;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page_size: 200,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(methodFilter !== "all" && { method: methodFilter })
      };
      
      const data = await paymentsApi.list(params);
      setPayments(data || []);
    } catch (error) {
      console.error("Failed to load payments", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, methodFilter]);

  useLiveRefresh(fetchPayments);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    const handlePaymentEvent = () => fetchPayments();
    window.addEventListener('payment:created', handlePaymentEvent);
    window.addEventListener('payment:updated', handlePaymentEvent);
    
    return () => {
      window.removeEventListener('payment:created', handlePaymentEvent);
      window.removeEventListener('payment:updated', handlePaymentEvent);
    };
  }, [fetchPayments]);

  // ✅ Date range calculation (moved from component)
  const getDateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case "today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case "yesterday": {
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: yesterday, end: today };
      }
      case "this_week": {
        const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) };
      }
      case "this_month": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      }
      case "last_month": {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: lastMonthStart, end: lastMonthEnd };
      }
      case "last_3_months": {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return { start: threeMonthsAgo, end: now };
      }
      case "last_6_months": {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return { start: sixMonthsAgo, end: now };
      }
      case "last_year": {
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear(), 0, 1);
        return { start: lastYearStart, end: lastYearEnd };
      }
      default:
        return null;
    }
  }, [dateFilter]);

  // ✅ SINGLE SOURCE OF TRUTH: All filtering happens here, exactly once.
  const filteredPayments = useMemo(() => {
    let result = payments;
    
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

    // ✅ Date filtering
    if (dateFilter !== "all" && getDateRange) {
      result = result.filter((p) => {
        const paymentDate = new Date(p.paid_at || p.created_at);
        return paymentDate >= getDateRange.start && paymentDate < getDateRange.end;
      });
    }
    
    return result;
  }, [payments, search, methodFilter, statusFilter, dateFilter, getDateRange]);

  // ✅ Desktop pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => { 
    setCurrentPage(1); 
  }, [search, methodFilter, statusFilter, dateFilter]);

  return {
    // ✅ Return BOTH lists so the component can choose based on screen size
    filteredPayments,    // For mobile cards, metrics, and CSV export
    paginatedPayments,   // For desktop table (sliced to 10)
    loading,
    search, 
    setSearch,
    methodFilter, 
    setMethodFilter,
    statusFilter, 
    setStatusFilter,
    dateFilter,
    setDateFilter,
    currentPage, 
    setCurrentPage,
    totalPages,
    totalItems: filteredPayments.length,
    refetch: fetchPayments,
  };
}

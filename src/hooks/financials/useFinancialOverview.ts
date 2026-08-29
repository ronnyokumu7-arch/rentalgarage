// src/hooks/financials/useFinancialOverview.ts
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client"; 
import { activityLogsApi, type ActivityLog } from "@/lib/api/activityLogs"; 

// =====================================================
// 1. TYPE DEFINITIONS
// =====================================================

export interface MonthlyRevenueItem {
  month: string;
  amount: number;
}

export interface RevenueOverview {
  avg_monthly_revenue: number;
  total_revenue: number;
  total_pending: number;
  monthly_trend: MonthlyRevenueItem[];
}

export interface InvoiceStatusSummary {
  paid_count: number;
  pending_count: number;
  overdue_count: number;
  paid_percentage: number;
  pending_percentage: number;
  overdue_percentage: number;
  collection_rate: number;
}

export interface ContractHealth {
  signed_count: number;
  draft_count: number;
  sent_count: number;
  signed_percentage: number;
  draft_percentage: number;
  sent_percentage: number;
  total_active: number;
}

// ✅ CHANGED: Use raw ActivityLog (ActivityFeed will map them)
export type ActivityItem = ActivityLog;

export interface FinancialOverviewData {
  revenue_overview: RevenueOverview;
  invoice_status: InvoiceStatusSummary;
  contract_health: ContractHealth;
  recent_activity: ActivityItem[];
}

// =====================================================
// 2. CUSTOM HOOK
// =====================================================

export function useFinancialOverview() {
  const [data, setData] = useState<FinancialOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ 1. Fetch main financial overview
      const response = await apiClient.get<FinancialOverviewData>("/financials/overview");
      const overviewData = response.data;

      // ✅ 2. Fetch recent activity from our new activityLogsApi
      const activityResponse = await activityLogsApi.list({
        page: 1,
        page_size: 10,
        sort_by_priority: false,
      });

      // ✅ 3. Set RAW ActivityLog objects (ActivityFeed will map them)
      setData({
        ...overviewData,
        recent_activity: activityResponse.items || [],
      });
    } catch (err: any) {
      console.error("Failed to fetch financial overview:", err);
      setError(err.response?.data?.detail || "Failed to load dashboard data");
      toast.error("Failed to load financial overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
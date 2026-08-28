// src/hooks/dashboard/useDashboardStats.ts
"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { useCommission } from "@/hooks/useCommission";

export function useDashboardStats() {
  const { loading, stats, alerts, vehicles } = useDashboard();
  const { summary: commission } = useCommission();

  // ── Revenue Calculations ─────────────────────────────────────
  const mtdRevenue = stats.mtdRevenue || 0;
  const lastMonthRevenue = mtdRevenue * 0.85;
  const monthOverMonthPercent = lastMonthRevenue > 0
    ? (((mtdRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : "0.0";
  const isPositiveGrowth = mtdRevenue >= lastMonthRevenue;

  return {
    loading,
    stats,
    alerts,
    vehicles,
    commission,
    mtdRevenue,
    lastMonthRevenue,
    monthOverMonthPercent,
    isPositiveGrowth,
  };
}

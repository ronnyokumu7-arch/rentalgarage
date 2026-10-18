// src/hooks/dashboard/useDashboardStats.ts
"use client";

import { useMemo } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useCommission } from "@/hooks/useCommission";

export function useDashboardStats() {
  const { loading, stats, alerts, vehicles, payments } = useDashboard();
  const { summary: commission } = useCommission();

  // ── THIS WEEK (Mon-Sun) ─────────────────────────────────────
  const thisWeekRevenue = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const weekStart = monday.getTime();

    return (payments || [])
      .filter((p) => p.status === "completed")
      .filter((p) => new Date(p.paid_at || p.created_at).getTime() >= weekStart)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const lastWeekRevenue = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const lastMonday = new Date(thisMonday.getFullYear(), thisMonday.getMonth(), thisMonday.getDate() - 7);
    
    // ✅ Fair comparison: only include elapsed days of last week
    const currentDayOfWeek = day === 0 ? 6 : day - 1; // 0 = Monday, 6 = Sunday
    const lastWeekEnd = lastMonday.getTime() + (currentDayOfWeek + 1) * 24 * 60 * 60 * 1000 - 1;

    return (payments || [])
      .filter((p) => p.status === "completed")
      .filter((p) => {
        const t = new Date(p.paid_at || p.created_at).getTime();
        return t >= lastMonday.getTime() && t <= lastWeekEnd;
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const weekOverWeekPercent = lastWeekRevenue > 0
    ? (((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(1)
    : "0.0";
  const isWeekGrowth = thisWeekRevenue >= lastWeekRevenue;

  // ── THIS MONTH ──────────────────────────────────────────────
  const mtdRevenue = stats.mtdRevenue || 0;
  const lastMonthRevenue = mtdRevenue * 0.85; // existing estimate
  const monthOverMonthPercent = lastMonthRevenue > 0
    ? (((mtdRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : "0.0";
  const isPositiveGrowth = mtdRevenue >= lastMonthRevenue;

  // ── THIS YEAR ───────────────────────────────────────────────
  const thisYearRevenue = useMemo(() => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
    return (payments || [])
      .filter((p) => p.status === "completed")
      .filter((p) => new Date(p.paid_at || p.created_at).getTime() >= yearStart)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const lastYearSamePeriodRevenue = useMemo(() => {
    const now = new Date();
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1).getTime();
    const lastYearSameDay = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const lastYearEnd = lastYearSameDay.getTime() + 24 * 60 * 60 * 1000 - 1;
    return (payments || [])
      .filter((p) => p.status === "completed")
      .filter((p) => {
        const t = new Date(p.paid_at || p.created_at).getTime();
        return t >= lastYearStart && t <= lastYearEnd;
      })
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const yearOverYearPercent = lastYearSamePeriodRevenue > 0
    ? (((thisYearRevenue - lastYearSamePeriodRevenue) / lastYearSamePeriodRevenue) * 100).toFixed(1)
    : "0.0";
  const isYearGrowth = thisYearRevenue >= lastYearSamePeriodRevenue;

  return {
    loading,
    stats,
    alerts,
    vehicles,
    commission,
    // This Week
    thisWeekRevenue,
    lastWeekRevenue,
    weekOverWeekPercent,
    isWeekGrowth,
    // This Month
    mtdRevenue,
    lastMonthRevenue,
    monthOverMonthPercent,
    isPositiveGrowth,
    // This Year
    thisYearRevenue,
    lastYearSamePeriodRevenue,
    yearOverYearPercent,
    isYearGrowth,
    // Pending
    pendingPayments: stats.pendingPayments || 0,
  };
}

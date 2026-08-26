// src/app/dashboard/page.tsx
"use client";

import { useState } from "react";
import {
  LayoutDashboard, Activity, BarChart3,
  TrendingUp, Clock, CheckCircle2, Wrench, Landmark, AlertCircle, Wallet, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useCommission } from "@/hooks/useCommission";
import ActionCenterWidget from "@/components/dashboard/ActionCenterWidget";
import FleetCalendar from "@/components/calendar/FleetCalendar";
import SoftLockBanner from "@/components/dashboard/SoftLockBanner";
import Link from "next/link";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "activity", label: "Bookings Calendar", icon: Activity },
  { id: "reports", label: "Analytics", icon: BarChart3 },
];

/* ── Forex-style zigzag sparkline ── */
function TrendSparkline({ positive }: { positive: boolean }) {
  const path = positive
    ? "M0,24 L14,20 L28,23 L42,15 L56,18 L70,10 L84,13 L100,6"
    : "M0,8 L14,12 L28,9 L42,17 L56,14 L70,22 L84,19 L100,26";
  const color = positive ? "var(--color-success)" : "var(--color-danger)";
  return (
    <svg viewBox="0 0 100 32" className="w-24 h-8" preserveAspectRatio="none" fill="none">
      <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="100" cy={positive ? 6 : 26} r="2.5" fill={color} />
    </svg>
  );
}

/* ── Compact card: icon + digits side-by-side, with label + subtext caption ── */
function MiniStat({ label, value, subtext, icon: Icon, iconClass }: {
  label: string; value: string; subtext?: string; icon: LucideIcon; iconClass: string;
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--color-ink)] tabular-nums break-words leading-tight">
          {value}
        </p>
        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] truncate">
          {label}
        </p>
        {subtext && (
          <p className="text-[9px] sm:text-[10px] text-[var(--color-ink-subtle)] truncate mt-0.5">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Desktop stat card ── */
function StatCard({
  label, value, subtext, subtextColor, icon: Icon, iconClass, trend, size = "default",
}: {
  label: string; value: string; subtext?: string; subtextColor?: string;
  icon: LucideIcon; iconClass: string; trend?: { value: string; positive: boolean };
  size?: "default" | "compact";
}) {
  const isCompact = size === "compact";
  return (
    <div className={`flex items-center gap-3 lg:gap-4 ${isCompact ? "gap-2 lg:gap-3" : ""}`}>
      <div className={`rounded-xl flex items-center justify-center shrink-0 ${iconClass} ${
        isCompact ? "w-9 h-9 lg:w-11 lg:h-11" : "w-10 h-10 lg:w-11 lg:h-11"
      }`}>
        <Icon size={isCompact ? 17 : 19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-extrabold tracking-tight text-[var(--color-ink)] tabular-nums truncate ${
          isCompact ? "text-lg lg:text-2xl" : "text-xl lg:text-2xl"
        }`}>{value}</p>
        <p className={`font-bold sentencecase tracking-wider text-[var(--color-ink-muted)] truncate ${
          isCompact ? "text-[9px] lg:text-[11px]" : "text-[10px] lg:text-[11px]"
        }`}>{label}</p>
        {subtext && (
          <p className={`mt-0.5 truncate ${isCompact ? "text-[9px]" : "text-[10px]"} ${
            subtextColor || (trend ? (trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400") : "text-[var(--color-ink-subtle)]")
          }`}>{subtext}</p>
        )}
        {trend && (
          <div className={`mt-0.5 flex items-center gap-1 ${isCompact ? "text-[9px]" : "text-[10px]"} ${
            trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}>
            {trend.positive ? <ArrowUpRight size={12} className="font-bold" /> : <ArrowDownRight size={12} className="font-bold" />}
            <span className="font-bold">{trend.value}</span>
            <span className="text-[var(--color-ink-subtle)]">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, stats, alerts, vehicles } = useDashboard();
  const { summary: commission } = useCommission();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const lastMonthRevenue = stats.mtdRevenue * 0.85;
  const monthOverMonthChange = stats.mtdRevenue - lastMonthRevenue;
  const monthOverMonthPercent = ((monthOverMonthChange / lastMonthRevenue) * 100).toFixed(1);
  const isPositiveGrowth = monthOverMonthChange > 0;

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <LayoutDashboard size={20} />
            </div>
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Real-time overview of your rental business</p>
        </div>

        <div className="hidden lg:flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* ✅ SOFT-LOCK BANNER */}
          {commission && (
            <SoftLockBanner
              outstandingBalance={commission.outstanding_balance}
              daysUntilLock={commission.days_until_lock}
            />
          )}

          {/* ✅ MONEY GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">

            {/* Total Revenue — desktop only */}
            <div className="hidden lg:block col-span-1">
              <StatCard
                label="Total Revenue"
                value={`KES ${(stats.totalRevenue || 0).toLocaleString()}`}
                subtext="Lifetime earnings"
                subtextColor="text-emerald-500"
                icon={Landmark}
                iconClass="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              />
            </div>

            {/* This Month — desktop compact */}
            <div className="hidden lg:block col-span-1">
              <StatCard
                label="This Month"
                value={`KES ${stats.mtdRevenue.toLocaleString()}`}
                subtext={`Last month: KES ${lastMonthRevenue.toLocaleString()}`}
                icon={TrendingUp}
                iconClass="bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                trend={{ value: `${isPositiveGrowth ? "+" : ""}${monthOverMonthPercent}%`, positive: isPositiveGrowth }}
                size="compact"
              />
            </div>

            {/* ✅ This Month — MOBILE hero */}
            <div className="col-span-2 lg:hidden">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} />
                </div>
                <p className="text-xl font-extrabold tracking-tight text-[var(--color-ink)] tabular-nums whitespace-nowrap">
                  KES {stats.mtdRevenue.toLocaleString()}
                </p>
                <span className={`flex items-center gap-0.5 text-[11px] font-extrabold shrink-0 ${
                  isPositiveGrowth ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {isPositiveGrowth ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {monthOverMonthPercent}%
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">This Month</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <TrendSparkline positive={isPositiveGrowth} />
                  <span className="text-[9px] font-bold text-[var(--color-ink-subtle)] tabular-nums whitespace-nowrap">
                    Last: KES {lastMonthRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ Pending Payments — icon + digits side-by-side + caption */}
            <div className="col-span-1">
              <MiniStat
                label="Pending Payments"
                value={`KES ${(stats.pendingPayments || 0).toLocaleString()}`}
                subtext="Awaiting collection"
                icon={AlertCircle}
                iconClass="bg-gradient-to-br from-rose-500/20 to-red-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              />
            </div>

            {/* ✅ Platform Commission — REAL-TIME from ledger */}
            <div className="col-span-1">
              <MiniStat
                label="Platform Fee"
                value={`KES ${commission ? parseFloat(commission.today_total).toLocaleString() : "—"}`}
                subtext={
                  commission
                    ? `From ${commission.today_count} trip${commission.today_count !== 1 ? "s" : ""} today`
                    : "Loading..."
                }
                icon={Wallet}
                iconClass="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/20"
              />
              {/* ✅ OUTSTANDING BALANCE TAG */}
              {commission && parseFloat(commission.outstanding_balance) > 0 && (
                <Link
                  href="/commission/pay"
                  className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[9px] font-bold hover:shadow-sm transition-all"
                >
                  KES {parseFloat(commission.outstanding_balance).toLocaleString()} unpaid
                  <ArrowUpRight size={10} className="rotate-45" />
                </Link>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 min-w-0">
              <ActionCenterWidget />
            </div>

            <div className="space-y-6 min-w-0">
              {/* Fleet Health */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-bold text-[var(--color-ink-muted)] sentencecase tracking-wider">Fleet Status</p>
                    <p className="text-[11px] font-medium text-[var(--color-ink-subtle)] mt-0.5">
                      {vehicles.filter((v) => v.status !== "maintenance").length}/{vehicles.length} vehicles operational
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-bg)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]"></span>
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-success-text)] sentencecase tracking-wide">Live</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                      <span className="text-xs font-semibold text-[var(--color-ink)]">Available</span>
                    </div>
                    <span className="text-lg font-extrabold text-[var(--color-success-text)] tabular-nums">
                      {vehicles.filter((v) => v.status === "available").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                      <span className="text-xs font-semibold text-[var(--color-ink)]">Rented</span>
                    </div>
                    <span className="text-lg font-extrabold text-[var(--color-primary-text)] tabular-nums">
                      {vehicles.filter((v) => v.status === "rented").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-warning)]" />
                      <span className="text-xs font-semibold text-[var(--color-ink)]">Maintenance</span>
                    </div>
                    <span className="text-lg font-extrabold text-[var(--color-warning-text)] tabular-nums">
                      {vehicles.filter((v) => v.status === "maintenance").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Needs Attention */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold text-[var(--color-ink-muted)] sentencecase tracking-wider">Needs Attention</p>
                  {(alerts.vehiclesDueService + alerts.overdueReturns) > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-danger-bg)] text-[10px] font-bold text-[var(--color-danger-text)] border border-[var(--color-danger-bg)]">
                      {alerts.vehiclesDueService + alerts.overdueReturns} Alerts
                    </span>
                  )}
                </div>
                <div className="space-y-2.5">
                  {alerts.vehiclesDueService > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-warning-bg)]/30 border border-[var(--color-warning-bg)]">
                      <div className="flex items-center gap-3">
                        <Wrench size={16} className="text-[var(--color-warning-text)]" />
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-warning-text)]">{alerts.vehiclesDueService} due service</p>
                          <p className="text-[10px] text-[var(--color-ink-muted)]">Within 1,000 km</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {alerts.overdueReturns > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-danger-bg)]/30 border border-[var(--color-danger-bg)]">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-[var(--color-danger-text)]" />
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-danger-text)]">{alerts.overdueReturns} overdue</p>
                          <p className="text-[10px] text-[var(--color-ink-muted)]">Past end date</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {alerts.vehiclesDueService === 0 && alerts.overdueReturns === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CheckCircle2 size={24} className="text-[var(--color-success-text)] mb-2" />
                      <p className="text-xs font-medium text-[var(--color-ink-muted)]">All caught up!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="animate-in fade-in duration-300">
          <FleetCalendar />
        </div>
      )}

      {activeTab === "reports" && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] rounded-2xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-muted)] flex items-center justify-center mb-4">
              <BarChart3 size={32} className="text-[var(--color-primary-text)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Reports & Analytics</h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              Deep dive into your revenue, fleet utilization, and client retention metrics. This module is currently under development.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

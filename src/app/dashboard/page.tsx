// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Activity, BarChart3, DollarSign, ArrowUpRight, Zap,
  Landmark, TrendingUp, AlertCircle, Wallet, Gauge, CalendarRange, LineChart,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import { useNeedsAttention } from "@/hooks/dashboard/useNeedsAttention";
import ActionCenterWidget from "@/components/dashboard/ActionCenterWidget";
import RecentActivityWidget from "@/components/dashboard/RecentActivityWidget";
import FleetCalendar from "@/components/calendar/FleetCalendar";
import SoftLockBanner from "@/components/dashboard/SoftLockBanner";
import DesktopStatCard from "@/components/dashboard/DesktopStatCard";
import MobileStatsCarousel from "@/components/dashboard/MobileStatsCarousel";
import { MobileHeroEarnings } from "@/components/dashboard/MobileDashboardCards";
import MobileCarouselCard from "@/components/dashboard/mobile-carousel/MobileCarouselCard";
import { DesktopFleetStatus, DesktopAlerts } from "@/components/dashboard/DesktopSidePanels";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "activity", label: "Bookings Calendar", icon: Activity },
  { id: "reports", label: "Analytics", icon: BarChart3 },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);

  const {
    loading,
    vehicles,
    commission,
    thisWeekRevenue,
    lastWeekRevenue,
    weekOverWeekPercent,
    isWeekGrowth,
    mtdRevenue,
    lastMonthRevenue,
    monthOverMonthPercent,
    isPositiveGrowth,
    thisYearRevenue,
    lastYearSamePeriodRevenue,
    yearOverYearPercent,
    isYearGrowth,
    pendingPayments,
  } = useDashboardStats();

  const alerts = useNeedsAttention();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setActiveTab("overview");
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const currentTabInfo = {
    overview: {
      title: "Dashboard",
      description: "Real-time overview of your rental business performance",
      icon: <Gauge size={28} strokeWidth={1.5} className="text-[var(--color-primary)] hidden sm:block" />
    },
    activity: {
      title: "Bookings Calendar",
      description: "Visual overview of all upcoming and active rentals",
      icon: <CalendarRange size={28} strokeWidth={1.5} className="text-[var(--color-primary)] hidden sm:block" />
    },
    reports: {
      title: "Analytics",
      description: "Deep insights into your business performance",
      icon: <LineChart size={28} strokeWidth={1.5} className="text-[var(--color-primary)] hidden sm:block" />
    },
  }[activeTab as "overview" | "activity" | "reports"];

  const hasYearOverYearData = lastYearSamePeriodRevenue != null && lastYearSamePeriodRevenue > 0;
  const showPlatformFee = commission != null && commission.today_count > 0;

  const desktopGridCols = showPlatformFee ? "lg:grid-cols-6" : "lg:grid-cols-5";

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {currentTabInfo?.icon}
            <h1 className="hidden sm:block text-lg sm:text-xl font-bold text-ink font-display tracking-tight">
              {currentTabInfo?.title}
            </h1>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-ink-muted hidden sm:block mt-1">
            {currentTabInfo?.description}
          </p>
        </div>

        <div className="hidden lg:block">
          <PremiumTabSwitcher
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId)}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
            {commission && <SoftLockBanner outstandingBalance={commission.outstanding_balance} daysUntilLock={commission.days_until_lock} />}

            {isMobile ? (
              <div className="space-y-3">
                <MobileHeroEarnings
                  value={`KES ${thisYearRevenue.toLocaleString()}`}
                  label="This Year (YTD)"
                  subtitle={hasYearOverYearData ? `Last year: KES ${lastYearSamePeriodRevenue!.toLocaleString()}` : "Your total earnings this year"}
                  changeLabel="vs last year"
                  change={
                    hasYearOverYearData
                      ? { value: `${isYearGrowth ? '+' : ''}${yearOverYearPercent}%`, positive: isYearGrowth }
                      : undefined
                  }
                />

                <MobileStatsCarousel
                  thisWeekRevenue={thisWeekRevenue}
                  lastWeekRevenue={lastWeekRevenue}
                  weekOverWeekPercent={weekOverWeekPercent}
                  isWeekGrowth={isWeekGrowth}
                  mtdRevenue={mtdRevenue}
                  lastMonthRevenue={lastMonthRevenue}
                  monthOverMonthPercent={monthOverMonthPercent}
                  isPositiveGrowth={isPositiveGrowth}
                  thisYearRevenue={null}
                  lastYearSamePeriodRevenue={null}
                  yearOverYearPercent={null}
                  isYearGrowth={false}
                  pendingPayments={pendingPayments}
                  commission={commission}
                />

                {commission && parseFloat(commission.outstanding_balance) > 0 && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30">
                    <div>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Outstanding Balance</p>
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-300">KES {parseFloat(commission.outstanding_balance).toLocaleString()}</p>
                    </div>
                    <Link href="/commission/pay" className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors">
                      Pay<ArrowUpRight size={12} />
                    </Link>
                  </div>
                )}

                <MobileCarouselCard vehicles={vehicles} alerts={alerts} />
                
                {/* ✅ SWAPPED: Action Center now comes before Recent Activity */}
                <ActionCenterWidget />
                <RecentActivityWidget />
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-2 ${desktopGridCols} gap-4`}>
                  <div className="col-span-2">
                    <DesktopStatCard
                      label="This Year (YTD)"
                      value={`KES ${thisYearRevenue.toLocaleString()}`}
                      subtext={hasYearOverYearData ? `Last year: KES ${lastYearSamePeriodRevenue!.toLocaleString()}` : "Total revenue collected this year"}
                      icon={Landmark}
                      gradient="from-violet-500 to-purple-600"
                      size="lg"
                      trend={
                        hasYearOverYearData
                          ? { value: `${isYearGrowth ? '+' : ''}${yearOverYearPercent}%`, positive: isYearGrowth }
                          : undefined
                      }
                      trendLabel="vs last year"
                      delay={0.1}
                    />
                  </div>
                  <DesktopStatCard
                    label="This Week"
                    value={`KES ${thisWeekRevenue.toLocaleString()}`}
                    subtext="Earnings this week"
                    icon={CalendarRange}
                    gradient="from-emerald-500 to-teal-600"
                    size="md"
                    trend={{ value: `${isWeekGrowth ? '+' : ''}${weekOverWeekPercent}%`, positive: isWeekGrowth }}
                    trendLabel="vs last week"
                    delay={0.2}
                  />
                  <DesktopStatCard
                    label="This Month"
                    value={`KES ${mtdRevenue.toLocaleString()}`}
                    subtext="Earnings this month"
                    icon={TrendingUp}
                    gradient="from-amber-500 to-orange-600"
                    size="md"
                    trend={{ value: `${isPositiveGrowth ? '+' : ''}${monthOverMonthPercent}%`, positive: isPositiveGrowth }}
                    trendLabel="vs last month"
                    delay={0.3}
                  />

                  {/* ✅ PENDING CARD WITH CTA */}
                  <Link href="/dashboard/financials?tab=invoices" className="block h-full group">
                    <div className="h-full bg-surface rounded-2xl border border-surface-border shadow-card hover:shadow-card-hover hover:border-[var(--color-primary)]/40 transition-all duration-300 overflow-hidden relative h-[120px]">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
                      <div className="p-5 h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                              Pending Payments
                            </p>
                            <p className="text-xl font-bold text-ink tracking-tight font-display truncate">
                              KES {pendingPayments.toLocaleString()}
                            </p>
                            <p className="text-xs text-ink-subtle truncate">Awaiting collection</p>
                          </div>
                          <div className="rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity w-10 h-10">
                            <AlertCircle size={16} className="text-white" />
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-1 h-4">
                          <span className="text-[10px] font-bold text-[var(--color-primary)] flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                            View Invoices <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {showPlatformFee && (
                    <DesktopStatCard
                      label="Platform Fee"
                      value={`KES ${parseFloat(commission.today_total).toLocaleString()}`}
                      subtext={`From ${commission.today_count} trip${commission.today_count !== 1 ? 's' : ''} today`}
                      icon={Wallet}
                      gradient="from-blue-500 to-indigo-600"
                      size="md"
                      delay={0.5}
                    />
                  )}
                </div>

                {commission && parseFloat(commission.outstanding_balance) > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-between p-4 rounded-2xl bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                        <DollarSign size={16} className="text-warning-text" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink">Outstanding Balance</p>
                        <p className="text-sm font-bold text-warning-text">KES {parseFloat(commission.outstanding_balance).toLocaleString()}</p>
                      </div>
                    </div>
                    <Link href="/commission/pay" className="flex items-center gap-1 px-4 py-2 rounded-lg bg-warning text-white text-xs font-bold hover:bg-warning-hover transition-all">
                      Pay Now<ArrowUpRight size={14} />
                    </Link>
                  </motion.div>
                )}

                <div className="grid lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2"><ActionCenterWidget /></div>
                  <div className="space-y-6">
                    <DesktopAlerts alerts={alerts} />
                    <RecentActivityWidget />
                    <DesktopFleetStatus vehicles={vehicles} />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {!isMobile && activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <FleetCalendar />
          </motion.div>
        )}

        {!isMobile && activeTab === "reports" && (
          <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="bg-surface border border-surface-border shadow-card rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"><BarChart3 size={32} className="text-primary" /></div>
              <h3 className="text-lg font-bold text-ink font-display mb-2">Reports & Analytics</h3>
              <p className="text-sm text-ink-muted max-w-md">Deep dive into your revenue, fleet utilization, and client retention metrics. This module is currently under development.</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-ink-subtle"><Zap size={14} className="text-primary" />Coming soon</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

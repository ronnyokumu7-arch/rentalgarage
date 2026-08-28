// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Activity, BarChart3, DollarSign, ArrowUpRight, Zap,
  Landmark, TrendingUp, AlertCircle, Wallet,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { useDashboardStats } from "@/hooks/dashboard/useDashboardStats";
import ActionCenterWidget from "@/components/dashboard/ActionCenterWidget";
import RecentActivityWidget from "@/components/dashboard/RecentActivityWidget";
import FleetCalendar from "@/components/calendar/FleetCalendar";
import SoftLockBanner from "@/components/dashboard/SoftLockBanner";
import DesktopStatCard from "@/components/dashboard/DesktopStatCard";
import MobileStatsCarousel from "@/components/dashboard/MobileStatsCarousel";
import {
  MobileHeroEarnings, MobileAlerts, MobileFleetStatus,
} from "@/components/dashboard/MobileDashboardCards";
import { DesktopFleetStatus, DesktopAlerts } from "@/components/dashboard/DesktopSidePanels";

// ✅ REUSABLE: Premium Sliding Tab Switcher
function PremiumTabSwitcher({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; top: number; height: number } | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        const containerRect = activeEl.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setIndicatorStyle({ left: rect.left - containerRect.left, width: rect.width, top: rect.top - containerRect.top, height: rect.height });
        }
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="relative w-full sm:w-auto">
      {indicatorStyle && (
        <div className="absolute z-0 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width, top: indicatorStyle.top, height: indicatorStyle.height }} />
      )}
      <div className="relative z-10 flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-hide snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "activity", label: "Bookings Calendar", icon: Activity },
          { id: "reports", label: "Analytics", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} ref={(el) => { tabRefs.current[tab.id] = el; }} type="button" onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap touch-manipulation cursor-pointer snap-center flex-shrink-0 ${
                isActive ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]/50"
              }`}>
              <Icon size={isActive ? 16 : 14} className={`transition-all duration-300 ${isActive ? "text-[var(--color-primary)]" : "opacity-70"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-surface-border)]/50 -z-10" />
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);
  const { loading, stats, alerts, vehicles, commission, mtdRevenue, lastMonthRevenue, monthOverMonthPercent, isPositiveGrowth } = useDashboardStats();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const currentTabInfo = {
    overview: { title: "Dashboard", description: "Real-time overview", icon: <LayoutDashboard size={isMobile ? 17 : 19} /> },
    activity: { title: "Bookings Calendar", description: "Visual overview of all upcoming and active rentals", icon: <Activity size={isMobile ? 17 : 19} /> },
    reports: { title: "Analytics", description: "Deep insights into your business performance", icon: <BarChart3 size={isMobile ? 17 : 19} /> },
  }[activeTab as "overview" | "activity" | "reports"];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{currentTabInfo?.icon}</div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-ink font-display tracking-tight">{currentTabInfo?.title}</h1>
            <p className="text-xs text-ink-muted hidden sm:block">{currentTabInfo?.description}</p>
          </div>
        </div>
        
        {/* ✅ HIDE TABS ON MOBILE */}
        <div className="hidden lg:block">
          <PremiumTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
            {commission && <SoftLockBanner outstandingBalance={commission.outstanding_balance} daysUntilLock={commission.days_until_lock} />}

            {isMobile ? (
              <div className="space-y-3">
                {/* Hero + Stats */}
                <MobileHeroEarnings value={`KES ${(stats.totalRevenue || 0).toLocaleString()}`} change={{ value: `${isPositiveGrowth ? '+' : ''}${monthOverMonthPercent}%`, positive: isPositiveGrowth }} />
                <MobileStatsCarousel mtdRevenue={mtdRevenue} lastMonthRevenue={lastMonthRevenue} monthOverMonthPercent={monthOverMonthPercent} isPositiveGrowth={isPositiveGrowth} pendingPayments={stats.pendingPayments || 0} commission={commission} />
                
                {commission && parseFloat(commission.outstanding_balance) > 0 && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30">
                    <div><p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Outstanding Balance</p><p className="text-sm font-bold text-amber-800 dark:text-amber-300">KES {parseFloat(commission.outstanding_balance).toLocaleString()}</p></div>
                    <Link href="/commission/pay" className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors">Pay<ArrowUpRight size={12} /></Link>
                  </div>
                )}

                {/* ✅ Mobile Order: Alerts -> Recent Activity -> Action Center -> Fleet Status */}
                <MobileAlerts alerts={alerts} />
                <RecentActivityWidget />
                <ActionCenterWidget />
                <MobileFleetStatus vehicles={vehicles} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <DesktopStatCard label="Total Revenue" value={`KES ${(stats.totalRevenue || 0).toLocaleString()}`} subtext="Lifetime earnings" icon={Landmark} gradient="from-emerald-500 to-teal-600" delay={0.1} />
                  <DesktopStatCard label="This Month" value={`KES ${mtdRevenue.toLocaleString()}`} subtext={`Last month: KES ${lastMonthRevenue.toLocaleString()}`} icon={TrendingUp} gradient="from-amber-500 to-orange-600" trend={{ value: `${isPositiveGrowth ? '+' : ''}${monthOverMonthPercent}%`, positive: isPositiveGrowth }} delay={0.2} />
                  <DesktopStatCard label="Pending Payments" value={`KES ${(stats.pendingPayments || 0).toLocaleString()}`} subtext="Awaiting collection" icon={AlertCircle} gradient="from-rose-500 to-red-600" delay={0.3} />
                  <DesktopStatCard label="Platform Fee" value={commission ? `KES ${parseFloat(commission.today_total).toLocaleString()}` : "—"} subtext={commission ? `From ${commission.today_count} trip${commission.today_count !== 1 ? 's' : ''} today` : "Loading..."} icon={Wallet} gradient="from-blue-500 to-indigo-600" delay={0.4} />
                </div>

                {commission && parseFloat(commission.outstanding_balance) > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-between p-4 rounded-2xl bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center"><DollarSign size={16} className="text-warning-text" /></div>
                      <div><p className="text-xs font-semibold text-ink">Outstanding Balance</p><p className="text-sm font-bold text-warning-text">KES {parseFloat(commission.outstanding_balance).toLocaleString()}</p></div>
                    </div>
                    <Link href="/commission/pay" className="flex items-center gap-1 px-4 py-2 rounded-lg bg-warning text-white text-xs font-bold hover:bg-warning-hover transition-all">Pay Now<ArrowUpRight size={14} /></Link>
                  </motion.div>
                )}

                {/* ✅ Desktop Main Content - items-start prevents stretching */}
                <div className="grid lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2"><ActionCenterWidget /></div>
                  <div className="space-y-6">
                    {/* ✅ REORDERED: Needs Attention FIRST, then Activity, then Fleet Status */}
                    <DesktopAlerts alerts={alerts} />
                    <RecentActivityWidget />
                    <DesktopFleetStatus vehicles={vehicles} />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <FleetCalendar />
          </motion.div>
        )}

        {activeTab === "reports" && (
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

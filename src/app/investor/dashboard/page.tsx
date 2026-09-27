"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Activity, CarFront, Wallet, Landmark, TrendingUp, Gauge, CalendarRange, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import DesktopStatCard from "@/components/dashboard/DesktopStatCard";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import { MobileHeroEarnings } from "@/components/dashboard/MobileDashboardCards";
import MobileInvestorStatsCarousel from "@/components/investor/MobileInvestorStatsCarousel";

const useInvestorStats = () => {
  return {
    loading: false,
    stats: {
      totalVehicles: 4,
      activeLeases: 3,
      totalEarnings: 145000,
      pendingPayout: 32500,
    },
    recentEarnings: [
      { id: 1, vehicle: "KBA 123X", type: "Revenue Share", amount: 15000, date: "Oct 24, 2023", status: "Cleared" },
      { id: 2, vehicle: "KBC 456Y", type: "Revenue Share", amount: 12500, date: "Oct 22, 2023", status: "Pending" },
      { id: 3, vehicle: "KBA 123X", type: "Maintenance Deduction", amount: -4500, date: "Oct 20, 2023", status: "Cleared" },
    ],
    fleetStatus: [
      { id: 101, plate: "KBA 123X", model: "Toyota Axio", status: "rented", mileage: 45000 },
      { id: 102, plate: "KBC 456Y", model: "Subaru Impreza", status: "available", mileage: 32000 },
      { id: 103, plate: "KBD 789Z", model: "Mazda Demio", status: "maintenance", mileage: 51000 },
      { id: 104, plate: "KBE 012A", model: "Nissan Note", status: "available", mileage: 28000 },
    ]
  };
};

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "activity", label: "Fleet Calendar", icon: Activity },
];

// ✅ Investor-specific status tokens → design system utilities
const earningStatusClass: Record<string, string> = {
  Cleared: "bg-status-confirmed text-status-confirmed",
  Pending: "bg-status-pending text-status-pending",
};

const fleetStatusClass: Record<string, string> = {
  rented: "bg-status-active text-status-active",
  available: "bg-status-confirmed text-status-confirmed",
  maintenance: "bg-status-pending text-status-pending",
};

export default function InvestorDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);
  const { loading, stats, recentEarnings, fleetStatus } = useInvestorStats();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setActiveTab("overview");
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const currentTabInfo = {
    overview: {
      title: "Investor Dashboard",
      description: "Real-time overview of your fleet performance and earnings",
      icon: <Gauge size={28} strokeWidth={1.5} className="text-primary hidden sm:block" />
    },
    activity: {
      title: "Fleet Calendar",
      description: "Visual overview of your vehicles' booking schedules",
      icon: <CalendarRange size={28} strokeWidth={1.5} className="text-primary hidden sm:block" />
    },
  }[activeTab as "overview" | "activity"];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
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

            {isMobile ? (
              <div className="space-y-3">
                {/* ✅ Hero — Total Earnings, reusing tenant's MobileHeroEarnings */}
                <MobileHeroEarnings
                  value={`KES ${stats.totalEarnings.toLocaleString()}`}
                />

                {/* ✅ Carousel — Pending / Vehicles / Active Leases */}
                <MobileInvestorStatsCarousel
                  totalVehicles={stats.totalVehicles}
                  activeLeases={stats.activeLeases}
                  pendingPayout={stats.pendingPayout}
                />

                {/* ✅ Recent Earnings — tenant mobile card shell, design-system utilities */}
                <div className="bg-surface rounded-xl border border-surface-border shadow-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wider">
                      Recent Earnings
                    </p>
                    <Link
                      href="/investor/earnings"
                      className="text-[10px] font-semibold text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {recentEarnings.map((earning) => (
                      <div
                        key={earning.id}
                        className="flex items-center justify-between py-2 border-b border-surface-border last:border-0"
                      >
                        <div>
                          <p className="text-xs font-bold text-ink">
                            {earning.vehicle}
                          </p>
                          <p className="text-[10px] text-ink-muted">
                            {earning.type} • {earning.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-xs font-bold ${
                              earning.amount < 0 ? "text-status-cancelled" : "text-ink"
                            }`}
                          >
                            {earning.amount < 0 ? "-" : ""}KES{" "}
                            {Math.abs(earning.amount).toLocaleString()}
                          </p>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              earningStatusClass[earning.status] ?? "bg-status-completed text-status-completed"
                            }`}
                          >
                            {earning.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ✅ My Fleet — tenant mobile card shell, design-system utilities */}
                <div className="bg-surface rounded-xl border border-surface-border shadow-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wider">
                      My Fleet
                    </p>
                    <Link
                      href="/investor/fleet"
                      className="text-[10px] font-semibold text-primary hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {fleetStatus.slice(0, 3).map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CarFront
                            size={14}
                            className="text-ink-muted"
                          />
                          <span className="font-medium text-ink">
                            {v.plate}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            fleetStatusClass[v.status] ?? "bg-status-completed text-status-completed"
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <DesktopStatCard label="Total Vehicles" value={stats.totalVehicles.toString()} subtext="Listed in your portfolio" icon={CarFront} gradient="from-blue-500 to-indigo-600" delay={0.1} />
                  <DesktopStatCard label="Active Leases" value={stats.activeLeases.toString()} subtext="Currently generating revenue" icon={TrendingUp} gradient="from-emerald-500 to-teal-600" delay={0.2} />
                  <DesktopStatCard label="Total Earnings" value={`KES ${stats.totalEarnings.toLocaleString()}`} subtext="Lifetime revenue share" icon={Landmark} gradient="from-purple-500 to-violet-600" delay={0.3} />
                  <DesktopStatCard label="Pending Payout" value={`KES ${stats.pendingPayout.toLocaleString()}`} subtext="Next payout cycle" icon={Wallet} gradient="from-amber-500 to-orange-600" delay={0.4} />
                </div>

                <div className="grid lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2 bg-surface border border-surface-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-surface-border flex items-center justify-between">
                      <h3 className="text-sm font-bold text-ink">Recent Earnings & Deductions</h3>
                      <Link href="/investor/earnings" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                        View Ledger <ArrowUpRight size={14} />
                      </Link>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-surface-hover text-ink-muted font-medium text-[10px] uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Vehicle</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-border">
                          {recentEarnings.map((earning) => (
                            <tr key={earning.id} className="hover:bg-surface-hover/50 transition-colors">
                              <td className="px-4 py-3 font-medium text-ink">{earning.vehicle}</td>
                              <td className="px-4 py-3 text-ink-muted">{earning.type}</td>
                              <td className="px-4 py-3 text-ink-muted">{earning.date}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  earningStatusClass[earning.status] ?? "bg-status-completed text-status-completed"
                                }`}>
                                  {earning.status}
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-right font-semibold ${earning.amount < 0 ? "text-status-cancelled" : "text-ink"}`}>
                                {earning.amount < 0 ? '-' : ''}KES {Math.abs(earning.amount).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-surface border border-surface-border rounded-2xl p-4">
                      <h3 className="text-sm font-bold text-ink mb-3">Quick Actions</h3>
                      <div className="space-y-2">
                        <Link href="/investor/fleet?add=true" className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CarFront size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-ink">Add New Vehicle</p>
                            <p className="text-[10px] text-ink-muted">List a car for leasing</p>
                          </div>
                        </Link>
                        <Link href="/investor/settings" className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all group">
                          <div className="w-8 h-8 rounded-lg bg-status-confirmed text-status-confirmed flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Wallet size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-ink">Update Payout Details</p>
                            <p className="text-[10px] text-ink-muted">M-Pesa or Bank info</p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    <div className="bg-surface border border-surface-border rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-ink">Fleet Status</h3>
                        <Link href="/investor/fleet" className="text-[10px] font-semibold text-primary hover:underline">View All</Link>
                      </div>
                      <div className="space-y-3">
                        {fleetStatus.map((v) => (
                          <div key={v.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <CarFront size={14} className="text-ink-muted" />
                              <div>
                                <p className="font-medium text-ink">{v.plate}</p>
                                <p className="text-[10px] text-ink-muted">{v.model}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              fleetStatusClass[v.status] ?? "bg-status-completed text-status-completed"
                            }`}>
                              {v.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {!isMobile && activeTab === "activity" && (
          <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="bg-surface border border-surface-border shadow-sm rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <CalendarRange size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-ink font-display mb-2">Fleet Calendar</h3>
              <p className="text-sm text-ink-muted max-w-md">
                Visualize your vehicles' booking schedules, maintenance windows, and lease periods in one unified timeline.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-ink-subtle">
                <span>Coming soon</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

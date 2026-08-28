// src/app/dashboard/financials/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Receipt,
  DollarSign,
  LayoutDashboard,
} from "lucide-react";

import InvoicesTab from "@/components/financials/InvoicesTab";
import ContractsTab from "@/components/financials/ContractsTab";
import PaymentsTab from "@/components/financials/PaymentsTab";
import OverviewTab from "@/components/financials/OverviewTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "payments", label: "Payments", icon: DollarSign },
];

// Quick stats for each tab
const TAB_STATS: Record<string, { label: string; value: string; change: string; positive: boolean }[]> = {
  overview: [
    { label: "Total Revenue", value: "KES 48,000", change: "+12.5%", positive: true },
    { label: "Pending Invoices", value: "KES 72,000", change: "-8.3%", positive: false },
    { label: "Active Contracts", value: "12", change: "+3", positive: true },
  ],
  invoices: [
    { label: "Total Invoices", value: "24", change: "+4", positive: true },
    { label: "Paid", value: "16", change: "+2", positive: true },
    { label: "Overdue", value: "3", change: "-1", positive: true },
  ],
  contracts: [
    { label: "Active", value: "12", change: "+3", positive: true },
    { label: "Pending Signature", value: "4", change: "-2", positive: true },
    { label: "Expiring Soon", value: "2", change: "+1", positive: false },
  ],
  payments: [
    { label: "This Month", value: "KES 32,000", change: "+8.2%", positive: true },
    { label: "Pending", value: "KES 16,000", change: "-5.1%", positive: true },
    { label: "Failed", value: "KES 2,000", change: "-2", positive: true },
  ],
};

// ✅ REUSABLE: Premium Sliding Tab Switcher (Matches all other pages)
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
          setIndicatorStyle({
            left: rect.left - containerRect.left,
            width: rect.width,
            top: rect.top - containerRect.top,
            height: rect.height,
          });
        }
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="relative w-full sm:w-auto">
      {/* Sliding Indicator Pill */}
      {indicatorStyle && (
        <div
          className="absolute z-0 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

      {/* Tab Container - No Scrollbar, Snap Centering */}
      <div 
        className="relative z-10 flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-hide snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 
                whitespace-nowrap touch-manipulation cursor-pointer snap-center flex-shrink-0
                ${isActive 
                  ? "text-[var(--color-ink)]" 
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]/50"
                }
              `}
            >
              <Icon size={isActive ? 16 : 14} className={`transition-all duration-300 ${isActive ? "text-[var(--color-primary)]" : "opacity-70"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Subtle bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-surface-border)]/50 -z-10" />
    </div>
  );
}

export default function FinancialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/dashboard/financials?tab=${tabId}`, { scroll: false });
  };

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];
  const currentStats = TAB_STATS[activeTab] || TAB_STATS.overview;

  return (
    <div className="space-y-6 antialiased">
      
      {/* Premium Header - Clean & Minimal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
              <currentTab.icon size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-2">
                Financials
                <span className="text-xs font-medium text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] px-2 py-0.5 rounded-full border border-[var(--color-surface-border)]">
                  {currentTab.label}
                </span>
              </h1>
              <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">
                {activeTab === "overview" && "Complete financial health at a glance"}
                {activeTab === "invoices" && "Create, send, and track all invoices"}
                {activeTab === "contracts" && "Manage your rental contracts seamlessly"}
                {activeTab === "payments" && "Monitor and reconcile incoming payments"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Desktop Only */}
        <div className="hidden lg:flex items-center gap-6">
          {currentStats.map((stat, index) => (
            <div key={index} className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">{stat.label}</p>
              <p className="text-base font-extrabold text-[var(--color-ink)] tabular-nums">{stat.value}</p>
              <p className={`text-[10px] font-bold ${stat.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Premium Sliding Tab Switcher */}
      <PremiumTabSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Tab Content Area */}
      <div className="animate-in fade-in duration-200 min-h-[400px] pt-2">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "invoices" && <InvoicesTab />}
        {activeTab === "contracts" && <ContractsTab />}
        {activeTab === "payments" && <PaymentsTab />}
      </div>
    </div>
  );
}

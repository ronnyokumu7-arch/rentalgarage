// src/app/dashboard/financials/page.tsx
"use client";

import { useState, useEffect } from "react";
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
  { 
    id: "overview", 
    label: "Overview", 
    icon: LayoutDashboard,
    color: "from-blue-500/20 to-indigo-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  { 
    id: "invoices", 
    label: "Invoices", 
    icon: Receipt,
    color: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  { 
    id: "contracts", 
    label: "Contracts", 
    icon: FileText,
    color: "from-violet-500/20 to-purple-500/10",
    borderColor: "border-violet-500/20",
    textColor: "text-violet-600 dark:text-violet-400",
  },
  { 
    id: "payments", 
    label: "Payments", 
    icon: DollarSign,
    color: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-600 dark:text-amber-400",
  },
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
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${currentTab.color} border ${currentTab.borderColor} flex items-center justify-center ${currentTab.textColor} flex-shrink-0`}>
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">{stat.label}</p>
              <p className="text-base font-extrabold text-[var(--color-ink)] tabular-nums">{stat.value}</p>
              <p className={`text-[9px] font-bold ${stat.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Tab Navigation - No Restraining Container */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 
                whitespace-nowrap touch-manipulation cursor-pointer flex-shrink-0
                ${isActive 
                  ? `bg-gradient-to-br ${tab.color} text-[var(--color-ink)] shadow-sm border ${tab.borderColor}` 
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]/50"
                }
              `}
            >
              <Icon size={isActive ? 16 : 14} className={`transition-all duration-300 ${isActive ? tab.textColor : ""}`} />
              <span>{tab.label}</span>
              
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="animate-in fade-in duration-200 min-h-[400px]">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "invoices" && <InvoicesTab />}
        {activeTab === "contracts" && <ContractsTab />}
        {activeTab === "payments" && <PaymentsTab />}
      </div>
    </div>
  );
}

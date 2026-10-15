// src/app/dashboard/financials/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Receipt,
  DollarSign,
  LayoutDashboard,
  PiggyBank,
  FilePlus2,
  FileSignature,
  Banknote,
} from "lucide-react";

import InvoicesTab from "@/components/financials/InvoicesTab";
import ContractsTab from "@/components/financials/ContractsTab";
import PaymentsTab from "@/components/financials/PaymentsTab";
import OverviewTab from "@/components/financials/OverviewTab";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import MobileFloatingSegment from "@/components/ui/MobileFloatingSegment";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "payments", label: "Payments", icon: DollarSign },
];

// ✅ Mobile only exposes Overview + Payments. Invoices/Contracts stay desktop-only.
const MOBILE_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
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
  }, [searchParams, activeTab]);

  // ✅ Guard: Invoices + Contracts are desktop-only — reset if mobile
  useEffect(() => {
    const checkMobile = () => {
      if (
        window.innerWidth < 768 &&
        activeTab !== "overview" &&
        activeTab !== "payments"
      ) {
        setActiveTab("overview");
        // Also clean the URL so refresh lands correctly
        router.replace(`/dashboard/financials?tab=overview`, { scroll: false });
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/dashboard/financials?tab=${tabId}`, { scroll: false });
  };

  const currentStats = TAB_STATS[activeTab] || TAB_STATS.overview;

  // ✅ Dynamic Header Info (PREMIUM: No circles, just clean bare icons)
  const currentTabInfo = {
    overview: {
      title: "Financials",
      description: "Complete financial health at a glance",
      icon: <PiggyBank size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    invoices: {
      title: "Invoices",
      description: "Create, send, and track all invoices",
      icon: <FilePlus2 size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    contracts: {
      title: "Contracts",
      description: "Manage your rental contracts seamlessly",
      icon: <FileSignature size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    payments: {
      title: "Payments",
      description: "Monitor and reconcile incoming payments",
      icon: <Banknote size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
  }[activeTab] || {
    title: "Financials",
    description: "Complete financial health at a glance",
    icon: <PiggyBank size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
  };

  return (
    <div className="space-y-6 antialiased">

      {/* Premium Header - Clean & Minimal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {/* ✅ Bare Icon — hidden on mobile, visible from sm: up */}
            <span className="hidden sm:inline-flex">{currentTabInfo.icon}</span>

            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              {currentTabInfo.title}
            </h1>
          </div>
          {/* ✅ Subheading aligns to icon's left edge */}
          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
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

      {/* ✅ DESKTOP ONLY — mobile uses the floating switcher */}
      <div className="hidden md:block">
        <PremiumTabSwitcher
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Tab Content Area */}
      <div className="animate-in fade-in duration-200 min-h-[400px] pt-2">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "invoices" && (
          <div className="hidden md:block">
            <InvoicesTab />
          </div>
        )}
        {activeTab === "contracts" && (
          <div className="hidden md:block">
            <ContractsTab />
          </div>
        )}
      </div>

      {/* ✅ FLOATING SEGMENT TOGGLE — mobile only, Overview ↔ Payments */}
      <MobileFloatingSegment
        segments={MOBILE_TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
        active={activeTab}
        onChange={(id) => handleTabChange(id)}
        toggleTarget={activeTab === "payments" ? "overview" : "payments"}
        triggerIcon={activeTab === "payments" ? LayoutDashboard : Banknote}
      />
    </div>
  );
}

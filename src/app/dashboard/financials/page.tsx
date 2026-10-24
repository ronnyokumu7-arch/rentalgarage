// src/app/dashboard/financials/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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
import { useSetPageHeader } from "@/context/page-header-context";

/* ─────────────────────────────────────────────────────────────────────
   Config
────────────────────────────────────────────────────────────────────── */

type TabId = "overview" | "invoices" | "contracts" | "payments";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "payments", label: "Payments", icon: DollarSign },
];

const MOBILE_TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "payments", label: "Payments", icon: DollarSign },
];

const VALID_TABS = new Set<TabId>(["overview", "invoices", "contracts", "payments"]);

const TAB_STATS: Record<TabId, { label: string; value: string; change: string; positive: boolean }[]> = {
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

/* ──────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────── */

export default function FinancialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab: TabId = (() => {
    const t = searchParams.get("tab") as TabId | null;
    return t && VALID_TABS.has(t) ? t : "overview";
  })();

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab") as TabId | null;
    if (t && VALID_TABS.has(t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId: string) => {
    if (!VALID_TABS.has(tabId as TabId)) return;
    const next = tabId as TabId;
    if (next === activeTab) return;
    setActiveTab(next);
    router.push(`/dashboard/financials?tab=${next}`, { scroll: false });
  };

  const currentStats = useMemo(
    () => TAB_STATS[activeTab] ?? TAB_STATS.overview,
    [activeTab],
  );

  const currentTabInfo = useMemo(
    () =>
      ({
        overview: {
          title: "Financials",
          mobileTitle: "Financials",
          description: "Complete financial health at a glance",
          icon: <PiggyBank size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
        },
        invoices: {
          title: "Invoices",
          mobileTitle: "Invoices",
          description: "Create, send, and track all invoices",
          icon: <FilePlus2 size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
        },
        contracts: {
          title: "Contracts",
          mobileTitle: "Contracts",
          description: "Manage your rental contracts seamlessly",
          icon: <FileSignature size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
        },
        payments: {
          title: "Payments",
          mobileTitle: "Payments",
          description: "Monitor and reconcile incoming payments",
          icon: <Banknote size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
        },
      })[activeTab],
    [activeTab],
  );

  // ✅ Drive the mobile top bar (like Fleet page)
  useSetPageHeader(currentTabInfo.mobileTitle, currentTabInfo.description);

  const isOnMobileTab = MOBILE_TABS.some((t) => t.id === activeTab);
  const floatingActive = isOnMobileTab ? activeTab : "overview";
  const floatingToggleTarget: TabId =
    activeTab === "payments" ? "overview" : "payments";
  const FloatingTriggerIcon =
    activeTab === "payments" ? LayoutDashboard : Banknote;

  return (
    <div className="space-y-6 antialiased">
      {/* ── Header — Desktop only (mobile uses TopBar) ───────────── */}
      <div className="hidden sm:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">{currentTabInfo.icon}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              {currentTabInfo.title}
            </h1>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* Quick stats — desktop only */}
        <div className="hidden lg:flex items-center gap-6">
          {currentStats.map((stat, index) => (
            <div key={index} className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                {stat.label}
              </p>
              <p className="text-base font-extrabold text-[var(--color-ink)] tabular-nums">
                {stat.value}
              </p>
              <p
                className={`text-[10px] font-bold ${
                  stat.positive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {stat.change}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Desktop tab switcher ───────────────────────────────── */}
      <div className="hidden md:block">
        <PremiumTabSwitcher
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* ─── Tab content ─────────────────────────────────────────── */}
      {/* ✅ FIX: pt-0 on mobile eliminates the gap between TopBar and sticky toolbar */}
      <div className="animate-in fade-in duration-200 min-h-[400px] pt-0 sm:pt-2">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "invoices" && <InvoicesTab />}
        {activeTab === "contracts" && <ContractsTab />}
      </div>

      {/* ─── Floating segment — mobile only ─────────────────────── */}
      <div
        data-fab-stack
        className="lg:hidden fixed right-4 bottom-[108px] z-[65] pointer-events-none transition-all duration-200"
      >
        <div className="pointer-events-auto">
          <MobileFloatingSegment
            segments={MOBILE_TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
            active={floatingActive}
            onChange={(id) => handleTabChange(id)}
            toggleTarget={floatingToggleTarget}
            triggerIcon={FloatingTriggerIcon}
          />
        </div>
      </div>
    </div>
  );
}

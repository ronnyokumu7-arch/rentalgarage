// src/app/dashboard/financials/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText,
  Receipt,
  CurrencyDollar as DollarSign,
  SquaresFour as LayoutDashboard,
  PiggyBank,
  FilePlus as FilePlus2,
  Signature as FileSignature,
  Money as Banknote,
} from "@phosphor-icons/react/ssr";

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

  const currentTabInfo = useMemo(
    () =>
      ({
        overview: {
          title: "Financials",
          mobileTitle: "Financials",
          description: "Complete financial health at a glance",
          icon: <PiggyBank size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
        },
        invoices: {
          title: "Invoices",
          mobileTitle: "Invoices",
          description: "Create, send, and track all invoices",
          icon: <FilePlus2 size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
        },
        contracts: {
          title: "Contracts",
          mobileTitle: "Contracts",
          description: "Manage your rental contracts seamlessly",
          icon: <FileSignature size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
        },
        payments: {
          title: "Payments",
          mobileTitle: "Payments",
          description: "Monitor and reconcile incoming payments",
          icon: <Banknote size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
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
      {/* ── Header — Desktop only (mobile uses TopBar) ─────────────
          ✅ FIXED: aligned to the standard pattern (Bookings/Fleet/Clients).
          Title block on the left, PremiumTabSwitcher parked in the right slot.
          The redundant top-right stats block was removed (Overview already
          renders these numbers in its own card). */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
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

        <div className="hidden md:block">
          <PremiumTabSwitcher
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
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

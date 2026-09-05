// src/app/super-admin/agencies/page.tsx
"use client";

import { useState } from "react";
import { useTenantsList } from "@/hooks/tenants/useTenantsList";
import { TenantsTable } from "@/components/tenants/TenantsTable";
import TenantSubscriptionVerification from "@/components/admin/TenantSubscriptionVerification";
import CommissionPaymentVerification from "@/components/admin/CommissionPaymentVerification";
import { Building2, Wallet, ShieldCheck } from "lucide-react";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

type HubTab = "directory" | "subscriptions" | "commission";

const TABS = [
  { id: "directory", label: "Directory", icon: Building2 },
  { id: "subscriptions", label: "Subscriptions", icon: ShieldCheck },
  { id: "commission", label: "Commission", icon: Wallet },
];

export default function SuperAdminAgenciesPage() {
  const listProps = useTenantsList();
  const [activeTab, setActiveTab] = useState<HubTab>("directory");

  // ✅ Dynamic Header Info (Same pattern as Dashboard)
  const currentTabInfo = {
    directory: {
      title: "Agency Directory",
      description: "Manage tenant directory and oversee registered agencies.",
      icon: <Building2 size={20} />,
    },
    subscriptions: {
      title: "Subscription Approvals",
      description: "Review and verify agency subscription plans and renewals.",
      icon: <ShieldCheck size={20} />,
    },
    commission: {
      title: "Commission Verification",
      description: "Audit and verify commission payments from agency operations.",
      icon: <Wallet size={20} />,
    },
  }[activeTab];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* ✅ HERO HEADER & TAB SWITCHER - Matches Dashboard Design DNA */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
            {currentTabInfo.icon}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--color-ink)] font-display tracking-tight">
              {currentTabInfo.title}
            </h1>
            <p className="text-xs text-[var(--color-ink-muted)] hidden sm:block">
              {currentTabInfo.description}
            </p>
          </div>
        </div>

        {/* ✅ Imported Reusable Premium Tab Switcher - Optimized for Mobile & Desktop */}
        <PremiumTabSwitcher 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={(tabId) => setActiveTab(tabId as HubTab)} 
        />
      </div>

      {/* ✅ MAIN CONTENT - Fills remaining space without heavy borders */}
      <main className="space-y-6">
        {activeTab === "directory" && <TenantsTable {...listProps} />}
        {activeTab === "subscriptions" && <TenantSubscriptionVerification />}
        {activeTab === "commission" && <CommissionPaymentVerification />}
      </main>
    </div>
  );
}

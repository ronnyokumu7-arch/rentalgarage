// src/app/super-admin/settings/page.tsx
"use client";

import { useState } from "react";
import {
  Building2, ShieldCheck, Palette, Bell,
  ChevronRight, ChevronLeft, Globe, Lock, Users,
  Wallet, Landmark, Activity,
} from "lucide-react";
import PlatformCommissionSettings from "@/components/admin/PlatformCommissionSettings";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

type TabId = "platform" | "revenue" | "access";

interface SettingModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  theme: string;
  badge?: string;
  tab: TabId;
}

const TABS = [
  { id: "platform", label: "Platform", icon: Globe },
  { id: "revenue", label: "Revenue", icon: Landmark },
  { id: "access", label: "Access & Audit", icon: ShieldCheck },
];

const SETTINGS_MODULES: SettingModule[] = [
  // ── Platform ──────────────────────────────────────────────
  { id: "platform-profile", title: "Platform Profile", description: "Platform name, logo, and official contact information shown to all tenants.", icon: Building2, theme: "blue", tab: "platform" },
  { id: "appearance", title: "Appearance", description: "Global branding defaults and display preferences for the whole platform.", icon: Palette, theme: "purple", tab: "platform" },
  { id: "notifications", title: "Notifications", description: "Platform email templates: welcome, suspension, and grace-period warnings.", icon: Bell, theme: "amber", tab: "platform" },

  // ── Revenue ───────────────────────────────────────────────
  { id: "commission", title: "Commission Settings", description: "PAYG commission amount, grace period, and the M-Pesa Paybill tenants pay to.", icon: Wallet, theme: "emerald", tab: "revenue", badge: "Live" },
  { id: "payment-methods", title: "Platform Payment Methods", description: "Bank accounts and channels used to receive tenant payments.", icon: Landmark, theme: "blue", tab: "revenue" },

  // ── Access & Audit ────────────────────────────────────────
  { id: "super-admins", title: "Super Admin Users", description: "Invite, suspend, and revoke platform operator accounts.", icon: Users, theme: "blue", tab: "access" },
  { id: "authentication", title: "Authentication", description: "2FA and session policies for platform operators.", icon: Lock, theme: "rose", tab: "access" },
  { id: "audit", title: "Audit Logs", description: "Platform-wide activity trail: verifications, setting changes, logins.", icon: Activity, theme: "amber", tab: "access" },
];

const getThemeClasses = (theme: string) => {
  const themes: Record<string, { iconBg: string; iconText: string }> = {
    blue: { iconBg: "bg-[var(--color-primary-muted)]", iconText: "text-[var(--color-primary-text)]" },
    emerald: { iconBg: "bg-[var(--color-success-bg)]", iconText: "text-[var(--color-success-text)]" },
    purple: { iconBg: "bg-[var(--color-primary-muted)]", iconText: "text-[var(--color-primary-text)]" },
    amber: { iconBg: "bg-[var(--color-warning-bg)]", iconText: "text-[var(--color-warning-text)]" },
    rose: { iconBg: "bg-[var(--color-danger-bg)]", iconText: "text-[var(--color-danger-text)]" },
    slate: { iconBg: "bg-[var(--color-surface-hover)]", iconText: "text-[var(--color-ink-muted)]" },
  };
  return themes[theme] || themes.blue;
};

export default function SuperAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("platform");
  const [activeModule, setActiveModule] = useState<SettingModule | null>(null);

  const filteredModules = SETTINGS_MODULES.filter((m) => m.tab === activeTab);

  // ✅ Dynamic Header Info (Same pattern as Dashboard)
  const currentTabInfo = {
    platform: {
      title: "Platform Settings",
      description: "Configure how the platform operates, earns, and who controls it",
      icon: <Globe size={20} />,
    },
    revenue: {
      title: "Revenue Settings",
      description: "Configure commission, payment methods, and platform earnings",
      icon: <Landmark size={20} />,
    },
    access: {
      title: "Access & Audit",
      description: "Manage super admins, authentication, and platform-wide audit logs",
      icon: <ShieldCheck size={20} />,
    },
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* Premium Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {activeModule && (
            <button
              onClick={() => setActiveModule(null)}
              className="p-2.5 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all active:scale-95"
              title="Back to Settings Hub"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
              {!activeModule && (
                <div className="w-9 h-9 sm:w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                  {currentTabInfo.icon}
                </div>
              )}
              {activeModule ? activeModule.title : currentTabInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
              {activeModule
                ? activeModule.description
                : currentTabInfo.description}
            </p>
          </div>
        </div>

        {/* ✅ Imported Reusable Premium Tab Switcher */}
        {!activeModule && (
          <PremiumTabSwitcher 
            tabs={TABS} 
            activeTab={activeTab} 
            onTabChange={(tabId) => setActiveTab(tabId as TabId)} 
          />
        )}
      </div>

      {/* MAIN CONTENT AREA: Hub vs Workspace */}
      {!activeModule ? (
        // ── THE HUB: Grid of Modules ──
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
          {filteredModules.map((module) => {
            const Icon = module.icon;
            const theme = getThemeClasses(module.theme);
            return (
              <div
                key={module.id}
                onClick={() => setActiveModule(module)}
                className="group relative flex items-center gap-4 p-5 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] hover:border-[var(--color-primary)]/50 hover:shadow-[var(--shadow-lg)] transition-all duration-200 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.iconBg} ${theme.iconText} group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[var(--color-ink)] truncate">{module.title}</h3>
                    {module.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-success-bg)] text-[var(--color-success-text)]">
                        {module.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-0.5 line-clamp-2">{module.description}</p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
                />
              </div>
            );
          })}
        </div>
      ) : (
        // ── THE WORKSPACE: Individual Module View ──
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
          {/* ✅ DYNAMIC ROUTING: Commission Settings wired in step 7; others placeholder */}
          {activeModule.id === "commission" ? (
            <PlatformCommissionSettings />
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className={`w-16 h-16 rounded-2xl ${getThemeClasses(activeModule.theme).iconBg} flex items-center justify-center mb-4`}>
                <activeModule.icon size={32} className={getThemeClasses(activeModule.theme).iconText} />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">{activeModule.title} Workspace</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md mb-6">
                This module is currently under construction. Check back soon for updates!
              </p>
              <button
                onClick={() => setActiveModule(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all active:scale-95"
              >
                <ChevronLeft size={14} /> Back to Settings Hub
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

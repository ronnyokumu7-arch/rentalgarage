// src/app/dashboard/settings/page.tsx
"use client";

import { useState } from "react";
import {
  Building2, ShieldCheck, Palette, Bell, CreditCard,
  ChevronRight, ChevronLeft, Puzzle, Database, Key,
  Globe, Lock, BarChart3, UserCheck, Receipt, Landmark,
  HardDrive, Activity, Webhook, SlidersHorizontal, UserCog, Landmark as LandmarkIcon, ServerCog, ShieldHalf
} from "lucide-react";

import BusinessProfileSettings from "@/components/settings/BusinessProfileSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import TeamRolesSettings from "@/components/settings/TeamRolesSettings";
import UserManagementSettings from "@/components/settings/UserManagementSettings";
import BillingSubscriptionSettings from "@/components/settings/BillingSubscriptionSettings";
import PaymentMethodsSettings from "@/components/settings/PaymentMethodsSettings";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

type TabId = "general" | "team" | "financials" | "system" | "advanced";

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
  { id: "general", label: "General", icon: SlidersHorizontal },
  { id: "team", label: "Team & Access", icon: UserCog },
  { id: "financials", label: "Financials", icon: LandmarkIcon },
  { id: "system", label: "System", icon: ServerCog },
  { id: "advanced", label: "Advanced", icon: ShieldHalf },
];

const SETTINGS_MODULES: SettingModule[] = [
  // General
  { id: "business", title: "Business Profile", description: "Manage your agency details, logo, and official contact information.", icon: Building2, theme: "blue", tab: "general" },
  { id: "appearance", title: "Appearance", description: "Customize dashboard themes, regional formats, and display preferences.", icon: Palette, theme: "purple", tab: "general" },
  { id: "notifications", title: "Notifications", description: "Control email alerts, booking reminders, and system warnings.", icon: Bell, theme: "amber", tab: "general" },
  { id: "regional", title: "Regional Settings", description: "Set timezone, currency, date formats, and language preferences.", icon: Globe, theme: "emerald", tab: "general" },
  // Team
  { id: "roles", title: "Team & Roles", description: "Configure staff access, job titles, and granular permission matrices.", icon: ShieldCheck, theme: "emerald", tab: "team" },
  { id: "users", title: "User Management", description: "Invite, activate, suspend, and manage team member accounts.", icon: UserCheck, theme: "blue", tab: "team" },
  { id: "auth", title: "Authentication", description: "Configure 2FA, session timeouts, and password policies.", icon: Lock, theme: "rose", tab: "team" },
  // Financials
  { id: "billing", title: "Billing & Subscription", description: "Manage your subscription plan, payment methods, and invoices.", icon: CreditCard, theme: "rose", tab: "financials" },
  { id: "invoices", title: "Invoice Settings", description: "Configure invoice templates, tax rates, and payment terms.", icon: Receipt, theme: "blue", tab: "financials", badge: "New" },
  { id: "payments", title: "Payment Methods", description: "Add and manage accepted payment methods and gateways.", icon: Landmark, theme: "emerald", tab: "financials" },
  // System
  { id: "integrations", title: "Integrations", description: "Connect external APIs, webhooks, and third-party services.", icon: Puzzle, theme: "slate", tab: "system" },
  { id: "webhooks", title: "Webhooks", description: "Manage webhook endpoints and event subscriptions.", icon: Webhook, theme: "purple", tab: "system", badge: "Beta" },
  { id: "api-keys", title: "API Keys", description: "Generate and manage API keys for external integrations.", icon: Key, theme: "amber", tab: "system" },
  { id: "audit", title: "Audit Logs", description: "View system activity, user actions, and security events.", icon: Activity, theme: "blue", tab: "system" },
  // Advanced
  { id: "data", title: "Data Management", description: "Export, import, and manage your rental data and records.", icon: Database, theme: "blue", tab: "advanced" },
  { id: "backup", title: "Backup & Recovery", description: "Configure automatic backups and disaster recovery settings.", icon: HardDrive, theme: "emerald", tab: "advanced" },
  { id: "health", title: "System Health", description: "Monitor system performance, uptime, and resource usage.", icon: BarChart3, theme: "purple", tab: "advanced" },
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [activeModule, setActiveModule] = useState<SettingModule | null>(null);

  const filteredModules = SETTINGS_MODULES.filter((m) => m.tab === activeTab);

  // ✅ Dynamic Header Info (PREMIUM: No circles, just clean bare icons)
  const currentTabInfo = {
    general: {
      title: "General Settings",
      description: "Manage your agency configuration and system preferences",
      icon: <SlidersHorizontal size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    team: {
      title: "Team & Access",
      description: "Manage staff, roles, and authentication settings",
      icon: <UserCog size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    financials: {
      title: "Financial Settings",
      description: "Configure billing, invoices, and payment methods",
      icon: <LandmarkIcon size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    system: {
      title: "System Settings",
      description: "Manage integrations, API keys, and webhooks",
      icon: <ServerCog size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    advanced: {
      title: "Advanced Settings",
      description: "Data management, backups, and system health monitoring",
      icon: <ShieldHalf size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* Premium Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Back Button (Only shows when inside a module) */}
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
            <div className="flex items-center gap-3">
              {/* ✅ Bare Icon - No container */}
              {!activeModule && currentTabInfo.icon}
              
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                {activeModule ? activeModule.title : currentTabInfo.title}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
              {activeModule ? activeModule.description : currentTabInfo.description}
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
                {/* ✅ Keep the container HERE for grid cards, as it's an intentional design element */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.iconBg} ${theme.iconText} group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[var(--color-ink)] truncate">{module.title}</h3>
                    {module.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]">
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
          
          {/* ✅ DYNAMIC ROUTING: Render specific module components, or fallback placeholder */}
          {activeModule.id === "business" ? (
            <BusinessProfileSettings />
          ) : activeModule.id === "appearance" ? (
            <AppearanceSettings />
          ) : activeModule.id === "roles" ? (
            <TeamRolesSettings />
          ) : activeModule.id === "users" ? (
            <UserManagementSettings />
          ) : activeModule.id === "billing" ? (
            <BillingSubscriptionSettings />
          ) : activeModule.id === "payments" ? ( // ✅ NEW: Payment Methods Integration
            <PaymentMethodsSettings />
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

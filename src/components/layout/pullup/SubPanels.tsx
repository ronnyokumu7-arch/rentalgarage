// src/components/layout/pullup/SubPanels.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, SlidersHorizontal, UserCog,
  Landmark as LandmarkIcon, ServerCog, ShieldHalf, LayoutDashboard,
  FileText, FileSignature, Users, Building2, Palette, Bell, ScrollText, DollarSign,
} from "lucide-react";

export function ParentPanel({
  title, children, onBack,
}: {
  title: string; children: React.ReactNode; onBack: () => void;
}) {
  return (
    <div className="animate-in slide-in-from-right-8 fade-in duration-300 flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pb-4 border-b border-[var(--color-surface-border)] flex-shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-surface-active)] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-lg font-bold text-[var(--color-ink)]">{title}</h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">{children}</div>
    </div>
  );
}

export function SubPanelItem({
  icon: Icon, title, description, onClick, active,
}: {
  icon: React.ElementType; title: string; description?: string;
  onClick?: () => void; active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
        active
          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
          : "hover:bg-[var(--color-surface-hover)] text-[var(--color-ink)]"
      }`}
    >
      <Icon size={18} className={active ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)]"} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{title}</p>
        {description && <p className="text-[10px] text-[var(--color-ink-muted)] truncate">{description}</p>}
      </div>
      <ChevronRight size={14} className="text-[var(--color-ink-subtle)]" />
    </button>
  );
}

export function SettingsPanel({ onBack, onNavigate }: { onBack: () => void; onNavigate: (panel: string) => void; }) {
  const SETTINGS_TABS = [
    { id: "general", label: "General", description: "Agency configuration", icon: SlidersHorizontal },
    { id: "team", label: "Team & Access", description: "Manage staff roles", icon: UserCog },
    { id: "financials", label: "Financials", description: "Billing and invoices", icon: LandmarkIcon },
    { id: "system", label: "System", description: "API keys and webhooks", icon: ServerCog },
    { id: "advanced", label: "Advanced", description: "Backups and health", icon: ShieldHalf },
  ];
  return (
    <ParentPanel title="Settings" onBack={onBack}>
      <div className="space-y-1">
        {SETTINGS_TABS.map((tab) => (
          <SubPanelItem
            key={tab.id} icon={tab.icon} title={tab.label} description={tab.description}
            onClick={() => onNavigate(`settings:${tab.id}`)}
          />
        ))}
      </div>
    </ParentPanel>
  );
}

const MODULES_WITH_PAGES = new Set([
  "business",
  "policies",
  "appearance",
  "roles",
  "users",
  "billing",
  "payments",
]);

export function SettingsSubPanel({
  tabId, onBack, onNavigate, onClose,
}: {
  tabId: string; onBack: () => void; onNavigate: (panel: string) => void; onClose?: () => void;
}) {
  const router = useRouter();

  const MODULES: Record<string, { id: string; title: string; description: string; icon: any }[]> = {
    general: [
      { id: "business", title: "Business Profile", description: "Agency details and contact info", icon: Building2 },
      { id: "policies", title: "Business Policies", description: "Contract clauses and terms", icon: ScrollText },
      { id: "appearance", title: "Appearance", description: "Themes and display settings", icon: Palette },
      { id: "notifications", title: "Notifications", description: "Email alerts and reminders", icon: Bell },
    ],
    team: [
      { id: "roles", title: "Team & Roles", description: "Staff access and permissions", icon: UserCog },
      { id: "users", title: "User Management", description: "Invite and manage staff", icon: Users },
    ],
    financials: [
      { id: "billing", title: "Billing & Subscription", description: "Manage your subscription", icon: LandmarkIcon },
      { id: "payments", title: "Payment Methods", description: "Accepted payment gateways", icon: FileSignature },
    ],
    system: [],
    advanced: [],
  };

  const list = MODULES[tabId] || [];

  const handleModuleClick = (moduleId: string) => {
    if (MODULES_WITH_PAGES.has(moduleId)) {
      // Close first so the transform animation begins this frame
      onClose?.();
      // Defer navigation so the URL update flushes after the close
      setTimeout(() => {
        router.push(`/dashboard/settings?tab=${tabId}&module=${moduleId}`, { scroll: false });
      }, 0);
    } else {
      onNavigate(`settings:${tabId}:${moduleId}`);
    }
  };

  return (
    <ParentPanel title={tabId.charAt(0).toUpperCase() + tabId.slice(1)} onBack={onBack}>
      {list.length > 0 ? (
        <div className="space-y-1">
          {list.map((mod) => (
            <SubPanelItem
              key={mod.id} icon={mod.icon} title={mod.title} description={mod.description}
              onClick={() => handleModuleClick(mod.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--color-ink-muted)]"><p className="text-sm">This section is coming soon.</p></div>
      )}
    </ParentPanel>
  );
}

export function SettingsLeaf({ moduleId, onBack }: { moduleId: string; onBack: () => void; }) {
  return (
    <ParentPanel
      title={moduleId.charAt(0).toUpperCase() + moduleId.slice(1).replace(/-/g, " ")}
      onBack={onBack}
    >
      <div className="text-center py-8 text-[var(--color-ink-muted)]">
        <p className="text-sm">This module is coming soon.</p>
      </div>
    </ParentPanel>
  );
}

export function FinancialsPanel({ onBack, onNavigate }: { onBack: () => void; onNavigate: (panel: string) => void; }) {
  const FINANCIAL_TABS = [
    { id: "overview", label: "Overview", description: "Financial health", icon: LayoutDashboard },
    { id: "invoices", label: "Invoices", description: "Track and send bills", icon: FileText },
    { id: "contracts", label: "Contracts", description: "Manage agreements", icon: FileSignature },
    { id: "payments", label: "Payments", description: "Reconcile incoming payments", icon: DollarSign },
  ];
  return (
    <ParentPanel title="Financials" onBack={onBack}>
      <div className="space-y-1">
        {FINANCIAL_TABS.map((tab) => (
          <SubPanelItem
            key={tab.id} icon={tab.icon} title={tab.label} description={tab.description}
            onClick={() => onNavigate(`financials:${tab.id}`)}
          />
        ))}
      </div>
    </ParentPanel>
  );
}

export function FinancialsLeaf({ tabId, onClose }: { tabId: string; onClose: () => void; }) {
  const router = useRouter();

  useEffect(() => {
    onClose();
    const t = setTimeout(() => {
      router.push(`/dashboard/financials?tab=${tabId}`, { scroll: false });
    }, 0);
    return () => clearTimeout(t);
  }, [tabId, router, onClose]);

  return null;
}

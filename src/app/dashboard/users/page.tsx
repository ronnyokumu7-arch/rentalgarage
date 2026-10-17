// src/app/dashboard/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  CalendarClock,
  ShieldCheck,
  UserCog,
  CalendarRange,
  KeyRound,
} from "lucide-react";
import RosterTab from "@/components/users/manage/RosterTab";
import SchedulerTab from "@/components/users/manage/SchedulerTab";
import RolesTab from "@/components/users/manage/RolesTab";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

/* ──────────────────────────────────────────────────────────────────────
   Tabs config
────────────────────────────────────────────────────────────────────── */

export type UserMainTab = "roster" | "scheduler" | "roles";

interface TabItem {
  id: UserMainTab;
  label: string;
  icon: React.ElementType;
  hiddenOnMobile?: boolean;
}

const TABS: TabItem[] = [
  { id: "roster",    label: "Roster",    icon: Users },
  { id: "scheduler", label: "Scheduler", icon: CalendarClock, hiddenOnMobile: true },
  { id: "roles",     label: "Roles",     icon: ShieldCheck,   hiddenOnMobile: true },
];

const VALID_TABS = new Set<UserMainTab>(["roster", "scheduler", "roles"]);

/* ──────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────── */

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ✅ URL-driven tab — deep links land on the right tab on any viewport */
  const tabFromUrl = searchParams.get("tab") as UserMainTab | null;
  const initialTab: UserMainTab =
    tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : "roster";
  const [activeTab, setActiveTab] = useState<UserMainTab>(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab") as UserMainTab | null;
    if (t && VALID_TABS.has(t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId: string) => {
    if (!VALID_TABS.has(tabId as UserMainTab)) return;
    const next = tabId as UserMainTab;
    if (next === activeTab) return;
    setActiveTab(next);
    router.push(`/dashboard/users?tab=${next}`, { scroll: false });
  };

  /* Dynamic header info — pre-computed once per tab change */
  const currentTabInfo = {
    roster: {
      title: "Team Roster",
      description:
        "Manage your team members, assign roles, and control system access.",
      icon: <UserCog size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    scheduler: {
      title: "Shift Scheduler",
      description:
        "Plan shifts, manage availability, and track team time allocation.",
      icon: <CalendarRange size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    roles: {
      title: "Roles & Permissions",
      description:
        "Configure custom roles, permissions, and access levels for your team.",
      icon: <KeyRound size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* ─── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* ✅ Desktop switcher — shows all three tabs */}
        <div className="hidden md:block">
          <PremiumTabSwitcher
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      {/* ─── TAB CONTENT ──────────────────────────────────────────── */}
      {/* ✅ All tabs render at every viewport when deep-linked.
             Mobile browse stays simple because the RosterTab's toolbar
             segment only offers "Roster" (Scheduler and Roles are
             hiddenOnMobile in TABS). */}
      <div className="animate-in fade-in duration-200">
        {activeTab === "roster"    && <RosterTab />}
        {activeTab === "scheduler" && <SchedulerTab />}
        {activeTab === "roles"     && <RolesTab />}
      </div>
    </div>
  );
}

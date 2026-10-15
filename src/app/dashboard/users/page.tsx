// src/app/dashboard/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Users, CalendarClock, ShieldCheck, UserCog, CalendarRange, KeyRound } from "lucide-react";
import RosterTab from "@/components/users/manage/RosterTab";
import SchedulerTab from "@/components/users/manage/SchedulerTab";
import RolesTab from "@/components/users/manage/RolesTab";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

export type UserMainTab = "roster" | "scheduler" | "roles";

interface TabItem {
  id: UserMainTab;
  label: string;
  icon: React.ElementType;
  hiddenOnMobile?: boolean;
}

const TABS: TabItem[] = [
  { id: "roster", label: "Roster", icon: Users },
  { id: "scheduler", label: "Scheduler", icon: CalendarClock, hiddenOnMobile: true },
  { id: "roles", label: "Roles", icon: ShieldCheck, hiddenOnMobile: true },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserMainTab>("roster");

  // ✅ Guard: Scheduler + Roles are desktop-only — reset if mobile
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768 && activeTab !== "roster") {
        setActiveTab("roster");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [activeTab]);

  // ✅ Dynamic Header Info (PREMIUM: No circles, just clean bare icons)
  const currentTabInfo = {
    roster: {
      title: "Team Roster",
      description: "Manage your team members, assign roles, and control system access.",
      icon: <UserCog size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    scheduler: {
      title: "Shift Scheduler",
      description: "Plan shifts, manage availability, and track team time allocation.",
      icon: <CalendarRange size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    roles: {
      title: "Roles & Permissions",
      description: "Configure custom roles, permissions, and access levels for your team.",
      icon: <KeyRound size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* Header with Premium Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* ✅ DESKTOP ONLY — mobile uses RosterTab's toolbar segment */}
        <div className="hidden md:block">
          <PremiumTabSwitcher
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as UserMainTab)}
          />
        </div>
      </div>

      {/* Conditional Segment View Engine */}
      <div className="animate-in fade-in duration-200">
        {activeTab === "roster" && <RosterTab />}
        {activeTab === "scheduler" && (
          <div className="hidden md:block">
            <SchedulerTab />
          </div>
        )}
        {activeTab === "roles" && (
          <div className="hidden md:block">
            <RolesTab />
          </div>
        )}
      </div>
    </div>
  );
}

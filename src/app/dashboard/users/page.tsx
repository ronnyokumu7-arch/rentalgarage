// src/app/dashboard/users/page.tsx
"use client";

import { useState } from "react";
import { Users, CalendarClock, ShieldCheck, UserCog, CalendarRange, KeyRound } from "lucide-react";
import RosterTab from "@/components/users/manage/RosterTab";
import SchedulerTab from "@/components/users/manage/SchedulerTab";
import RolesTab from "@/components/users/manage/RolesTab";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

export type UserMainTab = "roster" | "scheduler" | "roles";

const TABS = [
  { id: "roster", label: "Roster", icon: Users },
  { id: "scheduler", label: "Scheduler", icon: CalendarClock },
  { id: "roles", label: "Roles", icon: ShieldCheck },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserMainTab>("roster");

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
            {/* ✅ Bare Icon - No container */}
            {currentTabInfo.icon}
            
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              {currentTabInfo.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* ✅ Imported Reusable Premium Tab Switcher */}
        <PremiumTabSwitcher 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={(tabId) => setActiveTab(tabId as UserMainTab)} 
        />
      </div>

      {/* Conditional Segment View Engine */}
      <div className="animate-in fade-in duration-200">
        {activeTab === "roster" && <RosterTab />}
        {activeTab === "scheduler" && <SchedulerTab />}
        {activeTab === "roles" && <RolesTab />}
      </div>
    </div>
  );
}

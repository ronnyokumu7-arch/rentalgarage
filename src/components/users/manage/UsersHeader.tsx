// src/components/users/manage/UsersHeader.tsx
"use client";

import React, { useMemo } from "react";
import { Users, CalendarDots as CalendarDays, ShieldCheck } from "@phosphor-icons/react/ssr";

export type UserMainTab = "roster" | "scheduler" | "roles";

interface UsersHeaderProps {
  activeTab: UserMainTab;
  onTabChange: (tab: UserMainTab) => void;
}

const TABS = [
  { id: "roster", label: "Team Roster", icon: Users, hideOnMobile: false },
  { id: "scheduler", label: "Duty Scheduler", icon: CalendarDays, hideOnMobile: false },
  { id: "roles", label: "Role Templates", icon: ShieldCheck, hideOnMobile: true },
];

export default function UsersHeader({ activeTab, onTabChange }: UsersHeaderProps) {
  const currentTabInfo = useMemo(() => {
    switch (activeTab) {
      case "roster":
        return {
          title: "Team Management",
          description: "Manage executive leadership, staff accounts, verification steps, and system access.",
          icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />,
        };
      case "scheduler":
        return {
          title: "Duty & Shift Scheduler",
          description: "Plan shift timelines, monitor workload distribution, and assign operational tasks.",
          icon: <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />,
        };
      case "roles":
        return {
          title: "Role Templates & Security",
          description: "Configure role-based access control (RBAC), security scopes, and granular permissions.",
          icon: <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />,
        };
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 sm:gap-4">
      {/* Title & Description Header */}
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
          {currentTabInfo.icon}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight truncate">
            {currentTabInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-0.5 leading-snug">
            {currentTabInfo.description}
          </p>
        </div>
      </div>

      {/* Main Module Tabs Switcher */}
      <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-xs w-full sm:w-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          // Role Templates is hidden on mobile (<640px) via `hidden sm:inline-flex`
          const responsiveLayout = tab.hideOnMobile 
            ? "hidden sm:inline-flex" 
            : "flex-1 sm:flex-initial inline-flex";

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id as UserMainTab)}
              className={`items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap active:scale-95 ${responsiveLayout} ${
                isActive
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <Icon size={14} className="flex-shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

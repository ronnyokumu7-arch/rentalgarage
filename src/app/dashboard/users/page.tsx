// src/app/dashboard/users/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Users, CalendarClock, ShieldCheck } from "lucide-react";
import RosterTab from "@/components/users/manage/RosterTab";
import SchedulerTab from "@/components/users/manage/SchedulerTab";
import RolesTab from "@/components/users/manage/RolesTab";

export type UserMainTab = "roster" | "scheduler" | "roles";

const TABS = [
  { id: "roster", label: "Roster", icon: Users },
  { id: "scheduler", label: "Scheduler", icon: CalendarClock },
  { id: "roles", label: "Roles", icon: ShieldCheck },
];

// ✅ REUSABLE: Premium Sliding Tab Switcher (Matches Financials/Clients/Bookings/Fleet)
function PremiumTabSwitcher({ activeTab, setActiveTab }: { activeTab: UserMainTab; setActiveTab: (tab: UserMainTab) => void }) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; top: number; height: number } | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        const containerRect = activeEl.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setIndicatorStyle({
            left: rect.left - containerRect.left,
            width: rect.width,
            top: rect.top - containerRect.top,
            height: rect.height,
          });
        }
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="relative w-full sm:w-auto">
      {/* Sliding Indicator Pill */}
      {indicatorStyle && (
        <div
          className="absolute z-0 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

      {/* Tab Container - No Scrollbar, Snap Centering */}
      <div 
        className="relative z-10 flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-hide snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              type="button"
              onClick={() => setActiveTab(tab.id as UserMainTab)}
              className={`
                relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 
                whitespace-nowrap touch-manipulation cursor-pointer snap-center flex-shrink-0
                ${isActive 
                  ? "text-[var(--color-ink)]" 
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]/50"
                }
              `}
            >
              <Icon size={isActive ? 16 : 14} className={`transition-all duration-300 ${isActive ? "text-[var(--color-primary)]" : "opacity-70"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Subtle bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-surface-border)]/50 -z-10" />
    </div>
  );
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserMainTab>("roster");

  // Dynamic Header Info
  const currentTabInfo = {
    roster: {
      title: "Team Roster",
      description: "Manage your team members, assign roles, and control system access.",
      icon: <Users size={20} />,
    },
    scheduler: {
      title: "Shift Scheduler",
      description: "Plan shifts, manage availability, and track team time allocation.",
      icon: <CalendarClock size={20} />,
    },
    roles: {
      title: "Roles & Permissions",
      description: "Configure custom roles, permissions, and access levels for your team.",
      icon: <ShieldCheck size={20} />,
    },
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* Header with Premium Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
              {currentTabInfo.icon}
            </div>
            <span>{currentTabInfo.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* ✅ Premium Sliding Tab Switcher */}
        <PremiumTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
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

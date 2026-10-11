// src/components/dashboard/RecentActivityWidget.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Activity, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { useActivityTab } from "@/hooks/dashboard/features/useActivityTab";
import UnifiedActivityCard from "@/components/dashboard/UnifiedActivityCard";

type TimeFilter = "today" | "week" | "month";

const FILTERS: { id: TimeFilter; label: string; icon: React.ElementType }[] = [
  { id: "today", label: "Today", icon: Calendar },
  { id: "week", label: "Week", icon: CalendarDays },
  { id: "month", label: "Month", icon: CalendarRange },
];

export default function RecentActivityWidget() {
  const { activities, loading, timeFilter, setTimeFilter } = useActivityTab();

  const [itemLimit, setItemLimit] = useState(6);

  useEffect(() => {
    const checkMobile = () => setItemLimit(window.innerWidth < 768 ? 5 : 6);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const visibleActivities = activities.slice(0, itemLimit);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-gradient-to-r from-[var(--color-surface-hover)]/50 to-transparent">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/20 flex-shrink-0">
              <Activity size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--color-ink)] tracking-tight flex items-center gap-1.5">
                Recent Activity
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] truncate">
                The live pulse of your fleet's latest moves.
              </p>
            </div>
          </div>

          {/* ✅ Premium Sliding Time Filter (matches Action Center pattern) */}
          <TimeFilterSwitcher
            activeTab={timeFilter}
            setActiveTab={setTimeFilter}
            filters={FILTERS}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2.5 max-h-[420px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-ink-muted)]">
            <Loader2 size={24} className="animate-spin mb-3 text-purple-500" />
            <p className="text-sm font-medium">Loading activity...</p>
          </div>
        ) : visibleActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity size={24} className="text-[var(--color-ink-subtle)] mb-3" />
            <p className="text-sm font-bold text-[var(--color-ink)]">No recent activity</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">
              Recent fleet moves will be logged here.
            </p>
          </div>
        ) : (
          visibleActivities.map((activity) => (
            <UnifiedActivityCard key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Time filter switcher — sliding indicator + gradient pill.
   Mirrors the Action Center sub-tab switcher for visual consistency,
   scaled down for the compact widget context.
────────────────────────────────────────────────────────────────────── */

interface TimeFilterSwitcherProps {
  activeTab: TimeFilter;
  setActiveTab: (tab: TimeFilter) => void;
  filters: { id: TimeFilter; label: string; icon: React.ElementType }[];
}

function TimeFilterSwitcher({ activeTab, setActiveTab, filters }: TimeFilterSwitcherProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (!activeEl) return;
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
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="relative w-full">
      {indicatorStyle && (
        <div
          className="absolute z-0 rounded-md bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

      <div className="relative z-10 flex items-center gap-1 p-0.5 bg-[var(--color-surface-hover)]/50 rounded-lg border border-[var(--color-surface-border)]/50 w-full overflow-hidden">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeTab === filter.id;
          return (
            <button
              key={filter.id}
              ref={(el) => {
                tabRefs.current[filter.id] = el;
              }}
              type="button"
              onClick={() => setActiveTab(filter.id)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-bold transition-colors duration-200 whitespace-nowrap touch-manipulation cursor-pointer ${
                isActive
                  ? "text-[var(--color-ink)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Icon size={12} />
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
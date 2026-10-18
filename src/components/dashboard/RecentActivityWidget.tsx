// src/components/dashboard/RecentActivityWidget.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Activity, Clock, CalendarDays, CalendarRange } from "lucide-react";
import { useActivityTab } from "@/hooks/dashboard/features/useActivityTab";
import UnifiedActivityCard from "@/components/dashboard/UnifiedActivityCard";

type TimeFilter = "today" | "week" | "month";

// ✅ Replaced generic calendars with the clock-focused set
const FILTERS: { id: TimeFilter; label: string; icon: React.ElementType }[] = [
  { id: "today", label: "Today", icon: Clock },
  { id: "week", label: "This Week", icon: CalendarDays },
  { id: "month", label: "This Month", icon: CalendarRange },
];

export default function RecentActivityWidget() {
  const { activities, loading, timeFilter, setTimeFilter } = useActivityTab();

  // Defensive cap — the scroll container's height controls the visible
  // window (~2.7 cards on mobile), but we still slice to a sane max.
  const visibleActivities = activities.slice(0, 6);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-gradient-to-r from-[var(--color-surface-hover)]/50 to-transparent">
        <div className="flex items-center justify-between gap-4">
          
          {/* Left: Title */}
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
                Track what's happening
              </p>
            </div>
          </div>

          {/* Right: Compact Icon-Only Time Filter */}
          <TimeFilterSwitcher
            activeTab={timeFilter}
            setActiveTab={setTimeFilter}
            filters={FILTERS}
          />
        </div>
      </div>

      {/* CONTENT
          Mobile: height clamps to ~2.7 cards so the 3rd card peeks under
          the fold (scroll affordance). Desktop: fixed 420px cap. */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2.5 max-h-[min(50vh,330px)] md:max-h-[420px]">
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
   Compact icon-only time filter switcher.
   Matches the geometry of the alert switcher (outer rounded-lg, inner
   rounded-md, p-0.5) but without the text labels to save space.
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
    <div className="relative flex-shrink-0">
      {indicatorStyle && (
        <div
          // ✅ Active indicator: 6px radius (rounded-md)
          className="absolute z-0 rounded-md bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

      {/* ✅ Outer container: 8px radius (rounded-lg) + 2px padding (p-0.5) */}
      <div className="relative z-10 flex items-center gap-0.5 p-0.5 bg-[var(--color-surface-hover)]/50 rounded-lg border border-[var(--color-surface-border)]/50">
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
              title={filter.label}
              aria-label={filter.label}
              // ✅ Inner button: 6px radius (rounded-md), 32x32 hit area
              className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "text-[var(--color-ink)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

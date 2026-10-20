// src/components/dashboard/RecentActivityWidget.tsx
"use client";

import { Activity, Clock, CalendarDays, CalendarRange, Loader2 } from "lucide-react";
import { useActivityTab } from "@/hooks/dashboard/features/useActivityTab";
import UnifiedActivityCard from "@/components/dashboard/UnifiedActivityCard";

type TimeFilter = "today" | "week" | "month";

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
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      {/* ✅ Simplified header: purely informational, no filter here */}
      <div className="px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-gradient-to-r from-[var(--color-surface-hover)]/50 to-transparent">
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
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      {/* ✅ More breathing room for the cards now that the header is compact */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-2.5 max-h-[min(50vh,330px)] md:max-h-[420px]">
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

      {/* ── FOOTER — Time Filter Switcher ───────────────────────────── */}
      {/* ✅ Filter moved down here, styled as a clean segmented switcher */}
      <div className="px-3 py-2 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
        <div className="flex items-center gap-1">
          {FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = timeFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setTimeFilter(filter.id)}
                aria-label={filter.label}
                title={filter.label}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all text-[11px] font-bold ${
                  isActive
                    ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Icon size={12} strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate">{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

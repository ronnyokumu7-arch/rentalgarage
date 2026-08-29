// src/components/dashboard/RecentActivityWidget.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, Activity, Calendar, CalendarDays, CalendarRange, ArrowRight } from "lucide-react";
import { useActivityTab } from "@/hooks/dashboard/features/useActivityTab";
import UnifiedActivityCard from "@/components/dashboard/UnifiedActivityCard";

type TimeFilter = "today" | "week" | "month";

const FILTERS: { id: TimeFilter; label: string; icon: React.ElementType }[] = [
  { id: "today", label: "Today", icon: Calendar },
  { id: "week", label: "Week", icon: CalendarDays },
  { id: "month", label: "Month", icon: CalendarRange },
];

export default function RecentActivityWidget() {
  const router = useRouter();
  
  // ✅ Use the upgraded hook (returns mapped ActivityData[])
  const { activities, loading, timeFilter, setTimeFilter } = useActivityTab();

  const [itemLimit, setItemLimit] = useState(4);

  useEffect(() => {
    const checkMobile = () => setItemLimit(window.innerWidth < 768 ? 3 : 4);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ NO frontend date filtering (backend handles it)
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
              <p className="text-xs text-[var(--color-ink-muted)] truncate">The live pulse of your fleet's latest moves.</p>
            </div>
          </div>

          {/* ✅ Premium Time Filter Toggle (Controls the hook) */}
          <div className="flex items-center gap-1 p-0.5 bg-[var(--color-surface-hover)]/50 rounded-lg border border-[var(--color-surface-border)]/50 w-full">
            {FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = timeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setTimeFilter(filter.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200 ${
                    isActive ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <Icon size={12} />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT - Rendered with UnifiedActivityCard (NO double-mapping) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2.5 max-h-[260px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-ink-muted)]">
            <Loader2 size={24} className="animate-spin mb-3 text-purple-500" />
            <p className="text-sm font-medium">Loading activity...</p>
          </div>
        ) : visibleActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity size={24} className="text-[var(--color-ink-subtle)] mb-3" />
            <p className="text-sm font-bold text-[var(--color-ink)]">No recent activity</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">Recent fleet moves will be logged here.</p>
          </div>
        ) : (
          visibleActivities.map((activity) => {
            // ✅ NO mapActivity here! useActivityTab already returns ActivityData
            return <UnifiedActivityCard key={activity.id} activity={activity} />;
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="px-5 py-2.5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-center">
        <button
          onClick={() => router.push("/dashboard/activity")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity"
        >
          View all Activity
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

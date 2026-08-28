// src/components/dashboard/RecentActivityWidget.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Clock, ArrowRight, Loader2, Activity, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { useActivityTab } from "@/hooks/dashboard/features/useActivityTab";

type TimeFilter = "today" | "week" | "month";

const FILTERS: { id: TimeFilter; label: string; icon: React.ElementType }[] = [
  { id: "today", label: "Today", icon: Calendar },
  { id: "week", label: "Week", icon: CalendarDays },
  { id: "month", label: "Month", icon: CalendarRange },
];

const isSameDay = (date: Date, ref: Date) =>
  date.getFullYear() === ref.getFullYear() &&
  date.getMonth() === ref.getMonth() &&
  date.getDate() === ref.getDate();

const isSameWeek = (date: Date, ref: Date) => {
  const startOfWeek = new Date(ref);
  const day = ref.getDay();
  const diff = ref.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
};

const isSameMonth = (date: Date, ref: Date) =>
  date.getFullYear() === ref.getFullYear() &&
  date.getMonth() === ref.getMonth();

export default function RecentActivityWidget() {
  const router = useRouter();
  const { activities, loading } = useActivityTab();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [itemLimit, setItemLimit] = useState(4);

  // ✅ Responsive item limit: 3 on mobile, 4 on desktop
  useEffect(() => {
    const checkMobile = () => setItemLimit(window.innerWidth < 768 ? 3 : 4);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Filter activities based on selected time period
  const filteredActivities = activities.filter((activity: any) => {
    const timestamp = activity.timestamp ? new Date(activity.timestamp) : new Date();
    const now = new Date();

    switch (timeFilter) {
      case "today":
        return isSameDay(timestamp, now);
      case "week":
        return isSameWeek(timestamp, now);
      case "month":
        return isSameMonth(timestamp, now);
      default:
        return true;
    }
  });

  // ✅ Limit to 3 (mobile) or 4 (desktop) items
  const visibleActivities = filteredActivities.slice(0, itemLimit);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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

          {/* ✅ Premium Time Filter Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-[var(--color-surface-hover)]/50 rounded-lg border border-[var(--color-surface-border)]/50 w-full">
            {FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = timeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setTimeFilter(filter.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-bold transition-all duration-200
                    ${isActive
                      ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                    }
                  `}
                >
                  <Icon size={12} />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT - Fixed height for exactly 3 (mobile) or 4 (desktop) items */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2.5 max-h-[260px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-ink-muted)]">
            <Loader2 size={24} className="animate-spin mb-3 text-purple-500" />
            <p className="text-sm font-medium">Loading activity...</p>
          </div>
        ) : visibleActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Clock size={24} />
            </div>
            <p className="text-sm font-bold text-[var(--color-ink)]">No recent activity</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">Recent fleet moves will be logged here.</p>
          </div>
        ) : (
          visibleActivities.map((activity: any) => (
            <div key={`activity-${activity.id}`} className="p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-purple-500/40 hover:shadow-sm transition-all duration-200 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-600 dark:text-purple-400">
                <Clock size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--color-ink)] leading-snug">
                  {activity.title || activity.description || activity.action}
                </p>
                {activity.timestamp && (
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1 font-medium">{formatDate(activity.timestamp)}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      <div className="px-5 py-2.5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-center">
        <button
          onClick={() => router.push("/dashboard/tasks")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity"
        >
          View all Activity
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

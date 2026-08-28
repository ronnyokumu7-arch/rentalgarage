// src/components/dashboard/features/ActivityTabContent.tsx
"use client";

import { Clock, Loader2 } from "lucide-react";
import { useActivityTab } from "@/hooks/dashboard/features/useActivityTab";

export default function ActivityTabContent() {
  const { activities, loading } = useActivityTab();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)]">
        <Loader2 size={24} className="animate-spin mb-3 text-[var(--color-primary)]" />
        <p className="text-sm font-medium">Loading activity...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
          <Clock size={24} />
        </div>
        <p className="text-sm font-bold text-[var(--color-ink)]">No recent activity</p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">Recent fleet moves will be logged here.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-2 animate-in fade-in duration-200">
      {activities.map((activity: any) => (
        <div key={`activity-${activity.id}`} className="p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center flex-shrink-0 text-[var(--color-primary)]">
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
      ))}
    </div>
  );
}

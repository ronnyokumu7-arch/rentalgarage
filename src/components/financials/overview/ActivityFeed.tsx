// src/components/financials/overview/ActivityFeed.tsx
"use client";

import { useRouter } from "next/navigation";
import { Zap, ChevronRight } from "lucide-react";
import UnifiedActivityCard from "@/components/dashboard/UnifiedActivityCard";
import { useActivityMapper } from "@/hooks/useActivityMapper";
import type { ActivityLog } from "@/lib/api/activityLogs"; // ✅ CHANGED: Raw type

interface ActivityFeedProps {
  activities: ActivityLog[]; // ✅ CHANGED: Raw ActivityLog objects
  /** Kept for caller compatibility — header & card chrome are rendered by the parent page. */
  title?: string;
  /** Max items rendered into the scroll window (default 10; ~3 visible, rest scrolls). */
  limit?: number;
}

// ✅ FINANCIAL TYPES ONLY: Payments, Invoices, Contracts
const FINANCIAL_TYPES = [
  "payment_received",
  "payment_failed",
  "invoice_paid",
  "invoice_overdue",
  "invoice_created",
  "contract_signed",
];

export default function ActivityFeed({ activities, limit = 10 }: ActivityFeedProps) {
  const router = useRouter();
  const { mapActivity } = useActivityMapper(); // ✅ Use the reusable mapper hook

  // ✅ FIXED: Filter by activity.action (raw ActivityLog field)
  const filteredActivities = activities.filter((activity) => FINANCIAL_TYPES.includes(activity.action));
  const displayedActivities = filteredActivities.slice(0, limit);

  // ✅ EMPTY STATE — plain body, no wrapper (parent provides the card chrome)
  if (displayedActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--color-ink-muted)]">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
          <Zap size={22} className="text-[var(--color-ink-subtle)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-ink)]">No recent financial activity</p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">Payments, invoices, and contracts will appear here</p>
      </div>
    );
  }

  // ✅ CARDS ONLY — 3 full cards + half of 4th card visible, scroll for the rest
  return (
    <>
      {/* ✅ Wrapper with fixed height and scrolling */}
      <div className="max-h-[260px] overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-2.5">
          {displayedActivities.map((activity) => {
            // ✅ Map raw ActivityLog to ActivityData
            const mappedActivity = mapActivity(activity);
            return <UnifiedActivityCard key={activity.id} activity={mappedActivity} />;
          })}
        </div>

        {/* Footer - Only show if there are more activities than the scroll window holds */}
        {filteredActivities.length > limit && (
          <div className="px-4 py-2.5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 text-center">
            <button
              onClick={() => router.push("/dashboard/financials")}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
            >
              View all {filteredActivities.length} financial activities
              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

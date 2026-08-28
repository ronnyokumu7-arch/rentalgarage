// src/components/financials/overview/ActivityFeed.tsx
"use client";

import { useRouter } from "next/navigation";
import { 
  Clock, ChevronRight, Calendar, 
  Car, CreditCard, 
  AlertTriangle, CheckCircle2, Truck, UserPlus,
  Receipt, Handshake,
  Sparkles, Zap
} from "lucide-react";
import CardGrid from "@/components/ui/CardGrid";
import type { ActivityItem } from "@/hooks/financials/useFinancialOverview";

interface ActivityFeedProps {
  activities: ActivityItem[];
  /** Kept for caller compatibility — header & card chrome are rendered by the parent page. */
  title?: string;
  /** Max items rendered into the scroll window (default 10; ~3 visible, rest scrolls). */
  limit?: number;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "payment_received": return CreditCard;
    case "contract_signed": return Handshake;
    case "invoice_overdue": return AlertTriangle;
    case "booking_confirmed": return CheckCircle2;
    case "vehicle_returned": return Truck;
    case "client_added": return UserPlus;
    case "payment_failed": return AlertTriangle;
    case "booking_created": return Calendar;
    case "invoice_paid": return Receipt;
    case "vehicle_rented": return Car;
    default: return Sparkles;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "payment_received": return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "contract_signed": return "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "invoice_overdue": return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
    case "booking_confirmed": return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "vehicle_returned": return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "client_added": return "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    case "payment_failed": return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
    case "booking_created": return "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "invoice_paid": return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "vehicle_rented": return "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20";
    default: return "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]";
  }
};

const getActivityEmoji = (type: string) => {
  switch (type) {
    case "payment_received": return "💳";
    case "contract_signed": return "🤝";
    case "invoice_overdue": return "🚨";
    case "booking_confirmed": return "✅";
    case "vehicle_returned": return "🚗";
    case "client_added": return "👤";
    case "payment_failed": return "❌";
    case "booking_created": return "📅";
    case "invoice_paid": return "💰";
    case "vehicle_rented": return "🚙";
    default: return "✨";
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * ✅ CHROME-FREE FEED: renders ONLY the cards (and footer).
 * The parent container (OverviewTab) owns the card chrome.
 * ✅ VIEWPORT: shows 3 full cards + half of the 4th card to indicate scrollability.
 */
export default function ActivityFeed({ activities, limit = 10 }: ActivityFeedProps) {
  const router = useRouter();

  const displayedActivities = activities.slice(0, limit);

  // ✅ EMPTY STATE — plain body, no wrapper (parent provides the card chrome)
  if (displayedActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--color-ink-muted)]">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
          <Zap size={22} className="text-[var(--color-ink-subtle)]" />
        </div>
        <p className="text-sm font-semibold text-[var(--color-ink)]">No recent activity</p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">Activity will appear here as it happens</p>
      </div>
    );
  }

  // ✅ CARDS ONLY — 3 full cards + half of 4th card visible, scroll for the rest
  return (
    <>
      {/* ✅ Wrapper with fixed height and scrolling */}
      <div className="max-h-[260px] overflow-y-auto custom-scrollbar">
        <div className="p-2">
          <CardGrid
            data={displayedActivities}
            getCardId={(activity) => activity.id}
            compact={true}
            cardClassName="!p-2.5 hover:!border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200"
            // ✅ Remove container height constraint - let the wrapper control it
            containerClassName="[&>div]:space-y-1.5"
            
            renderCardHeader={({ item }) => {
              const Icon = getActivityIcon(item.type);
              const colorClass = getActivityColor(item.type);
              const emoji = getActivityEmoji(item.type);
              
              return (
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`relative flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${colorClass} border`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[var(--color-ink)] truncate">
                        {item.title}
                      </span>
                      <span className="text-xs sm:hidden">{emoji}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-[var(--color-ink-muted)] truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
            
            renderCardBody={({ item }) => {
              return (
                <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-[var(--color-ink-subtle)]" />
                    <span className="text-[10px] font-medium text-[var(--color-ink-muted)]">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(item.link);
                    }}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity group"
                  >
                    View
                    <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            }}
            
            onCardClick={(item) => router.push(item.link)}
          />
        </div>

        {/* Footer - Only show if there are more activities than the scroll window holds */}
        {activities.length > limit && (
          <div className="px-4 py-2.5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 text-center">
            <button
              onClick={() => router.push("/dashboard/activity")}
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
            >
              View all {activities.length} activities
              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

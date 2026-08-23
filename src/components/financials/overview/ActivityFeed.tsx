// src/components/financials/overview/ActivityFeed.tsx
"use client";

import { useRouter } from "next/navigation";
import { 
  Clock, ChevronRight, TrendingUp, Calendar, 
  Users, Car, FileCheck, CreditCard, 
  AlertTriangle, CheckCircle2, Truck, UserPlus,
  CalendarDays, DollarSign, Receipt, Handshake,
  Crown, Star, Rocket, Sparkles, Zap
} from "lucide-react";
import CardGrid from "@/components/ui/CardGrid";
import type { ActivityItem } from "@/hooks/financials/useFinancialOverview";

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
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

export default function ActivityFeed({ activities, title = "Recent Activity" }: ActivityFeedProps) {
  const router = useRouter();

  if (activities.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Header - Clean straight edges */}
        <div className="px-4 py-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
              <Rocket size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">{title}</h3>
              <p className="text-[10px] text-[var(--color-ink-muted)]">Live feed of your business</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-[var(--color-ink-muted)]">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
            <Zap size={24} className="text-[var(--color-ink-subtle)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">No recent activity</p>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1">Activity will appear here as it happens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      
      {/* Header - Clean straight edges */}
      <div className="px-4 py-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
              <Rocket size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">{title}</h3>
              <p className="text-[10px] text-[var(--color-ink-muted)]">Live feed of your business</p>
            </div>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] px-2 py-1 rounded-full border border-[var(--color-surface-border)]">
            {activities.length} items
          </span>
        </div>
      </div>

      {/* CardGrid - Premium Activity Cards */}
      <div className="p-2">
        <CardGrid
          data={activities}
          getCardId={(activity) => activity.id}
          compact={true}
          cardClassName="!p-2.5 hover:!border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200"
          containerClassName="max-h-80 overflow-y-auto custom-scrollbar"
          
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
                    <span className="text-xs font-bold text-[var(--color-ink)] truncate">
                      {item.title}
                    </span>
                    <span className="text-xs sm:hidden">{emoji}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] text-[var(--color-ink-muted)] truncate">
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
                  <Clock size={10} className="text-[var(--color-ink-subtle)]" />
                  <span className="text-[8px] font-medium text-[var(--color-ink-muted)]">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(item.link);
                  }}
                  className="inline-flex items-center gap-0.5 text-[8px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity group"
                >
                  View
                  <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          }}
          
          onCardClick={(item) => router.push(item.link)}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 text-center">
        <button
          onClick={() => router.push("/dashboard/activity")}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
        >
          View all activity
          <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

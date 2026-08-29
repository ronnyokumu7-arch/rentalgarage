// src/components/dashboard/UnifiedActivityCard.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Banknote, CheckCircle2, AlertTriangle, Handshake, Calendar,
  Truck, UserPlus, Receipt, Car, ChevronRight, Phone, User,
  Clock, ShieldAlert, Gauge, FileWarning
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ActivityData {
  id: number | string;
  type: string;
  title: string;
  description?: string;
  amount?: number | string | null;
  reference?: string;
  timestamp: string;
  // Deep-link data
  link: string;
  // User/Client data
  client_name?: string;
  client_phone?: string;
  // Optional: extra metadata for the header (e.g., "3 Days", "REF XYZ")
  meta?: string;
  // ✅ NEW: Priority from backend (1=Low, 2=Normal, 3=High, 4=Critical)
  priority?: number;
}

interface UnifiedActivityCardProps {
  activity: ActivityData;
  onCardClick?: (activity: ActivityData) => void;
}

// ✅ Priority-aware color system
const getActivityColor = (type: string, priority?: number) => {
  // Critical alerts (priority 4) always get red treatment
  if (priority === 4) {
    return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30";
  }
  
  // High priority (priority 3) gets orange/amber treatment
  if (priority === 3) {
    return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30";
  }

  switch (type) {
    case "payment_received":
    case "invoice_paid":
      return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "contract_signed":
      return "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20";
    case "invoice_overdue":
    case "payment_failed":
      return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
    case "booking_confirmed":
      return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "vehicle_returned":
      return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "client_added":
    case "create_client":
      return "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    case "booking_created":
    case "create_booking":
      return "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case "vehicle_rented":
      return "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "dl_expired":
    case "vehicle_insurance_expiring":
      return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20";
    case "trip_overdue":
    case "trip_ending_today":
      return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "mileage_due":
      return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
    default:
      return "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]";
  }
};

// ✅ Expanded icon mapping for all action types
const getActivityIcon = (type: string): LucideIcon => {
  switch (type) {
    case "payment_received": return Banknote;
    case "invoice_paid": return Banknote;
    case "contract_signed": return Handshake;
    case "invoice_overdue": return AlertTriangle;
    case "booking_confirmed": return CheckCircle2;
    case "vehicle_returned": return Truck;
    case "client_added":
    case "create_client":
      return UserPlus;
    case "payment_failed": return AlertTriangle;
    case "booking_created":
    case "create_booking":
      return Calendar;
    case "vehicle_rented": return Car;
    case "dl_expired": return ShieldAlert;
    case "vehicle_insurance_expiring": return FileWarning;
    case "trip_overdue":
    case "trip_ending_today":
      return AlertTriangle;
    case "mileage_due": return Gauge;
    default: return Receipt;
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

// ✅ Helper to check if this activity has a "Money" header
const isMoneyActivity = (type: string) => {
  return ["payment_received", "invoice_paid", "invoice_overdue", "payment_failed"].includes(type);
};

export default function UnifiedActivityCard({ activity, onCardClick }: UnifiedActivityCardProps) {
  const router = useRouter();
  const Icon = getActivityIcon(activity.type);
  const colorClass = getActivityColor(activity.type, activity.priority);
  const isMoney = isMoneyActivity(activity.type);
  const isCritical = activity.priority === 4;
  const isHigh = activity.priority === 3;
  
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(activity);
    } else {
      router.push(activity.link);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={`group relative rounded-xl border bg-[var(--color-surface)] hover:shadow-sm transition-all duration-200 cursor-pointer p-3.5 ${
        isCritical 
          ? "border-rose-500/50 hover:border-rose-500" 
          : isHigh 
          ? "border-amber-500/40 hover:border-amber-500/60"
          : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/40"
      }`}
    >
      {/* ── HEADER: Icon + Title + Timestamp ─────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${colorClass} border ${
            isCritical ? "animate-pulse" : ""
          }`}>
            <Icon size={15} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-[var(--color-ink)] truncate">
                {activity.title}
              </span>
              {/* ✅ Premium Checkmark for success events */}
              {(activity.type === "payment_received" || activity.type === "invoice_paid" || activity.type === "booking_confirmed") && (
                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              )}
              {/* ✅ Priority badge for high/critical */}
              {isCritical && (
                <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  Critical
                </span>
              )}
              {isHigh && !isCritical && (
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  High
                </span>
              )}
            </div>
            {/* ✅ Money Header: Amount + Reference */}
            {isMoney && activity.amount !== null && activity.amount !== undefined && (
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className={`text-sm font-extrabold tracking-tight ${
                  activity.type === "invoice_overdue" || activity.type === "payment_failed"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-[var(--color-ink)]"
                }`}>
                  {typeof activity.amount === "number" ? `KES ${activity.amount.toLocaleString()}` : activity.amount}
                </span>
                {activity.reference && (
                  <span className="text-[10px] font-mono font-semibold text-[var(--color-ink-muted)]">
                    REF {activity.reference}
                  </span>
                )}
              </div>
            )}
            {/* ✅ Non-Money Header: Meta info (e.g., "3 Days", "John D.") */}
            {!isMoney && activity.meta && (
              <p className="text-xs font-medium text-[var(--color-ink-muted)] mt-0.5 truncate">
                {activity.meta}
              </p>
            )}
          </div>
        </div>
        
        {/* ✅ Timestamp: Top Right Corner */}
        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-medium text-[var(--color-ink-muted)]">
          <Clock size={10} />
          {formatTimeAgo(activity.timestamp)}
        </span>
      </div>

      {/* ── BODY: Client / Phone / Reference (Clean & Minimal) ─────── */}
      <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {/* Client Info */}
          {activity.client_name && (
            <div className="flex items-center gap-1.5 min-w-0">
              <User size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
              <span className="text-xs font-semibold text-[var(--color-ink)] truncate max-w-[100px]">
                {activity.client_name}
              </span>
            </div>
          )}
          {/* Phone Info */}
          {activity.client_phone && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
              <span className="text-xs font-medium text-[var(--color-ink-muted)] truncate max-w-[120px]">
                {activity.client_phone}
              </span>
            </div>
          )}
        </div>

        {/* ✅ Deep-link "View" button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(activity.link);
          }}
          className="flex-shrink-0 inline-flex items-center gap-0.5 text-[11px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity group/btn"
        >
          View
          <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

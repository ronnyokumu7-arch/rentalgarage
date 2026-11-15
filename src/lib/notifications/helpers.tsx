import type { ReactNode } from "react";
import {
  Bell,
  FileText,
  CreditCard,
  User,
  Car,
  Warning,
  Info,
  ArrowRight,
} from "@phosphor-icons/react";
import type { Notification } from "@/lib/types";

// ============================================================================
// TIME
// ============================================================================

/**
 * Compact relative-time formatter for notification rows.
 * "Just now" → "5m ago" → "3h ago" → locale date beyond 24h.
 */
export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

// ============================================================================
// ICONS
// ============================================================================

/**
 * Maps a NotificationType to a Phosphor icon.
 * Covers the real backend enum (booking|payment|client|vehicle|system|alert)
 * plus defensive branches for contract|invoice (declared in frontend types).
 */
export const getNotificationIcon = (type: string, size = 20): ReactNode => {
  switch (type) {
    case "payment":
      return <CreditCard size={size} weight="fill" />;
    case "booking":
      return <FileText size={size} weight="fill" />;
    case "client":
      return <User size={size} weight="fill" />;
    case "vehicle":
      return <Car size={size} weight="fill" />;
    case "alert":
      return <Warning size={size} weight="fill" />;
    case "system":
      return <Info size={size} weight="fill" />;
    // Defensive: not emitted by current triggers, but typed in frontend.
    case "contract":
    case "invoice":
      return <FileText size={size} weight="fill" />;
    default:
      return <Bell size={size} weight="fill" />;
  }
};

// ============================================================================
// CONTEXTUAL CTA
// ============================================================================

/**
 * Derives a premium, intent-first action label + trailing icon from the
 * notification's action_url (primary) and type (fallback).
 *
 * URL patterns are taken directly from app/services/notification_triggers.py:
 *   /dashboard/bookings/{id}            → Manage Booking
 *   /dashboard/clients/{id}             → Manage Client
 *   /dashboard/fleet/{id}               → Manage Vehicle
 *   /dashboard/financials/payments/...  → Manage Payment
 *   /dashboard/financials/commission    → Manage Commission
 *   /dashboard/commission               → Manage Commission
 *   /super-admin/commission/payments    → Verify Commission  (super-admin flow)
 *
 * Order matters: the super-admin commission URL also contains "commission",
 * so it is checked before the generic commission branch.
 */
export const getContextualActionLabel = (
  notification: Notification,
): { label: string; icon: ReactNode } => {
  const url = notification.action_url || "";
  const trailing = <ArrowRight size={16} weight="bold" />;

  // --- URL-driven (most specific → most general) ---
  if (url.includes("/super-admin/commission"))
    return { label: "Verify Commission", icon: trailing };
  if (url.includes("/financials/payments"))
    return { label: "Manage Payment", icon: trailing };
  if (url.includes("/financials/commission") || url.includes("/commission"))
    return { label: "Manage Commission", icon: trailing };
  if (url.includes("/bookings/")) return { label: "Manage Booking", icon: trailing };
  if (url.includes("/clients/")) return { label: "Manage Client", icon: trailing };
  if (url.includes("/fleet/") || url.includes("/vehicles/"))
    return { label: "Manage Vehicle", icon: trailing };

  // --- Type fallback (when no deep link, or link doesn't match a pattern) ---
  switch (notification.type) {
    case "payment":
      return { label: "Manage Payment", icon: trailing };
    case "booking":
      return { label: "Manage Booking", icon: trailing };
    case "client":
      return { label: "Manage Client", icon: trailing };
    case "vehicle":
      return { label: "Manage Vehicle", icon: trailing };
    case "system":
      return { label: "View System Update", icon: trailing };
    case "alert":
      return { label: "View Alert", icon: trailing };
    case "contract":
      return { label: "Manage Contract", icon: trailing };
    case "invoice":
      return { label: "Manage Invoice", icon: trailing };
    default:
      return { label: "View Details", icon: trailing };
  }
};

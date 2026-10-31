// src/components/client/mobile/helpers.ts
import type { ClientListItem } from "./types";

export const getInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * ✅ Tinted avatar class communicates status at a glance.
 * Priority (highest → lowest):
 *   suspended → red
 *   on_trip   → green
 *   booked    → blue
 *   pending OR expired DL → amber
 *   default   → muted grey
 */
export function getAvatarStatusClasses(
  client: ClientListItem,
  hasExpiredDL: boolean
): string {
  if (client.status === "suspended") {
    return "bg-rose-500/15 text-rose-700 dark:text-rose-400";
  }
  if (client.booking_state === "on_trip") {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }
  if (client.booking_state === "booked") {
    return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
  }
  if (client.status === "pending" || hasExpiredDL) {
    return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  }
  return "bg-slate-500/15 text-slate-700 dark:text-slate-400";
}

/**
 * @deprecated — kept for backward compatibility.
 * Prefer {@link getAvatarStatusClasses} which also considers bookings + DL.
 */
export const getAvatarColors = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    case "pending":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "suspended":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-400";
    default:
      return "bg-slate-500/15 text-slate-700 dark:text-slate-400";
  }
};

export const getWhatsAppNumber = (rawPhone?: string | null): string | null => {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
};

export function getDLStatus(dlExpiry?: string | null): {
  kind: "none" | "expired" | "expiring" | "valid";
  label: string;
  tone: "emerald" | "amber" | "rose" | "muted";
} {
  if (!dlExpiry) return { kind: "none", label: "DL not provided", tone: "muted" };
  const expiry = new Date(dlExpiry);
  if (Number.isNaN(expiry.getTime())) {
    return { kind: "none", label: "DL not provided", tone: "muted" };
  }
  const diffDays = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
  if (diffDays < 0) return { kind: "expired", label: "DL expired", tone: "rose" };
  if (diffDays <= 30) {
    return {
      kind: "expiring",
      label:
        diffDays === 0
          ? "DL expires today"
          : `DL expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
      tone: "amber",
    };
  }
  return { kind: "valid", label: "DL valid", tone: "emerald" };
}

export const CLIENT_STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Active",
  },
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Pending",
  },
  suspended: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    label: "Suspended",
  },
  inactive: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-500",
    label: "Inactive",
  },
};

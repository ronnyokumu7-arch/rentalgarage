/** Status styling, labels, and pure helpers for the bookings list modules. */

import type { BookingStatus, CancellationReason } from "@/lib/types";

export const statusStyles: Record<BookingStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  confirmed: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  active: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  completed: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
  cancelled: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
};

export const statusLabels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const statusDotColors: Record<BookingStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-[var(--color-primary)]",
  active: "bg-emerald-500",
  completed: "bg-gray-400",
  cancelled: "bg-red-500",
};

// ✅ LIFECYCLE: cancellation reason labels (displayed alongside the cancelled status chip)
export const cancellationReasonLabels: Record<CancellationReason, string> = {
  client_cancelled: "Client Cancelled",
  agency_cancelled: "Agency Cancelled",
  no_show: "No Show",
  expired_unpaid: "Expired Unpaid",
};

export const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
};

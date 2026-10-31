// src/components/bookings/booking_list/mobile/helpers.ts
import type { PaymentSnapshot } from "./types";

export const getWhatsAppNumber = (rawPhone?: string | null): string | null => {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
};

export const getBookingAvatarColors = (
  status: string
): { bg: string; icon: string } => {
  switch (status) {
    case "pending":
      return { bg: "bg-amber-500/10", icon: "text-amber-600 dark:text-amber-400" };
    case "confirmed":
      return { bg: "bg-blue-500/10", icon: "text-blue-600 dark:text-blue-400" };
    case "active":
      return { bg: "bg-emerald-500/10", icon: "text-emerald-600 dark:text-emerald-400" };
    case "completed":
      return { bg: "bg-slate-500/10", icon: "text-slate-600 dark:text-slate-400" };
    case "cancelled":
      return { bg: "bg-rose-500/10", icon: "text-rose-600 dark:text-rose-400" };
    default:
      return { bg: "bg-slate-500/10", icon: "text-slate-600 dark:text-slate-400" };
  }
};

export const buildPaymentPill = (
  total: number,
  snapshot?: PaymentSnapshot
): { label: string; classes: string; isPaid: boolean; isPartial: boolean } => {
  const paid = snapshot?.amount_paid || 0;

  if (total > 0 && paid >= total) {
    return {
      label: "Paid",
      classes:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      isPaid: true,
      isPartial: false,
    };
  }
  if (paid > 0) {
    return {
      label: "Partial",
      classes:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      isPaid: false,
      isPartial: true,
    };
  }
  return {
    label: "Unpaid",
    classes:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    isPaid: false,
    isPartial: false,
  };
};

/** Formats a phone number for display next to the phone icon in the pill. */
export const formatPhoneDisplay = (raw?: string | null): string => {
  if (!raw) return "";
  const trimmed = raw.trim();
  return trimmed;
};

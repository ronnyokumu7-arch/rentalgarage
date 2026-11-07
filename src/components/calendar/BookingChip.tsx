// src/components/calendar/BookingChip.tsx
"use client";

import { Car } from "@phosphor-icons/react/ssr";
import type { Booking, Vehicle } from "@/lib/types";

interface BookingChipProps {
  booking: Booking;
  vehicle?: Vehicle;
  onClick: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[var(--color-warning-bg)] border-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
  confirmed: "bg-[var(--color-primary-muted)] border-[var(--color-primary-muted)] text-[var(--color-primary-text)]",
  active: "bg-[var(--color-success-bg)] border-[var(--color-success-bg)] text-[var(--color-success-text)]",
  completed: "bg-[var(--color-surface-hover)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)]",
  cancelled: "bg-[var(--color-danger-bg)] border-[var(--color-danger-bg)] text-[var(--color-danger-text)]",
  no_show: "bg-[var(--color-danger-bg)] border-[var(--color-danger-bg)] text-[var(--color-danger-text)]",
};

export default function BookingChip({ booking, vehicle, onClick }: BookingChipProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1 rounded-md border text-[10px] font-medium truncate flex items-center gap-1.5 transition-all hover:scale-[1.02] hover:shadow-sm ${STATUS_STYLES[booking.status] || STATUS_STYLES.completed}`}
    >
      <Car size={10} className="flex-shrink-0 opacity-70" aria-hidden="true" />
      <span className="truncate font-bold">{vehicle?.plate_number || "N/A"}</span>
    </button>
  );
}

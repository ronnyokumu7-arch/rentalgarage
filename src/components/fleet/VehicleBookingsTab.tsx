"use client";

import Link from "next/link";
import { Calendar, Loader2, Car } from "lucide-react";
import type { Booking } from "@/lib/types";
import { formatDateShort } from "@/components/bookings/booking_list/constants";

interface VehicleBookingsTabProps {
  bookings: Booking[];
  loading: boolean;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  completed: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export default function VehicleBookingsTab({ bookings, loading }: VehicleBookingsTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--color-ink-muted)]">
        <Loader2 size={20} className="animate-spin mr-2" />
        <span className="text-sm">Loading bookings…</span>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-xl bg-[var(--color-surface-hover)] flex items-center justify-center mb-3">
          <Calendar size={24} className="text-[var(--color-ink-subtle)]" />
        </div>
        <p className="text-sm font-bold text-[var(--color-ink)]">No bookings yet</p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">
          Trips for this vehicle will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
      <div className="divide-y divide-[var(--color-surface-border)]">
        {bookings.map((b) => (
          <Link
            key={b.id}
            href={`/dashboard/bookings/${b.id}`}
            className="flex items-center gap-3 p-4 hover:bg-[var(--color-surface-hover)]/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
              <Car size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-[var(--color-ink)] truncate">
                  {b.client_name || "Client"}
                </p>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${STATUS_STYLE[b.status] || STATUS_STYLE.completed}`}
                >
                  {b.status}
                </span>
              </div>
              <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5 truncate font-mono">
                {b.booking_number || `#${b.id}`} · {formatDateShort(b.start_date)} → {formatDateShort(b.end_date)}
              </p>
            </div>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums flex-shrink-0">
              {b.currency_code} {Number(b.total_amount).toLocaleString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

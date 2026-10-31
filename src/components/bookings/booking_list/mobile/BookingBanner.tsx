// src/components/bookings/booking_list/mobile/BookingBanner.tsx
"use client";

import { AlertCircle, ArrowRight } from "lucide-react";

interface BookingBannerProps {
  search: string;
  pendingCount: number;
  visibleCount: number;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  hasActiveFilter: boolean;
  hidden: boolean;
}

export default function BookingBanner({
  search,
  pendingCount,
  visibleCount,
  statusFilter,
  setStatusFilter,
  hasActiveFilter,
  hidden,
}: BookingBannerProps) {
  if (hidden) return null;

  return (
    <div className="px-3">
      {!search && pendingCount > 0 && statusFilter !== "pending" && (
        <button
          type="button"
          onClick={() => setStatusFilter("pending")}
          className="w-full flex items-center justify-start gap-2 py-3 px-1 text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity text-xs font-semibold"
        >
          <AlertCircle size={14} />
          {pendingCount} {pendingCount === 1 ? "booking" : "bookings"} pending your review
          <ArrowRight size={12} className="opacity-70" />
        </button>
      )}

      {!search && statusFilter === "pending" && visibleCount > 0 && (
        <div className="w-full flex items-center justify-between py-3 px-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <AlertCircle size={14} />
            Viewing {visibleCount} pending {visibleCount === 1 ? "booking" : "bookings"}
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className="text-[11px] font-bold px-2 py-1 rounded-md bg-blue-500/15 hover:bg-blue-500/25 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      {!search && hasActiveFilter && statusFilter !== "pending" && visibleCount > 0 && (
        <div className="w-full flex items-center justify-between py-3 px-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <AlertCircle size={14} />
            Viewing {visibleCount} {statusFilter} {visibleCount === 1 ? "booking" : "bookings"}
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className="text-[11px] font-bold px-2 py-1 rounded-md bg-blue-500/15 hover:bg-blue-500/25 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}

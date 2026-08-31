"use client";

import { Search, Filter } from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import NewBookingButton from "../NewBookingButton"; // ✅ NEW IMPORT

interface BookingsToolbarProps {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  upcomingCount: number;
  activeTripsCount: number;
  completedCount: number;
}

export default function BookingsToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  upcomingCount,
  activeTripsCount,
  completedCount,
}: BookingsToolbarProps) {
  return (
    <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
      {/* Metrics Counter Panel */}
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">New</span>
          <span className="text-xs font-bold text-[var(--color-warning-text)] tabular-nums">{upcomingCount}</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
          <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeTripsCount}</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Past</span>
          <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{completedCount}</span>
        </div>
      </div>

      {/* Controls: Search + Filter + CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
        <div className="flex items-center gap-2 flex-1 sm:w-80">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-normal"
            />
          </div>

          <FilterDropdown
            filterId="booking-status"
            label="Status"
            options={[
              { label: "Pending", value: "pending" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Active", value: "active" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
              { label: "No Show", value: "no_show" },
              { label: "Awaiting Mileage", value: "awaiting_mileage" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            icon={Filter}
          />
        </div>

        {/* ✅ REPLACED: Standard button with the new Dropdown NewBookingButton */}
        <NewBookingButton />
      </div>
    </div>
  );
}

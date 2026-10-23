// src/components/bookings/booking_list/BookingsListMobile.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays, Phone, ChevronRight,
  Search, X, SlidersHorizontal,
} from "lucide-react";
import CardGrid from "@/components/ui/CardGrid";
import type { Booking, Client, Vehicle } from "@/lib/types";
import { getBookingActions, type BookingActionsContext } from "./getBookingActions";
import { formatDateShort, statusLabels } from "./constants";
import { NewBookingFab } from "@/components/bookings/NewBookingButton";
import { useMobileHeaderExpanded } from "@/hooks/useMobileHeaderExpanded";

interface BookingsListMobileProps {
  bookings: Booking[];
  clientMap: Map<number, Client>;
  vehicleMap: Map<number, Vehicle>;
  actionsCtx: Omit<BookingActionsContext, "routerPush">;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  statusOptions: { label: string; value: string; count?: number }[];
  activeTab: string;
  handleTabChange: (tab: string) => void;
}

const getClient = (map: Map<number, Client>, id: number) =>
  map.get(id) || map.get(Number(id));
const getVehicle = (map: Map<number, Vehicle>, id: number) =>
  map.get(id) || map.get(Number(id));

const getBookingAvatarColors = (status: string): { bg: string; icon: string } => {
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
    case "no_show":
      return { bg: "bg-rose-500/10", icon: "text-rose-600 dark:text-rose-400" };
    default:
      return { bg: "bg-slate-500/10", icon: "text-slate-600 dark:text-slate-400" };
  }
};

export default function BookingsListMobile({
  bookings,
  clientMap,
  vehicleMap,
  actionsCtx,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
}: BookingsListMobileProps) {
  const router = useRouter();
  const headerExpanded = useMobileHeaderExpanded();

  const fullCtx: BookingActionsContext = {
    ...actionsCtx,
    routerPush: (h) => router.push(h),
  };
  const getRowActions = (b: Booking) => getBookingActions(b, fullCtx);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const hasActiveFilter = statusFilter !== null && statusFilter !== "";

  // ✅ Dynamic top offset based on header expansion (matches fleet)
  const EXPANDED_OFFSET = 128;
  const COLLAPSED_OFFSET = 56;
  const toolbarTop = headerExpanded ? EXPANDED_OFFSET : COLLAPSED_OFFSET;

  // ✅ Dynamic spacer: matches fleet's base values + header expansion delta
  const baseSpacer = filtersOpen ? 144 : 96;
  const headerDelta = headerExpanded ? (EXPANDED_OFFSET - COLLAPSED_OFFSET) : 0;
  const spacerHeight = baseSpacer + headerDelta;

  return (
    <div className="block md:hidden relative">
      {/* TOOLBAR — slides down when header expands */}
      <div
        className="fixed left-0 right-0 z-25 px-4 pt-2 pb-2 bg-[var(--color-bg)]/95 backdrop-blur-md"
        style={{
          top: `${toolbarTop}px`,
          transition: "top 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="space-y-2">
          {/* Search + filter pill */}
          <div className="flex items-center h-11 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] overflow-hidden transition-colors">
            <div className="relative flex-1 h-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                placeholder="Search bookings..."
                className="w-full h-full pl-10 pr-2 bg-transparent text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] outline-none"
              />
              {search && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSearch("");
                    setSearchFocused(false);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center hover:bg-[var(--color-surface-border)] transition-colors"
                  aria-label="Clear search"
                >
                  <X size={12} className="text-[var(--color-ink-muted)]" />
                </button>
              )}
            </div>

            <div className="pr-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiltersOpen((v) => !v);
                }}
                aria-label={filtersOpen ? "Hide filters" : "Show filters"}
                aria-expanded={filtersOpen}
                className={`relative h-8 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 ${
                  filtersOpen
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : hasActiveFilter
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15"
                      : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                }`}
              >
                <SlidersHorizontal size={14} />
                {hasActiveFilter && !filtersOpen && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </button>
            </div>
          </div>

          {/* Filter pills */}
          {filtersOpen && !searchFocused && (
            <div className="relative animate-in slide-in-from-top-1 fade-in duration-200">
              <div className="overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-2 py-1 pr-6">
                  <button
                    onClick={() => setStatusFilter(null)}
                    className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border ${
                      !statusFilter
                        ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    All
                  </button>
                  {statusOptions.map((opt) => {
                    const isActive = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border ${
                          isActive
                            ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className="pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>

      {/* ✅ Dynamic spacer — matches fleet spacing exactly */}
      <div
        style={{
          height: `${spacerHeight}px`,
          transition: "height 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Card list */}
      <CardGrid
        data={bookings}
        getCardId={(booking) => booking.id}
        compact={true}
        cardClassName="!p-3.5 !rounded-2xl border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all duration-300 shadow-sm"
        containerClassName="space-y-2.5 pb-4"
        maxHeight="calc(100vh - 200px)"
        renderCardHeader={({ item }) => {
          const statusLabel = statusLabels[item.status] || item.status;
          const avatar = getBookingAvatarColors(item.status);

          return (
            <div
              className="flex items-center justify-between w-full cursor-pointer"
              onClick={() => router.push(`/dashboard/bookings/${item.id}`)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${avatar.bg}`}
                >
                  <CalendarDays size={20} className={avatar.icon} strokeWidth={1.75} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                      {item.booking_number || `BK-${item.id}`}
                    </span>
                    <span className="text-[8px] font-bold text-[var(--color-ink-muted)] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] whitespace-nowrap uppercase tracking-wide">
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CalendarDays size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="text-[10px] text-[var(--color-ink-muted)] font-medium">
                      {formatDateShort(item.start_date)}
                    </span>
                    <span className="text-[9px] text-[var(--color-ink-subtle)]">→</span>
                    <span className="text-[10px] text-[var(--color-ink-muted)] font-medium">
                      {formatDateShort(item.end_date)}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight size={16} className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" />
            </div>
          );
        }}
        renderCardBody={({ item }) => {
          const client = getClient(clientMap, item.client_id);
          const vehicle = getVehicle(vehicleMap, item.vehicle_id);
          const clientName = client?.full_name || `Client #${item.client_id}`;
          const initials = clientName
            .trim()
            .split(/\s+/)
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

          return (
            <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-hover)] flex items-center justify-center text-[var(--color-ink-muted)] font-bold text-[11px] flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-ink)] leading-tight truncate">
                      {clientName}
                    </p>
                    {client?.phone && (
                      <div className="flex items-center gap-1 text-[10px] text-[var(--color-ink-muted)] font-medium mt-0.5">
                        <Phone size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <p className="text-xs font-semibold text-[var(--color-ink)] leading-tight truncate">
                    {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${item.vehicle_id}`}
                  </p>
                  {vehicle?.plate_number && (
                    <span className="text-[10px] font-mono font-bold text-[var(--color-ink-subtle)]">
                      {vehicle.plate_number}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                  Trip Total
                </span>
                <p className="text-base font-extrabold text-[var(--color-primary-text)] tabular-nums tracking-tight">
                  {item.currency_code} {Number(item.total_amount).toLocaleString()}
                </p>
              </div>
            </div>
          );
        }}
        rowActions={getRowActions}
      />

      {/* FAB */}
      {!searchFocused && <NewBookingFab />}
    </div>
  );
}

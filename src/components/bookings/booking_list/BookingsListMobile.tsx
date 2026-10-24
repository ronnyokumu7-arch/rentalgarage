// src/components/bookings/booking_list/BookingsListMobile.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  CalendarDays, Phone, ChevronRight,
  Search, X, SlidersHorizontal,
  AlertCircle, ArrowRight,
} from "lucide-react";
import CardGrid from "@/components/ui/CardGrid";
import type { Booking, Client, Vehicle } from "@/lib/types";
import { getBookingActions, type BookingActionsContext } from "./getBookingActions";
import { formatDateShort, statusLabels } from "./constants";
import { NewBookingFab } from "@/components/bookings/NewBookingButton";

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

  const fullCtx: BookingActionsContext = {
    ...actionsCtx,
    routerPush: (h) => router.push(h),
  };
  const getRowActions = (b: Booking) => getBookingActions(b, fullCtx);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const hasActiveFilter = statusFilter !== null && statusFilter !== "";

  // Count pending bookings for banner
  const pendingCount = useMemo(() => {
    return bookings.filter((b) => b.status === "pending").length;
  }, [bookings]);

  // ✅ Auto-sort by status priority
  const sortedBookings = useMemo(() => {
    const priority: Record<string, number> = {
      active: 1,
      confirmed: 2,
      pending: 3,
      completed: 4,
      cancelled: 5,
      no_show: 6,
    };

    return [...bookings].sort((a, b) => {
      const aPriority = priority[a.status] ?? 99;
      const bPriority = priority[b.status] ?? 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      const aDate = new Date(a.start_date).getTime();
      const bDate = new Date(b.start_date).getTime();
      return bDate - aDate;
    });
  }, [bookings]);

  const handleCallClient = (phone: string | null | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone.replace(/\s/g, "")}`;
    }
  };

  return (
    <div className="block md:hidden relative">
      {/* TOOLBAR: Sticky like fleet/clients pages */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg)] py-2">
        <div className="px-0">
          <div className="space-y-2">
            {/* Search + filter pill: rounded-2xl for premium edge-to-edge look */}
            <div className="flex items-center h-11 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] overflow-hidden transition-colors mx-0">
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

            {/* Filter pills: px-3 to prevent touching physical edge */}
            {filtersOpen && !searchFocused && (
              <div className="relative animate-in slide-in-from-top-1 fade-in duration-200">
                <div className="overflow-x-auto scrollbar-none">
                  <div className="flex items-center gap-2 py-1 px-3 pr-6">
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
      </div>

      {/* Banners - similar to clients page */}
      <div className={`px-3 ${searchFocused ? "hidden" : ""}`}>
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

        {!search && statusFilter === "pending" && (
          <div className="w-full flex items-center justify-between py-3 px-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <span className="flex items-center gap-2">
              <AlertCircle size={14} />
              Viewing {sortedBookings.length} pending {sortedBookings.length === 1 ? "booking" : "bookings"}
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

      {/* Card List: Seamless edge-to-edge pattern */}
      <div className="pb-4">
        {sortedBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No bookings found</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] first:rounded-t-2xl last:rounded-b-2xl">
            {sortedBookings.map((item, index) => {
              const statusLabel = statusLabels[item.status] || item.status;
              const avatar = getBookingAvatarColors(item.status);
              const client = getClient(clientMap, item.client_id);
              const vehicle = getVehicle(vehicleMap, item.vehicle_id);
              const clientName = client?.full_name || `Client #${item.client_id}`;

              return (
                <div
                  key={item.id}
                  className="relative flex flex-col w-full py-3.5 px-3 transition-colors cursor-pointer select-none hover:bg-[var(--color-surface-hover)]/40"
                  onClick={() => {
                    // Open action sheet instead of navigating
                    const trigger = document.querySelector(`[data-card-actions="${item.id}"] button`) as HTMLButtonElement | null;
                    trigger?.click();
                  }}
                >
                  {/* Premium fade border - 80% width, very thin, fades at sides */}
                  {index !== sortedBookings.length - 1 && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[var(--color-surface-border)] to-transparent" />
                  )}

                  {/* Header Section */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${avatar.bg}`}>
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

                  {/* Body Section */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Large Phone Icon - tappable to call */}
                      <button
                        onClick={(e) => handleCallClient(client?.phone, e)}
                        className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0 transition-colors active:scale-95"
                        aria-label="Call client"
                      >
                        <Phone size={20} strokeWidth={2} />
                      </button>
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

                  {/* Footer Section */}
                  <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                      Trip Total
                    </span>
                    <p className="text-base font-extrabold text-[var(--color-primary)] tabular-nums tracking-tight">
                      {item.currency_code} {Number(item.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden CardGrid to render action sheets */}
      <div className="hidden">
        <CardGrid
          data={sortedBookings}
          getCardId={(booking) => booking.id}
          compact={true}
          onCardClick={() => {}}
          cardClassName="!p-0"
          containerClassName="!p-0"
          renderCardHeader={() => <div className="hidden" />}
          renderCardBody={() => null}
          rowActions={getRowActions}
        />
      </div>

      {/* FAB */}
      {!searchFocused && <NewBookingFab />}
    </div>
  );
}

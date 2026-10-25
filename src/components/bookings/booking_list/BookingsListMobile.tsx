// src/components/bookings/booking_list/BookingsListMobile.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  CalendarDays, Phone, MessageCircle, ChevronRight,
  Search, X, SlidersHorizontal,
  AlertCircle, ArrowRight, Car, BadgeCheck,
} from "lucide-react";
import CardGrid from "@/components/ui/CardGrid";
import type { Booking, Client, Vehicle } from "@/lib/types";
import { getBookingActions, type BookingActionsContext } from "./getBookingActions";
import { formatDateShort } from "./constants";
import { NewBookingFab } from "@/components/bookings/NewBookingButton";
import { invoicesApi } from "@/lib/api/invoices"; // ✅ Direct API access

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

const getWhatsAppNumber = (rawPhone?: string | null): string | null => {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
};

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
      return { bg: "bg-rose-500/10", icon: "text-rose-600 dark:text-rose-400" };
    default:
      return { bg: "bg-slate-500/10", icon: "text-slate-600 dark:text-slate-400" };
  }
};

// ✅ DIRECTLY fetches and aggregates invoices (same source of truth as Financials page)
interface PaymentSnapshot {
  amount_paid: number;
  amount_due: number;
  status: string;
}

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
  
  // ✅ Local state for payment data (fetched directly from invoices API)
  const [paymentMap, setPaymentMap] = useState<Map<number, PaymentSnapshot>>(new Map());

  useEffect(() => {
    // Fetch invoices exactly like the Financials page does
    invoicesApi.list({ page_size: 200 }).then((invoices) => {
      const map = new Map<number, PaymentSnapshot>();
      (invoices || []).forEach((inv: any) => {
        if (inv.booking_id) {
          const existing = map.get(inv.booking_id);
          if (!existing) {
            map.set(inv.booking_id, {
              amount_paid: Number(inv.amount_paid || 0),
              amount_due: Number(inv.amount_due || 0),
              status: inv.status,
            });
          } else {
            // Aggregate if a booking has multiple invoices (e.g. quotation + final invoice)
            existing.amount_paid += Number(inv.amount_paid || 0);
            existing.amount_due += Number(inv.amount_due || 0);
            if (inv.status === "paid") existing.status = "paid";
            else if (inv.status === "partially_paid" && existing.status !== "paid") {
              existing.status = "partially_paid";
            }
          }
        }
      });
      setPaymentMap(map);
    }).catch(err => console.error("Failed to fetch invoices for payment pills:", err));
  }, []);

  const hasActiveFilter = statusFilter !== null && statusFilter !== "";

  const pendingCount = useMemo(() => {
    return bookings.filter((b) => b.status === "pending").length;
  }, [bookings]);

  const sortedBookings = useMemo(() => {
    const priority: Record<string, number> = {
      active: 1,
      confirmed: 2,
      pending: 3,
      completed: 4,
      cancelled: 5,
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

  // ✅ Helper to determine pill color based on aggregated payment data
  const getPaymentPill = (booking: Booking) => {
    const paymentData = paymentMap.get(booking.id);
    const total = Number(booking.total_amount || 0);
    const paid = paymentData?.amount_paid || 0;

    if (total > 0 && paid >= total) {
      return {
        label: "Paid",
        icon: BadgeCheck,
        classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      };
    }
    if (paid > 0) {
      return {
        label: "Partial",
        icon: AlertCircle,
        classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      };
    }
    return {
      label: "Unpaid",
      icon: AlertCircle,
      classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    };
  };

  return (
    <div className="block md:hidden relative min-h-screen">
      {/* TOOLBAR: Always visible, sticky at top */}
      <div className="sticky top-0 z-30 bg-[var(--color-bg)] py-2">
        <div className="px-0">
          <div className="space-y-2">
            {/* Search bar - ALWAYS renders */}
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

            {/* Filter pills - ALWAYS renders when open, regardless of search focus */}
            {filtersOpen && (
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

      {/* Banners - Only show when relevant, but never hide the toolbar */}
      {!searchFocused && (
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

          {!search && statusFilter === "pending" && sortedBookings.length > 0 && (
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

          {/* Show "Viewing X [status] bookings" for any active filter */}
          {!search && hasActiveFilter && statusFilter !== "pending" && sortedBookings.length > 0 && (
            <div className="w-full flex items-center justify-between py-3 px-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <AlertCircle size={14} />
                Viewing {sortedBookings.length} {statusFilter} {sortedBookings.length === 1 ? "booking" : "bookings"}
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
      )}

      {/* Card List */}
      <div className="pb-4">
        {sortedBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No bookings found</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || hasActiveFilter
                ? "Try adjusting your search query or filters."
                : "Create your first booking to get started."}
            </p>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => setStatusFilter(null)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        ) : (
          <div className="bg-[var(--color-surface)] first:rounded-t-2xl last:rounded-b-2xl">
            {sortedBookings.map((item, index) => {
              const avatar = getBookingAvatarColors(item.status);
              const client = getClient(clientMap, item.client_id);
              const vehicle = getVehicle(vehicleMap, item.vehicle_id);
              const clientName = client?.full_name || `Client #${item.client_id}`;
              const waNumber = getWhatsAppNumber(client?.phone);
              
              // ✅ Get payment pill data directly from the fetched map
              const paymentPill = getPaymentPill(item);
              const PaymentIcon = paymentPill.icon;

              return (
                <div
                  key={item.id}
                  className="relative flex flex-col w-full py-3.5 px-3 transition-colors cursor-pointer select-none hover:bg-[var(--color-surface-hover)]/40"
                  onClick={() => {
                    const trigger = document.querySelector(`[data-card-actions="${item.id}"] button`) as HTMLButtonElement | null;
                    trigger?.click();
                  }}
                >
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
                          {/* ✅ Payment Status Pill */}
                          <span
                            className={`inline-flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wide whitespace-nowrap ${paymentPill.classes}`}
                          >
                            <PaymentIcon size={9} className="flex-shrink-0" strokeWidth={2.5} />
                            {paymentPill.label}
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[var(--color-ink)] leading-tight truncate mb-1.5">
                        {clientName}
                      </p>
                      
                      {client?.phone && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${client.phone.replace(/\s/g, "")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-colors text-[10px] font-bold text-[var(--color-ink)]"
                          >
                            <Phone size={10} className="text-[var(--color-ink-muted)]" />
                            Call
                          </a>
                          
                          {waNumber && (
                            <a
                              href={`https://wa.me/${waNumber}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-colors text-[10px] font-bold text-[var(--color-ink)]"
                            >
                              <MessageCircle size={10} className="text-[var(--color-ink-muted)]" />
                              Message
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 text-right">
                      <p className="text-xs font-bold text-[var(--color-ink)] leading-tight truncate">
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${item.vehicle_id}`}
                      </p>
                      {vehicle?.plate_number && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-colors text-[10px] font-bold text-[var(--color-ink)] mt-1.5">
                          <Car size={10} className="text-[var(--color-ink-muted)]" />
                          <span className="font-mono tracking-tight">{vehicle.plate_number}</span>
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

      {/* Hidden CardGrid */}
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

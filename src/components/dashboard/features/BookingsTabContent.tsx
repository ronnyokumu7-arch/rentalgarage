// src/components/dashboard/features/BookingsTabContent.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Calendar, CalendarDays, Clock, Car, MapPin, ChevronRight, ArrowUpRight,
  Loader2, MoreVertical, Play, XCircle, Eye, CheckCircle2
} from "lucide-react";
import { useBookingsTab } from "@/hooks/dashboard/features/useBookingsTab";

const BOOKING_STATUS_META: Record<string, { label: string; dot: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", dot: "bg-blue-500" },
  active:    { label: "Active",    dot: "bg-emerald-500" },
  completed: { label: "Completed", dot: "bg-slate-400" },
  cancelled: { label: "Cancelled", dot: "bg-rose-500" },
};

const resolveField = (value: any, ...objectKeys: string[]): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    for (const key of objectKeys) if (value[key]) return String(value[key]);
    if (value.make && value.model) return `${value.make} ${value.model}${value.plate_number ? ` • ${value.plate_number}` : ""}`;
    if (value.full_name) return value.full_name;
    if (value.name) return value.name;
  }
  return String(value);
};

const getInitials = (name?: string | null) =>
  name ? name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() : "?";

const rentalDays = (start?: string | null, end?: string | null): number | null => {
  if (!start || !end) return null;
  const d = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  return isNaN(d) ? null : Math.max(1, d);
};

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const isOverdue = (dateStr: string) => !!dateStr && new Date(dateStr) < new Date();

export default function BookingsTabContent() {
  const router = useRouter();
  const {
    bookings, loading, actingBookingId, openMenuId,
    setOpenMenuId, handleAction, closeMenu
  } = useBookingsTab();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)]">
        <Loader2 size={24} className="animate-spin mb-3 text-[var(--color-primary)]" />
        <p className="text-sm font-medium">Loading rentals...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
          <Calendar size={24} />
        </div>
        <p className="text-sm font-bold text-[var(--color-ink)]">No upcoming rentals</p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">Scheduled rentals will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-in fade-in duration-200">
      {bookings.map((booking) => {
        const meta = BOOKING_STATUS_META[booking.status] || BOOKING_STATUS_META.pending;
        const clientName = resolveField(booking.client, "full_name", "name") || "Customer";
        const vehicle = booking.vehicle;
        const plate = vehicle?.plate_number || null;
        const vehicleLabel = vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle";
        const days = rentalDays(booking.start_date, booking.end_date);
        const destination = resolveField(booking.destination, "name", "destination");
        const tripOverdue = booking.status === "active" && isOverdue(booking.end_date);
        const isActive = booking.status === "active";
        const isPending = booking.status === "pending";
        const isConfirmed = booking.status === "confirmed";

        const getPrimaryAction = () => {
          if (isConfirmed) return { label: "Start Trip", icon: Play, onClick: () => handleAction(booking.id, "activate") };
          if (isActive) return { label: "End Trip", icon: CheckCircle2, onClick: () => handleAction(booking.id, "complete") };
          return null;
        };
        const primaryAction = getPrimaryAction();

        return (
          <div
            key={`booking-${booking.id}`}
            className="group relative rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-200"
          >
            <div className="p-3.5">
              {/* Row 1: Avatar + Client + Menu */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-[var(--color-surface)] ${
                      isActive ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                      isConfirmed ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      isPending ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                      'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      {getInitials(clientName)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${meta.dot} ring-2 ring-[var(--color-surface)] ${isActive ? 'animate-pulse' : ''}`} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{clientName}</p>
                      {isActive && (
                        <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold uppercase tracking-wider border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Car size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <span className="text-xs font-medium text-[var(--color-ink-muted)] truncate">{vehicleLabel}</span>
                      {plate && (
                        <>
                          <span className="text-xs text-[var(--color-ink-subtle)]">•</span>
                          <span className="text-xs font-mono font-semibold text-[var(--color-ink)]">{plate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative flex-shrink-0" data-booking-menu>
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === booking.id ? null : booking.id); }}
                    className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
                  >
                    {actingBookingId === booking.id ? <Loader2 size={15} className="animate-spin" /> : <MoreVertical size={15} />}
                  </button>

                  {openMenuId === booking.id && (
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-lg shadow-black/5 z-20 overflow-hidden animate-in fade-in slide-up duration-150">
                      <button
                        onClick={(e) => { e.stopPropagation(); closeMenu(); router.push(`/dashboard/bookings/${booking.id}`); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                      >
                        <Eye size={15} /> View Booking
                      </button>
                      {isConfirmed && (
                        <button onClick={(e) => { e.stopPropagation(); handleAction(booking.id, "activate"); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                          <Play size={15} /> Start Trip
                        </button>
                      )}
                      {isActive && (
                        <button onClick={(e) => { e.stopPropagation(); handleAction(booking.id, "complete"); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                          <CheckCircle2 size={15} /> End Trip
                        </button>
                      )}
                      {(isPending || isConfirmed) && (
                        <button onClick={(e) => { e.stopPropagation(); handleAction(booking.id, "cancel"); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-[var(--color-surface-border)]">
                          <XCircle size={15} /> Cancel Booking
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Clean Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)] leading-tight">{days || 0}d</p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] leading-tight">Duration</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)] leading-tight truncate">
                      {formatDateShort(isActive ? booking.end_date : booking.start_date)}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] leading-tight">{isActive ? 'End Date' : 'Start Date'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-[10px] font-semibold text-[var(--color-ink-muted)]">{booking.currency_code || "KES"}</span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-primary-text)] leading-tight tabular-nums truncate">
                      {Number(booking.total_amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] text-right leading-tight">Total</p>
                  </div>
                </div>
              </div>

              {/* Row 3: Unified Status + Details Box */}
              <div className={`mt-3 rounded-xl px-3 py-2.5 border ${
                tripOverdue ? 'bg-rose-500/10 border-rose-500/20' :
                isActive ? 'bg-emerald-500/10 border-emerald-500/20' :
                isConfirmed ? 'bg-blue-500/10 border-blue-500/20' :
                'bg-[var(--color-surface-hover)]/50 border-[var(--color-surface-border)]/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${meta.dot} ${isActive ? 'animate-pulse' : ''}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${
                      tripOverdue ? 'text-rose-600 dark:text-rose-400' :
                      isActive ? 'text-emerald-600 dark:text-emerald-400' :
                      isConfirmed ? 'text-blue-600 dark:text-blue-400' :
                      'text-amber-600 dark:text-amber-400'
                    }`}>
                      {tripOverdue ? 'Overdue' : meta.label}
                    </span>
                  </div>

                  {destination && (
                    <div className="flex items-center gap-1 min-w-0 flex-1 justify-end px-2">
                      <MapPin size={11} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <span className="text-[10px] font-medium text-[var(--color-ink-muted)] truncate">{destination}</span>
                    </div>
                  )}

                  <button
                    onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity flex-shrink-0"
                  >
                    Details
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTON */}
              {primaryAction && (
                <button
                  onClick={(e) => { e.stopPropagation(); primaryAction.onClick(); }}
                  className="w-full mt-2.5 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/20 text-[var(--color-primary-text)] transition-all active:scale-[0.98] text-[11px] font-bold"
                >
                  {primaryAction.icon && <primaryAction.icon size={13} />}
                  {primaryAction.label}
                  <ArrowUpRight size={13} className="opacity-70" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// src/components/dashboard/features/BookingsTabContent.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Calendar, CalendarDays, Clock, Car, MapPin, ChevronRight,
  Loader2, MoreVertical, Play, XCircle, Eye, CheckCircle2
} from "lucide-react";
import { useBookingsTab } from "@/hooks/dashboard/features/useBookingsTab";
import { bookingsApi } from "@/lib/api/bookings";
import BookingActionsSheet, { SheetAction } from "./BookingActionsSheet";

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
  const { bookings, loading, refetch } = useBookingsTab();

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

                <div className="relative flex-shrink-0">
                  <BookingMenu
                    bookingId={booking.id}
                    isActive={isActive}
                    isConfirmed={isConfirmed}
                    isPending={isPending}
                    statusLabel={
                      tripOverdue ? "Overdue Return" : 
                      isActive ? "Trip Active" :
                      isConfirmed ? "Booking Confirmed" : "Booking Pending"
                    }
                    statusTone={
                      tripOverdue ? "danger" :
                      isActive ? "success" :
                      isConfirmed ? "info" : "warning"
                    }
                    onAction={refetch}
                    onView={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  />
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

              {/* Row 3: Destination + Details */}
              <div className="mt-3 pt-2.5 border-t border-[var(--color-surface-border)]/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  {destination ? (
                    <>
                      <MapPin size={11} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <span className="text-[11px] font-medium text-[var(--color-ink-muted)] truncate">{destination}</span>
                    </>
                  ) : (
                    <span className="text-[11px] text-[var(--color-ink-faint)] italic">No destination</span>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  Details <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface BookingMenuProps {
  bookingId: number;
  isActive: boolean;
  isConfirmed: boolean;
  isPending: boolean;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "info";
  onAction: () => void | Promise<void>;
  onView: () => void;
}

function BookingMenu({ bookingId, isActive, isConfirmed, isPending, statusLabel, statusTone, onAction, onView }: BookingMenuProps) {
  const [open, setOpen] = useState(false);

  const handleActivate = async () => {
    try {
      await bookingsApi.activate(bookingId);
      toast.success("Trip started");
      await onAction();
    } catch (e: any) {
      toast.error(e.response?.data?.detail ?? "Action failed.");
      throw e;
    }
  };

  const handleComplete = async () => {
    try {
      await bookingsApi.complete(bookingId);
      toast.success("Trip completed");
      await onAction();
    } catch (e: any) {
      toast.error(e.response?.data?.detail ?? "Action failed.");
      throw e;
    }
  };

  const handleCancel = async () => {
    try {
      await bookingsApi.cancel(bookingId, { reason: "agency_cancelled" });
      toast.success("Booking cancelled");
      await onAction();
    } catch (e: any) {
      toast.error(e.response?.data?.detail ?? "Action failed.");
      throw e;
    }
  };

  const actions: SheetAction[] = [
    {
      kind: "view",
      label: "View Booking",
      icon: Eye,
      onClick: onView,
    },
    ...(isConfirmed ? [{
      kind: "action" as const,
      label: "Start Trip",
      icon: Play,
      tone: "success" as const,
      onClick: handleActivate,
    }] : []),
    ...(isActive ? [{
      kind: "action" as const,
      label: "End Trip",
      icon: CheckCircle2,
      tone: "success" as const,
      onClick: handleComplete,
    }] : []),
    ...(isPending || isConfirmed ? [{
      kind: "action" as const,
      label: "Cancel Booking",
      icon: XCircle,
      tone: "danger" as const,
      onClick: handleCancel,
    }] : []),
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
      >
        <MoreVertical size={15} />
      </button>

      <BookingActionsSheet
        open={open}
        onClose={() => setOpen(false)}
        statusLabel={statusLabel}
        statusTone={statusTone}
        actions={actions}
      />
    </>
  );
}

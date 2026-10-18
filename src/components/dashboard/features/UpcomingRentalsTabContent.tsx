// src/components/dashboard/features/UpcomingRentalsTabContent.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Calendar, Car, MapPin,
  Loader2, MoreVertical, Play, XCircle, Eye,
} from "lucide-react";
import { useUpcomingRentalsTab } from "@/hooks/dashboard/features/useUpcomingRentalsTab";
import BookingActionsSheet, { SheetAction } from "./BookingActionsSheet";
import { useState } from "react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";

const BOOKING_STATUS_META: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-500", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  confirmed: { label: "Confirmed", dot: "bg-blue-500",  bg: "bg-blue-500/10",  text: "text-blue-600 dark:text-blue-400" },
};

const resolveField = (value: unknown, ...objectKeys: string[]): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    for (const key of objectKeys) {
      const v = obj[key];
      if (v !== undefined && v !== null) return String(v);
    }
    if (obj["full_name"]) return String(obj["full_name"]);
    if (obj["name"]) return String(obj["name"]);
  }
  return String(value);
};

const formatPlate = (plate: string | null) => {
  if (!plate) return "—";
  return plate.replace(/([A-Za-z])(\d)/, "$1 $2").toUpperCase();
};

const rentalDays = (start?: string | null, end?: string | null): number | null => {
  if (!start || !end) return null;
  const d = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
  return Number.isNaN(d) ? null : Math.max(1, d);
};

const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function UpcomingRentalsTabContent() {
  const router = useRouter();
  const { rentals, loading, refetch } = useUpcomingRentalsTab();

  const handleActivate = async (bookingId: number) => {
    try {
      await bookingsApi.activate(bookingId);
      toast.success("Trip started — vehicle is now active");
      await refetch();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Action failed. Try again.";
      toast.error(message);
    }
  };

  const handleCancel = async (bookingId: number) => {
    try {
      await bookingsApi.cancel(bookingId, { reason: "agency_cancelled" });
      toast.success("Booking cancelled");
      await refetch();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Action failed. Try again.";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)]">
        <Loader2 size={24} className="animate-spin mb-3 text-[var(--color-primary)]" />
        <p className="text-sm font-medium">Loading upcoming rentals...</p>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
          <Calendar size={24} />
        </div>
        <p className="text-sm font-bold text-[var(--color-ink)]">No upcoming rentals</p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">
          Scheduled rentals will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-in fade-in duration-200 max-h-[min(55vh,340px)] overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 md:max-h-none md:overflow-visible">
      {rentals.map((booking) => {
        const meta = BOOKING_STATUS_META[booking.status] ?? BOOKING_STATUS_META.pending;
        const clientName = resolveField(booking.client, "full_name", "name") || "Customer";
        const vehicle = booking.vehicle;
        const plate = vehicle?.plate_number ?? null;
        const vehicleLabel = vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle";
        const days = rentalDays(booking.start_date, booking.end_date);
        const destination = resolveField(booking.destination, "name", "destination");
        const isPending = booking.status === "pending";
        const isConfirmed = booking.status === "confirmed";

        return (
          <div
            key={`upcoming-${booking.id}`}
            className="group relative rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-200"
          >
            <div className="p-3.5">
              {/* Row 1: Header (client + vehicle + mobile-only 3 dots) */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${
                    isConfirmed ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    <Car size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-[var(--color-ink)] truncate">{clientName}</p>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${meta.bg} ${meta.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-medium text-[var(--color-ink-muted)] truncate">{vehicleLabel}</span>
                      <span className="text-[8px] text-[var(--color-ink-subtle)]">•</span>
                      <span className="text-xs font-mono font-semibold text-[var(--color-ink)]">{formatPlate(plate)}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile-only menu — hidden on desktop */}
                <div className="md:hidden relative flex-shrink-0">
                  <UpcomingRentalMenu
                    bookingId={booking.id}
                    isConfirmed={isConfirmed}
                    isPending={isPending}
                    onAction={refetch}
                    onView={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  />
                </div>
              </div>

              {/* Row 2: Stats Strip */}
              <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]/50">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs font-bold text-[var(--color-ink)] leading-tight">{formatDateShort(booking.start_date)}</p>
                    <p className="text-[9px] font-medium text-[var(--color-ink-muted)] leading-tight">Pickup</p>
                  </div>
                </div>

                <div className="flex flex-col items-center px-2">
                  <span className="text-[10px] font-bold text-[var(--color-ink-muted)] tabular-nums">{days || 0}d</span>
                  <div className="w-8 h-px bg-[var(--color-surface-border)] my-0.5" />
                  <span className="text-[8px] font-medium text-[var(--color-ink-subtle)] uppercase tracking-wider">Duration</span>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-ink)] leading-tight">{Number(booking.total_amount).toLocaleString()}</p>
                    <p className="text-[9px] font-medium text-[var(--color-ink-muted)] leading-tight">{booking.currency_code || "KES"} Total</p>
                  </div>
                </div>
              </div>

              {/* Row 3: Destination + Details/Actions */}
              <div className="mt-2.5 flex items-center justify-between gap-2">
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

                {/* ✅ MOBILE: Details link only */}
                <button
                  onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  className="md:hidden inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  Details
                </button>

                {/* ✅ DESKTOP: Inline action buttons */}
                <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    View
                  </button>
                  {isConfirmed && (
                    <button
                      onClick={() => handleActivate(booking.id)}
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      Start Trip
                    </button>
                  )}
                  {(isPending || isConfirmed) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface UpcomingRentalMenuProps {
  bookingId: number;
  isConfirmed: boolean;
  isPending: boolean;
  onAction: () => void | Promise<void>;
  onView: () => void;
}

function UpcomingRentalMenu({ bookingId, isConfirmed, isPending, onAction, onView }: UpcomingRentalMenuProps) {
  const [open, setOpen] = useState(false);

  const handleActivate = async () => {
    try {
      await bookingsApi.activate(bookingId);
      toast.success("Trip started — vehicle is now active");
      await onAction();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Action failed. Try again.";
      toast.error(message);
      throw e;
    }
  };

  const handleCancel = async () => {
    try {
      await bookingsApi.cancel(bookingId, { reason: "agency_cancelled" });
      toast.success("Booking cancelled");
      await onAction();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Action failed. Try again.";
      toast.error(message);
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
        aria-label="Booking actions"
      >
        <MoreVertical size={15} />
      </button>

      <BookingActionsSheet
        open={open}
        onClose={() => setOpen(false)}
        statusLabel={isConfirmed ? "Booking Confirmed" : "Booking Pending"}
        statusTone={isConfirmed ? "info" : "warning"}
        actions={actions}
      />
    </>
  );
}

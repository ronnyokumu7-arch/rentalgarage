// src/components/dashboard/features/UpcomingRentalsTabContent.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Calendar, CalendarDays, Clock, Car, MapPin, ChevronRight,
  Loader2, MoreVertical, Play, XCircle, Eye,
} from "lucide-react";
import { useUpcomingRentalsTab } from "@/hooks/dashboard/features/useUpcomingRentalsTab";

const BOOKING_STATUS_META: Record<string, { label: string; dot: string }> = {
  pending:   { label: "Pending",   dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", dot: "bg-blue-500" },
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
    const make = obj["make"];
    const model = obj["model"];
    const plate = obj["plate_number"];
    if (make && model) {
      return `${make} ${model}${plate ? ` • ${plate}` : ""}`;
    }
    if (obj["full_name"]) return String(obj["full_name"]);
    if (obj["name"]) return String(obj["name"]);
  }
  return String(value);
};

const getInitials = (name?: string | null): string =>
  name
    ? name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

const rentalDays = (start?: string | null, end?: string | null): number | null => {
  if (!start || !end) return null;
  const d = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000
  );
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
    <div className="space-y-2.5 animate-in fade-in duration-200">
      {rentals.map((booking) => {
        const meta = BOOKING_STATUS_META[booking.status] ?? BOOKING_STATUS_META.pending;
        const clientName =
          resolveField(booking.client, "full_name", "name") || "Customer";
        const vehicle = booking.vehicle;
        const plate = vehicle?.plate_number ?? null;
        const vehicleLabel = vehicle
          ? `${vehicle.make} ${vehicle.model}`
          : "Vehicle";
        const days = rentalDays(booking.start_date, booking.end_date);
        const destination = resolveField(
          booking.destination,
          "name",
          "destination"
        );
        const isPending = booking.status === "pending";
        const isConfirmed = booking.status === "confirmed";

        return (
          <div
            key={`upcoming-${booking.id}`}
            className="group relative rounded-xl overflow-hidden border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:shadow-sm transition-all duration-200"
          >
            <div className="p-3.5">
              {/* ── Row 1: Avatar + Client + 3-dot Menu ─────────────── */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-[var(--color-surface)] ${
                        isConfirmed
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gradient-to-br from-amber-500 to-amber-600"
                      }`}
                    >
                      {getInitials(clientName)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${meta.dot} ring-2 ring-[var(--color-surface)]`}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                      {clientName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Car
                        size={12}
                        className="text-[var(--color-ink-subtle)] flex-shrink-0"
                      />
                      <span className="text-xs font-medium text-[var(--color-ink-muted)] truncate">
                        {vehicleLabel}
                      </span>
                      {plate && (
                        <>
                          <span className="text-xs text-[var(--color-ink-subtle)]">•</span>
                          <span className="text-xs font-mono font-semibold text-[var(--color-ink)]">
                            {plate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3-dot menu — all actions live here */}
                <div className="relative flex-shrink-0">
                  <UpcomingRentalMenu
                    bookingId={booking.id}
                    isConfirmed={isConfirmed}
                    isPending={isPending}
                    onAction={refetch}
                    onView={() =>
                      router.push(`/dashboard/bookings/${booking.id}`)
                    }
                  />
                </div>
              </div>

              {/* ── Row 2: Stats Grid ───────────────────────────────── */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex items-center gap-1.5">
                  <CalendarDays
                    size={13}
                    className="text-[var(--color-ink-subtle)] flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)] leading-tight">
                      {days || 0}d
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] leading-tight">
                      Duration
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock
                    size={13}
                    className="text-[var(--color-ink-subtle)] flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)] leading-tight truncate">
                      {formatDateShort(booking.start_date)}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] leading-tight">
                      Start Date
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-[10px] font-semibold text-[var(--color-ink-muted)]">
                    {booking.currency_code || "KES"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-primary-text)] leading-tight tabular-nums truncate">
                      {Number(booking.total_amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] text-right leading-tight">
                      Total
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Row 3: Status + Destination + Details ──────────── */}
              <div
                className={`mt-3 rounded-xl px-3 py-2.5 border ${
                  isConfirmed
                    ? "bg-blue-500/10 border-blue-500/20"
                    : "bg-amber-500/10 border-amber-500/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wide ${
                        isConfirmed
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {destination && (
                    <div className="flex items-center gap-1 min-w-0 flex-1 justify-end px-2">
                      <MapPin
                        size={11}
                        className="text-[var(--color-ink-subtle)] flex-shrink-0"
                      />
                      <span className="text-[10px] font-medium text-[var(--color-ink-muted)] truncate">
                        {destination}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      router.push(`/dashboard/bookings/${booking.id}`)
                    }
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity flex-shrink-0"
                  >
                    Details
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   3-dot menu — isolated for local state (open/close + acting spinner).
   All trip actions live here per the "clean card face" decision.
────────────────────────────────────────────────────────────────────── */
import { useState } from "react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";

interface UpcomingRentalMenuProps {
  bookingId: number;
  isConfirmed: boolean;
  isPending: boolean;
  onAction: () => void | Promise<void>;
  onView: () => void;
}

function UpcomingRentalMenu({
  bookingId,
  isConfirmed,
  isPending,
  onAction,
  onView,
}: UpcomingRentalMenuProps) {
  const [open, setOpen] = useState(false);
  const [acting, setActing] = useState(false);

  const runAction = async (
    action: "activate" | "cancel",
    successMessage: string
  ) => {
    setOpen(false);
    setActing(true);
    try {
      if (action === "cancel") {
        await bookingsApi.cancel(bookingId, { reason: "agency_cancelled" });
      } else {
        await bookingsApi.activate(bookingId);
      }
      toast.success(successMessage);
      await onAction();
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Action failed. Try again.";
      toast.error(message);
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
        aria-label="Booking actions"
      >
        {acting ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <MoreVertical size={15} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-lg shadow-black/5 z-20 overflow-hidden animate-in fade-in slide-up duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onView();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <Eye size={15} /> View Booking
          </button>

          {isConfirmed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                runAction("activate", "Trip started — vehicle is now active");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"
            >
              <Play size={15} /> Start Trip
            </button>
          )}

          {(isPending || isConfirmed) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                runAction("cancel", "Booking cancelled");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-[var(--color-surface-border)]"
            >
              <XCircle size={15} /> Cancel Booking
            </button>
          )}
        </div>
      )}
    </>
  );
}

// src/components/dashboard/features/ReturningTodayTabContent.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Calendar, Clock, Car, MapPin, ChevronRight, Loader2, MoreVertical,
  CheckCircle2, XCircle, Eye, AlertTriangle,
} from "lucide-react";
import { useReturningTodayTab } from "@/hooks/dashboard/features/useReturningTodayTab";
import { bookingsApi } from "@/lib/api/bookings";

/* ──────────────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────────────── */

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
    if (make && model) return `${make} ${model}${plate ? ` • ${plate}` : ""}`;
    if (obj["full_name"]) return String(obj["full_name"]);
    if (obj["name"]) return String(obj["name"]);
  }
  return String(value);
};

const getInitials = (name?: string | null): string =>
  name
    ? name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "?";

const rentalDays = (start?: string | null, end?: string | null): number | null => {
  if (!start || !end) return null;
  const d = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
  return Number.isNaN(d) ? null : Math.max(1, d);
};

/** ✅ Timestamp-based return formatter — no midnight logic. */
const formatReturnTime = (dateStr: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

/** ✅ Relative-time label anchored to the scheduled return timestamp. */
const returnRelative = (dateStr: string, isOverdue: boolean): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr).getTime();
  if (Number.isNaN(d)) return "";
  const diff = d - Date.now();
  const abs = Math.abs(diff);

  const hours = Math.floor(abs / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  let core: string;
  if (hours === 0) core = `${minutes}m`;
  else if (hours < 24) core = minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  else core = `${Math.floor(hours / 24)}d`;

  return isOverdue ? `${core} overdue` : `in ${core}`;
};

/* ──────────────────────────────────────────────────────────────────────
   Main component
────────────────────────────────────────────────────────────────────── */

export default function ReturningTodayTabContent() {
  const router = useRouter();
  const { returns, loading, isOverdue, refetch } = useReturningTodayTab();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)]">
        <Loader2 size={24} className="animate-spin mb-3 text-[var(--color-primary)]" />
        <p className="text-sm font-medium">Loading returns...</p>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
          <CheckCircle2 size={24} />
        </div>
        <p className="text-sm font-bold text-[var(--color-ink)]">No returns due today</p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">
          Active trips returning within 24 hours will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-in fade-in duration-200">
      {returns.map((booking) => {
        const overdue = isOverdue(booking);
        const clientName =
          resolveField(booking.client, "full_name", "name") || "Customer";
        const vehicle = booking.vehicle;
        const plate = vehicle?.plate_number ?? null;
        const vehicleLabel = vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle";
        const days = rentalDays(booking.start_date, booking.end_date);
        const destination = resolveField(booking.destination, "name", "destination");
        const returnAt = booking.scheduled_return_at ?? booking.end_date;

        return (
          <div
            key={`returning-${booking.id}`}
            className={`group relative rounded-xl overflow-hidden border bg-[var(--color-surface)] hover:shadow-sm transition-all duration-200 ${
              overdue
                ? "border-rose-500/40 hover:border-rose-500/70"
                : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/40"
            }`}
          >
            <div className="p-3.5">
              {/* ── Row 1: Avatar + Client + 3-dot Menu ─────────────── */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-[var(--color-surface)] ${
                        overdue
                          ? "bg-gradient-to-br from-rose-500 to-rose-600"
                          : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                      }`}
                    >
                      {getInitials(clientName)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ring-2 ring-[var(--color-surface)] ${
                          overdue ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
                        {clientName}
                      </p>
                      {overdue && (
                        <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-extrabold uppercase tracking-wider border border-rose-500/20">
                          <AlertTriangle size={9} />
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Car size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
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

                <div className="relative flex-shrink-0">
                  <ReturningRentalMenu
                    bookingId={booking.id}
                    onAction={refetch}
                    onView={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  />
                </div>
              </div>

              {/* ── Row 2: Stats Grid (Return Time emphasized) ──────── */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)] leading-tight">
                      {days || 0}d
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] leading-tight">
                      Duration
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 col-span-2 justify-end">
                  <Clock
                    size={13}
                    className={overdue ? "text-rose-500 flex-shrink-0" : "text-[var(--color-ink-subtle)] flex-shrink-0"}
                  />
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold leading-tight truncate ${
                        overdue ? "text-rose-600 dark:text-rose-400" : "text-[var(--color-ink)]"
                      }`}
                    >
                      {formatReturnTime(returnAt)}
                    </p>
                    <p
                      className={`text-[10px] leading-tight font-semibold ${
                        overdue ? "text-rose-600 dark:text-rose-400" : "text-[var(--color-ink-muted)]"
                      }`}
                    >
                      {returnRelative(returnAt, overdue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Row 3: Status + Destination + Details ──────────── */}
              <div
                className={`mt-3 rounded-xl px-3 py-2.5 border ${
                  overdue
                    ? "bg-rose-500/10 border-rose-500/20"
                    : "bg-emerald-500/10 border-emerald-500/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        overdue ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wide ${
                        overdue
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {overdue ? "Overdue Return" : "Returning Soon"}
                    </span>
                  </div>

                  {destination && (
                    <div className="flex items-center gap-1 min-w-0 flex-1 justify-end px-2">
                      <MapPin size={11} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <span className="text-[10px] font-medium text-[var(--color-ink-muted)] truncate">
                        {destination}
                      </span>
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
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   3-dot menu — End Trip is the primary action; all actions live here.
────────────────────────────────────────────────────────────────────── */

interface ReturningRentalMenuProps {
  bookingId: number;
  onAction: () => void | Promise<void>;
  onView: () => void;
}

function ReturningRentalMenu({ bookingId, onAction, onView }: ReturningRentalMenuProps) {
  const [open, setOpen] = useState(false);
  const [acting, setActing] = useState(false);

  const runComplete = async () => {
    setOpen(false);
    setActing(true);
    try {
      await bookingsApi.complete(bookingId);
      toast.success("Trip completed");
      await onAction();
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Action failed. Try again.";
      toast.error(message);
    } finally {
      setActing(false);
    }
  };

  const runCancel = async () => {
    setOpen(false);
    setActing(true);
    try {
      await bookingsApi.cancel(bookingId, { reason: "agency_cancelled" });
      toast.success("Booking cancelled");
      await onAction();
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Action failed. Try again.";
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
        aria-label="Return actions"
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

          <button
            onClick={(e) => {
              e.stopPropagation();
              runComplete();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors border-t border-[var(--color-surface-border)]"
          >
            <CheckCircle2 size={15} /> End Trip
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              runCancel();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-[var(--color-surface-border)]"
          >
            <XCircle size={15} /> Cancel Booking
          </button>
        </div>
      )}
    </>
  );
}

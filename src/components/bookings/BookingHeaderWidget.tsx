"use client";

import React from "react";
import { 
  CheckCircle as CheckCircle2,
  Play, 
  Flag, 
  XCircle, 
  UserMinus as UserX,
  Archive, 
  ArrowCounterClockwise as RotateCcw,
  CircleNotch as Loader2,
  Calendar,
  Sparkle as Sparkles,
  ShieldCheck,
  Hash
} from "@phosphor-icons/react/ssr";
import { useBookingLifecycle } from "@/hooks/bookings/useBookingLifecycle";
import type { Booking } from "@/lib/types";

interface BookingHeaderWidgetProps {
  booking: Booking;
  onRefresh?: () => void;
}

export function BookingHeaderWidget({ booking, onRefresh }: BookingHeaderWidgetProps) {
  const {
    loadingAction,
    confirmBooking,
    activateBooking,
    completeBooking,
    cancelBooking,
    noShowBooking,
    archiveBooking,
    restoreBooking,
  } = useBookingLifecycle(booking, onRefresh);

  // Status Badge Styling Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "confirmed":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "completed":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "cancelled":
      case "no_show":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border-[var(--color-surface-border)]";
    }
  };

  const createdDate = new Date(booking.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Top Unboxed Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-ink-muted)] flex items-center gap-1">
              <Hash size={12} className="text-[var(--color-primary)]" aria-hidden="true" />
              Reservation Blueprint
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-surface-border)]" />
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={11} aria-hidden="true" /> Ledger Secured
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight font-mono">
              #{booking.booking_number || booking.id}
            </h1>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider border shadow-xs ${getStatusBadge(
                  booking.status
                )}`}
              >
                {booking.status === "active" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                )}
                {booking.status.replace("_", " ")}
              </span>

              {booking.is_archived && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                  Archived
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Timestamp Meta Tag */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-xs text-xs text-[var(--color-ink-muted)]">
          <Calendar size={14} className="text-[var(--color-primary)] shrink-0" aria-hidden="true" />
          <span>
            Booked on <strong className="text-[var(--color-ink)] font-mono">{createdDate}</strong>
          </span>
        </div>
      </div>

      {/* Primary Lifecycle Control Deck */}
      <div className="relative overflow-hidden p-4 sm:p-5 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Ambient Background Accent */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-[var(--color-primary)]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-ink)]">
          <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Sparkles size={16} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
              Lifecycle State Engine
            </p>
            <p className="text-xs font-bold text-[var(--color-ink)]">
              Available Transition Actions
            </p>
          </div>
        </div>

        {/* Dynamic Trigger Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* PENDING -> Confirm / Cancel */}
          {booking.status === "pending" && (
            <>
              <button
                onClick={confirmBooking}
                disabled={!!loadingAction}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] disabled:opacity-50"
              >
                {loadingAction === "confirm" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={15} aria-hidden="true" />
                )}
                <span>Confirm Booking</span>
              </button>
              <button
                onClick={cancelBooking}
                disabled={!!loadingAction}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-900 dark:hover:bg-rose-900/40 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loadingAction === "cancel" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <XCircle size={15} aria-hidden="true" />
                )}
                <span>Cancel</span>
              </button>
            </>
          )}

          {/* CONFIRMED -> Start Trip / No-Show / Cancel */}
          {booking.status === "confirmed" && (
            <>
              <button
                onClick={activateBooking}
                disabled={!!loadingAction}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50"
              >
                {loadingAction === "activate" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Play size={15} aria-hidden="true" />
                )}
                <span>Dispatch Vehicle</span>
              </button>
              <button
                onClick={noShowBooking}
                disabled={!!loadingAction}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loadingAction === "noShow" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <UserX size={15} aria-hidden="true" />
                )}
                <span>Flag No-Show</span>
              </button>
              <button
                onClick={cancelBooking}
                disabled={!!loadingAction}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loadingAction === "cancel" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <XCircle size={15} aria-hidden="true" />
                )}
                <span>Cancel</span>
              </button>
            </>
          )}

          {/* ACTIVE -> Complete Trip */}
          {booking.status === "active" && (
            <button
              onClick={completeBooking}
              disabled={!!loadingAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md shadow-purple-500/10 active:scale-[0.98] disabled:opacity-50"
            >
              {loadingAction === "complete" ? (
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                <Flag size={15} aria-hidden="true" />
              )}
              <span>Complete Charter</span>
            </button>
          )}

          {/* Archive / Restore Controls */}
          {booking.is_archived ? (
            <button
              onClick={restoreBooking}
              disabled={!!loadingAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-border)]/50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loadingAction === "restore" ? (
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                <RotateCcw size={15} aria-hidden="true" />
              )}
              <span>Restore Booking</span>
            </button>
          ) : (
            booking.status !== "active" && (
              <button
                onClick={archiveBooking}
                disabled={!!loadingAction}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loadingAction === "archive" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Archive size={15} aria-hidden="true" />
                )}
                <span>Archive</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingHeaderWidget;

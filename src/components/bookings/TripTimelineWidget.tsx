"use client";

import React from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  MapPin,
  Navigation,
  CheckCircle2,
  Timer,
  Sparkles,
} from "lucide-react";
import { useTripTimeline } from "@/hooks/bookings/useTripTimeline";
import type { Booking } from "@/lib/types";
import { formatDateShort } from "@/components/bookings/booking_list/constants";

interface TripTimelineWidgetProps {
  booking: Booking;
}

export function TripTimelineWidget({ booking }: TripTimelineWidgetProps) {
  const { nodes, totalDays, tripProgress, isOverdue } = useTripTimeline(booking);

  // Extract location nodes dynamically from booking if present, or fallback to telemetry defaults
  const pickupLocation = booking.pickup_location || "Main Operations Hub";
  const returnLocation = booking.return_location || "Main Operations Hub";

  return (
    <div className="relative overflow-hidden p-6 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-3xl shadow-sm space-y-6">
      {/* Subtle Background Lighting Accent */}
      <div className="absolute -top-12 -left-12 w-36 h-36 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-surface-border)] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-primary)]/5 text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-inner">
            <Timer size={22} />
            {booking.status === "active" && !isOverdue && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--color-surface)] animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Charter Schedule & Telemetry
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                <Sparkles size={10} /> Live Tracking
              </span>
            </div>
            <p className="text-base font-bold text-[var(--color-ink)] tracking-tight mt-0.5">
              Duration:{" "}
              <span className="text-[var(--color-primary)] font-mono font-extrabold">
                {totalDays} {totalDays === 1 ? "Day" : "Days"}
              </span>
            </p>
          </div>
        </div>

        {/* Dynamic Contextual Status Alert Tags */}
        <div className="flex items-center gap-2">
          {isOverdue && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border,#f87171)]/30 animate-pulse shadow-sm">
              <AlertTriangle size={15} />
              <span>Overdue Return</span>
            </div>
          )}

          {booking.status === "active" && !isOverdue && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>In Dispatch ({tripProgress}%)</span>
            </div>
          )}

          {booking.status === "completed" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <CheckCircle2 size={15} />
              <span>Charter Concluded</span>
            </div>
          )}
        </div>
      </div>

      {/* Vertical Tracking Line Node System */}
      <div className="relative pl-9 space-y-7 my-2">
        {/* Continuous Structural Background Tracking Line */}
        <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-[var(--color-surface-hover)] rounded-full" />

        {/* Live Active Progress Fill Line Overlay */}
        {booking.status === "active" && (
          <div
            className={`absolute left-[17px] top-3 w-0.5 transition-all duration-700 ease-out rounded-full ${
              isOverdue ? "bg-[var(--color-danger)]" : "bg-[var(--color-primary)]"
            }`}
            style={{ height: `${Math.min(tripProgress, 100)}%` }}
          />
        )}

        {nodes.map((node, idx) => {
          const isActiveNode = booking.status === "active" && node.type === "pickup";
          const locationText = node.type === "pickup" ? pickupLocation : returnLocation;

          return (
            <div key={idx} className="relative group">
              {/* Outer Glowing Tracker Node Sphere */}
              <div
                className={`absolute -left-[27px] top-0.5 w-5 h-5 rounded-full border-2 bg-[var(--color-surface)] flex items-center justify-center transition-all duration-300 ${
                  node.isCompleted
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.35)]"
                    : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)]"
                } ${isActiveNode ? "scale-125 ring-4 ring-[var(--color-primary)]/20" : ""}`}
              >
                {/* Node Center Icon */}
                {node.isCompleted ? (
                  <CheckCircle2 size={12} className="stroke-[3]" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
              </div>

              {/* Node Metadata Blueprint Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3.5 rounded-2xl bg-[var(--color-surface-hover)]/30 border border-[var(--color-surface-border)]/60 transition-all hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-hover)]/60">
                <div className="md:col-span-6 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold tracking-tight transition-colors ${
                        node.isCompleted ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"
                      }`}
                    >
                      {node.title}
                    </span>
                    {node.type === "pickup" ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Origin
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Destination
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-ink-muted)] font-medium flex items-center gap-1 truncate">
                    <MapPin size={12} className="text-[var(--color-primary)] shrink-0" />
                    <span className="truncate">{locationText}</span>
                  </p>
                </div>

                {/* Date & Time Pill Nodes */}
                <div className="md:col-span-6 flex flex-wrap items-center md:justify-end gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] font-mono text-[11px] font-semibold text-[var(--color-ink)] shadow-xs">
                    <Calendar size={13} className="text-[var(--color-primary)]" />
                    <span>{node.dateString}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] font-mono text-[11px] font-semibold text-[var(--color-ink)] shadow-xs">
                    <Clock size={13} className="text-[var(--color-primary)]" />
                    <span>{node.timeString}</span>
                  </div>
                  {/* ✅ LIFECYCLE: Show actual return time for completed bookings */}
                  {node.type === "dropoff" && booking.status === "completed" && booking.actual_return_at && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-[11px] font-semibold text-emerald-600 shadow-xs">
                      <CheckCircle2 size={13} />
                      <span>Actual: {formatDateShort(booking.actual_return_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Progress Tracker Bar */}
      {booking.status === "active" && (
        <div className="pt-3 border-t border-[var(--color-surface-border)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--color-ink-muted)]">
            <span className="flex items-center gap-1">
              <Navigation size={13} className="text-[var(--color-primary)]" /> Real-time Progress
            </span>
            <span className={isOverdue ? "text-[var(--color-danger)] font-bold" : "text-[var(--color-primary)]"}>
              {tripProgress}%
            </span>
          </div>
          <div className="w-full bg-[var(--color-surface-hover)] h-2 rounded-full overflow-hidden p-0.5 border border-[var(--color-surface-border)]">
            <div
              className={`h-full transition-all duration-700 rounded-full shadow-sm ${
                isOverdue ? "bg-[var(--color-danger)]" : "bg-gradient-to-r from-[var(--color-primary)] to-emerald-500"
              }`}
              style={{ width: `${Math.min(tripProgress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TripTimelineWidget;

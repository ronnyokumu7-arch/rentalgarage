"use client";

import Link from "next/link";
import { Clock, Wrench, CheckCircle2, Plus, AlertTriangle } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import type { VehicleDerivedStats } from "@/hooks/fleet/useVehicleDetail";
import { formatTimeRemaining } from "@/lib/fleet/time";
import { formatDateShort } from "@/components/bookings/booking_list/constants";

interface VehicleCurrentTripBannerProps {
  vehicle: Vehicle;
  stats: VehicleDerivedStats;
  onCreateBooking: () => void;
  onUpdateMileage: () => void;
  onReactivate: () => void;
}

export default function VehicleCurrentTripBanner({
  vehicle,
  stats,
  onCreateBooking,
  onUpdateMileage,
  onReactivate,
}: VehicleCurrentTripBannerProps) {
  const activeTrip = stats.activeTrip;

  // ─── ON TRIP ─────────────────────────────────────────────────────
  if (activeTrip) {
    const remaining = formatTimeRemaining(activeTrip.end_date, activeTrip.start_date);
    const isOverdue = remaining?.overdue ?? false;

    return (
      <div
        className={`rounded-2xl border p-4 sm:p-5 ${
          isOverdue
            ? "bg-rose-500/5 border-rose-500/30"
            : "bg-emerald-500/5 border-emerald-500/30"
        }`}
      >
        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isOverdue
                  ? "bg-rose-500/15 text-rose-500"
                  : "bg-emerald-500/15 text-emerald-500"
              }`}
            >
              <Clock size={18} />
            </div>
            <div className="min-w-0">
              <p
                className={`text-[11px] font-extrabold uppercase tracking-wider ${
                  isOverdue ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isOverdue ? "Overdue Return" : "On Trip"}
              </p>
              <p className="text-sm font-bold text-[var(--color-ink)] truncate">
                {activeTrip.client_name || "Client"} · {activeTrip.booking_number || `#${activeTrip.id}`}
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/bookings/${activeTrip.id}`}
            className="text-[11px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity flex-shrink-0"
          >
            View Booking →
          </Link>
        </div>

        {remaining && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-[var(--color-ink-muted)] mb-1.5 uppercase tracking-wider">
              <span>
                {formatDateShort(activeTrip.start_date)} → {formatDateShort(activeTrip.end_date)}
              </span>
              <span className={isOverdue ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                {remaining.text}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--color-surface-border)]/50 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isOverdue
                    ? "bg-gradient-to-r from-rose-400 to-rose-600"
                    : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                }`}
                style={{ width: `${remaining.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── SERVICE DUE / MAINTENANCE ─────────────────────────────────────
  if (vehicle.status === "maintenance" || stats.isDueForService || vehicle.mileage_due) {
    const isMaintenance = vehicle.status === "maintenance";
    const isService = stats.isDueForService;
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center flex-shrink-0">
              {isMaintenance ? <Wrench size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {isMaintenance ? "In Maintenance" : isService ? "Service Due Soon" : "Mileage Due"}
              </p>
              <p className="text-sm font-bold text-[var(--color-ink)] truncate">
                {isMaintenance
                  ? "Vehicle is being serviced"
                  : isService
                    ? `${vehicle.next_service_km?.toLocaleString()} km service threshold`
                    : "Log the return mileage to clear"}
              </p>
            </div>
          </div>
          {isMaintenance ? (
            <button
              onClick={onReactivate}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              Mark as Reactivated →
            </button>
          ) : (
            <button
              onClick={onUpdateMileage}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              Update Mileage →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── READY ─────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Ready for Booking
            </p>
            <p className="text-sm font-bold text-[var(--color-ink)] truncate">
              No active trip · No service flags
            </p>
          </div>
        </div>
        <button
          onClick={onCreateBooking}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors flex-shrink-0"
        >
          <Plus size={12} /> Create Booking
        </button>
      </div>
    </div>
  );
}

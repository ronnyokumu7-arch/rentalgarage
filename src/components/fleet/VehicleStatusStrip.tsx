// src/components/fleet/VehicleStatusStrip.tsx
"use client";

import { Gauge, Wrench, TrendingUp, Activity } from "lucide-react";
import type { VehicleDerivedStats } from "@/hooks/fleet/useVehicleDetail";
import type { Vehicle } from "@/lib/types";

interface VehicleStatusStripProps {
  vehicle: Vehicle;
  stats: VehicleDerivedStats;
}

export default function VehicleStatusStrip({ vehicle, stats }: VehicleStatusStripProps) {
  // Full 4-tile list (Status + 3 operational). Status is omitted on mobile
  // because the hero + On Trip banner already communicate it.
  const allTiles = [
    {
      id: "status",
      label: "Status",
      value:
        vehicle.status === "available" ? "Available"
          : vehicle.status === "rented" ? "Rented"
            : vehicle.status === "maintenance" ? "Maintenance"
              : vehicle.status === "pending_activation" ? "Pending"
                : "Retired",
      caption: "Current state",
      icon: Activity,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "mileage",
      label: "Mileage",
      value: `${vehicle.current_mileage.toLocaleString()} km`,
      caption: vehicle.next_service_km
        ? `${(vehicle.next_service_km - vehicle.current_mileage).toLocaleString()} km to service`
        : "No service threshold",
      icon: Gauge,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "service",
      label: "Next Service",
      value: vehicle.next_service_km
        ? `${vehicle.next_service_km.toLocaleString()} km`
        : "—",
      caption: stats.isDueForService
        ? "Due now"
        : stats.kmToService !== null
          ? `${stats.kmToService.toLocaleString()} km left`
          : "Not scheduled",
      icon: Wrench,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "utilization",
      label: "Utilization",
      value: `${stats.utilizationPct}%`,
      caption: `${stats.last30dBookings} trips / 30d`,
      icon: TrendingUp,
      color: "from-purple-500 to-indigo-600",
    },
  ];

  const mobileTiles = allTiles.filter((t) => t.id !== "status");

  return (
    <>
      {/* ✅ MOBILE: horizontal snap carousel — 2 full + peek of 3rd */}
      <div className="sm:hidden overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none">
        <div className="flex gap-2.5">
          {mobileTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                className="snap-start flex-shrink-0 w-[64%] bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    {tile.label}
                  </span>
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${tile.color} flex items-center justify-center`}>
                    <Icon size={12} className="text-white" />
                  </div>
                </div>
                <p className="text-base font-bold text-[var(--color-ink)] tabular-nums truncate leading-tight">
                  {tile.value}
                </p>
                <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5 truncate leading-tight">
                  {tile.caption}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ DESKTOP: 4-column grid — unchanged */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {allTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.id}
              className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-3 sm:p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                  {tile.label}
                </span>
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br ${tile.color} flex items-center justify-center`}>
                  <Icon size={12} className="text-white" />
                </div>
              </div>
              <p className="text-sm sm:text-base font-bold text-[var(--color-ink)] tabular-nums truncate">
                {tile.value}
              </p>
              <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5 truncate">
                {tile.caption}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

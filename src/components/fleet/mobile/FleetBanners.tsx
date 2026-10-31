// src/components/fleet/mobile/FleetBanners.tsx
"use client";

import { Shield, Wrench } from "lucide-react";
import type { Vehicle, VehicleStatus } from "@/lib/types";

interface FleetBannersProps {
  loading: boolean;
  pendingCount: number;
  mileageDueVehicles: Vehicle[];
  filteredVehicles: Vehicle[];
  statusFilter: VehicleStatus | "" | "mileage_due";
  setStatusFilter: (v: VehicleStatus | "" | "mileage_due") => void;
  hidden: boolean;
}

export default function FleetBanners({
  loading,
  pendingCount,
  mileageDueVehicles,
  filteredVehicles,
  statusFilter,
  setStatusFilter,
  hidden,
}: FleetBannersProps) {
  return (
    <div className={`px-3 ${hidden ? "hidden" : ""}`}>
      {!loading && pendingCount > 0 && statusFilter !== "pending_activation" && (
        <button
          type="button"
          onClick={() => setStatusFilter("pending_activation")}
          className="w-full flex items-center justify-start gap-2 py-3 px-1 text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity text-xs font-semibold"
        >
          <Shield size={14} />
          {pendingCount} {pendingCount === 1 ? "vehicle" : "vehicles"} awaiting activation
          <span className="opacity-70">→</span>
        </button>
      )}

      {!loading && statusFilter === "pending_activation" && (
        <div className="w-full flex items-center justify-between py-3 px-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <Shield size={14} />
            Viewing {filteredVehicles.length} pending{" "}
            {filteredVehicles.length === 1 ? "vehicle" : "vehicles"}
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className="text-[11px] font-bold px-2 py-1 rounded-md bg-blue-500/15 hover:bg-blue-500/25 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      {!loading && mileageDueVehicles.length > 0 && (statusFilter as any) !== "mileage_due" && (
        <button
          type="button"
          onClick={() => setStatusFilter("mileage_due" as any)}
          className="w-full flex items-center justify-start gap-2 py-3 px-1 text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity text-xs font-semibold"
        >
          <Wrench size={14} />
          {mileageDueVehicles.length}{" "}
          {mileageDueVehicles.length === 1 ? "vehicle" : "vehicles"} awaiting mileage
          <span className="opacity-70">→</span>
        </button>
      )}

      {!loading && (statusFilter as any) === "mileage_due" && (
        <div className="w-full flex items-center justify-between py-3 px-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <span className="flex items-center gap-2">
            <Wrench size={14} />
            Viewing {mileageDueVehicles.length} awaiting mileage
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter("")}
            className="text-[11px] font-bold px-2 py-1 rounded-md bg-blue-500/15 hover:bg-blue-500/25 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Car, Hash, Gauge } from "lucide-react";
import type { Vehicle } from "@/lib/types";

interface VehicleSearchProps {
  selectedVehicleId: string;
  vehicles: Vehicle[];          // filtered list — for dropdown
  allVehicles?: Vehicle[];      // ✅ full list — for display resolution
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelect: (vehicle: Vehicle) => void;
}

export default function VehicleSearch({
  selectedVehicleId,
  vehicles,
  allVehicles,
  searchQuery,
  onSearchChange,
  onSelect,
}: VehicleSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Resolve display from FULL list when available; fall back to filtered.
  // Prevents silent selection failure when the selected vehicle isn't in the
  // current filtered/sliced list (e.g. found via search then search cleared).
  const pool = allVehicles ?? vehicles;
  const selectedVehicle = pool.find((v) => v.id.toString() === selectedVehicleId);

  return (
    <div className="relative">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
        Vehicle <span className="text-[var(--color-danger)]">*</span>
      </label>

      {/* Search Input */}
      <div className="relative">
        <Car size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
        <input
          type="text"
          value={
            isOpen
              ? searchQuery
              : selectedVehicle
              ? `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.plate_number})`
              : searchQuery
          }
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by make, model, or plate..."
          className="w-full px-3 py-2 pl-8 pr-10 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
        />
        {selectedVehicle && !isOpen && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              onSelect({} as Vehicle);
            }}
            className="absolute right-2 top-2 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)]"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {vehicles.length === 0 ? (
            <div className="p-3 text-xs text-[var(--color-ink-muted)] text-center">
              No vehicles found
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => {
                    onSelect(vehicle);
                    setIsOpen(false);
                  }}
                  className="w-full p-3 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-left border border-transparent hover:border-[var(--color-surface-border)]"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-semibold text-sm text-[var(--color-ink)]">
                      {vehicle.make} {vehicle.model}
                    </div>
                    {selectedVehicleId === vehicle.id.toString() && (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center flex-shrink-0">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--color-ink-muted)]">
                    <div className="flex items-center gap-1">
                      <Hash size={10} />
                      <span className="font-mono">{vehicle.plate_number}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gauge size={10} />
                      <span>{vehicle.current_mileage.toLocaleString()} km</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-between pt-1 border-t border-[var(--color-surface-border)]">
                      <span className="text-[var(--color-primary)] font-bold">
                        KES {Number(vehicle.daily_rate).toLocaleString()}/day
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        vehicle.status === "available"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

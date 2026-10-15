"use client";

import { useState } from "react";
import { UserCircle, Phone, CreditCard, Car } from "lucide-react";
import type { DriverListItem } from "@/lib/types";

interface DriverSearchProps {
  selectedDriverId: string;
  drivers: DriverListItem[];       // filtered list — for dropdown
  allDrivers?: DriverListItem[];   // ✅ full list — for display resolution
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelect: (driver: DriverListItem) => void;
}

export default function DriverSearch({
  selectedDriverId,
  drivers,
  allDrivers,
  searchQuery,
  onSearchChange,
  onSelect,
}: DriverSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Resolve display from FULL list when available; fall back to filtered.
  const pool = allDrivers ?? drivers;
  const selectedDriver = pool.find((d) => d.id.toString() === selectedDriverId);

  const statusLabel = (status: string) => {
    switch (status) {
      case "available": return "Available";
      case "on_trip": return "On Trip";
      default: return status;
    }
  };

  return (
    <div className="relative">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
        Driver <span className="text-[10px] font-normal normal-case">(optional)</span>
      </label>

      {/* Search Input */}
      <div className="relative">
        <UserCircle size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
        <input
          type="text"
          value={
            isOpen
              ? searchQuery
              : selectedDriver
              ? `${selectedDriver.full_name} (${selectedDriver.phone})`
              : searchQuery
          }
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by name, phone, ID, or DL..."
          className="w-full px-3 py-2 pl-8 pr-10 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
        />
        {selectedDriver && !isOpen && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              onSelect({} as DriverListItem);
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
          {drivers.length === 0 ? (
            <div className="p-3 text-xs text-[var(--color-ink-muted)] text-center">
              No drivers available
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {drivers.map((driver) => (
                <button
                  key={driver.id}
                  type="button"
                  onClick={() => {
                    onSelect(driver);
                    setIsOpen(false);
                  }}
                  className="w-full p-3 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-left border border-transparent hover:border-[var(--color-surface-border)]"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-sm text-[var(--color-ink)]">
                        {driver.full_name}
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        driver.status === "available"
                          ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
                          : "bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]"
                      }`}>
                        {statusLabel(driver.status)}
                      </span>
                    </div>
                    {selectedDriverId === driver.id.toString() && (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--color-ink-muted)]">
                    <div className="flex items-center gap-1">
                      <Phone size={10} />
                      <span>{driver.phone}</span>
                    </div>
                    {driver.id_number_masked && (
                      <div className="flex items-center gap-1">
                        <CreditCard size={10} />
                        <span>ID {driver.id_number_masked}</span>
                      </div>
                    )}
                    {driver.dl_number_masked && (
                      <div className="flex items-center gap-1 col-span-2">
                        <Car size={10} />
                        <span>DL {driver.dl_number_masked}</span>
                      </div>
                    )}
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

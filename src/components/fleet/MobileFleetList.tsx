// src/components/fleet/MobileFleetList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Car, Archive, Shield, Loader2,
  Ban, Wrench, Gauge, User, CarFront,
  Clock, Banknote, Pencil, Plus, Search, CheckCircle2, Circle, X
} from "lucide-react";
import CardGrid, { RowAction } from "@/components/ui/CardGrid";
import type { Vehicle, VehicleStatus, Booking } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────────────── */

const statusLabels: Record<VehicleStatus, string> = {
  pending_activation: "Pending",
  available: "Available",
  rented: "Rented",
  maintenance: "Maintenance",
  retired: "Retired",
};

const formatPlate = (plate: string) =>
  plate.replace(/([A-Za-z])(\d)/, "$1 $2").toUpperCase();

const formatTimeRemaining = (endStr?: string | null): { text: string; overdue: boolean } | null => {
  if (!endStr) return null;
  const end = new Date(endStr).getTime();
  if (Number.isNaN(end)) return null;
  const diff = end - Date.now();
  const abs = Math.abs(diff);
  const hours = Math.floor(abs / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  if (abs < 60_000) return { text: "due now", overdue: diff < 0 };

  let core: string;
  if (hours === 0) core = `${minutes}m`;
  else if (hours < 24) core = minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  else {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    core = remHours === 0 ? `${days}d` : `${days}d ${remHours}h`;
  }

  return diff < 0
    ? { text: `${core} overdue`, overdue: true }
    : { text: `${core} left`, overdue: false };
};

/* ──────────────────────────────────────────────────────────────────────
   Props
────────────────────────────────────────────────────────────────────── */

interface MobileFleetListProps {
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: VehicleStatus | "" | "mileage_due";
  setStatusFilter: (v: VehicleStatus | "" | "mileage_due") => void;
  statusOptions: { label: string; value: string; count: number }[];
  activeTab: string;
  handleTabChange: (tab: string) => void;
  mobileTabs: { id: string; label: string; icon: React.ElementType }[];
  filteredVehicles: Vehicle[];
  activeRentals: Record<number, Booking>;
  setGarageVehicle: (v: Vehicle | null) => void;
  setGarageModalOpen: (open: boolean) => void;
  setPricingVehicle: (v: Vehicle | null) => void;
  setIsPricingModalOpen: (open: boolean) => void;
  setEditVehicle: (v: Vehicle | null) => void;
  setIsEditModalOpen: (open: boolean) => void;
  handleStatusAction: (id: number, action: string) => void;
  handleArchive: (id: number) => void;
  handleRetire: (id: number) => void;
  onAddVehicle: () => void;
}

export default function MobileFleetList({
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
  activeTab,
  handleTabChange,
  filteredVehicles,
  activeRentals,
  setGarageVehicle,
  setGarageModalOpen,
  setPricingVehicle,
  setIsPricingModalOpen,
  setEditVehicle,
  setIsEditModalOpen,
  handleStatusAction,
  handleArchive,
  handleRetire,
  onAddVehicle,
}: MobileFleetListProps) {
  const router = useRouter();

  const [selected, setSelected] = useState<Vehicle[]>([]);
  const isSelecting = selected.length > 0;

  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);

  // ✅ Ensure alphabetical sorting
  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      const aKey = `${a.make} ${a.model}`.toLowerCase();
      const bKey = `${b.make} ${b.model}`.toLowerCase();
      return aKey.localeCompare(bKey);
    });
  }, [filteredVehicles]);

  const clearSelection = () => {
    setSelected([]);
    longPressFired.current = false;
  };

  const toggleSelection = (vehicle: Vehicle) => {
    setSelected((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      if (exists) return prev.filter((v) => v.id !== vehicle.id);
      return [...prev, vehicle];
    });
  };

  const handleTouchStart = (vehicle: Vehicle) => (e: React.TouchEvent) => {
    longPressFired.current = false;
    const touch = e.touches[0];
    if (!touch) return;
    longPressStartPos.current = { x: touch.clientX, y: touch.clientY };

    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      if (!isSelecting) setSelected([vehicle]);
      else toggleSelection(vehicle);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(15);
      }
    }, 450);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!longPressTimer.current || !longPressStartPos.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = Math.abs(touch.clientX - longPressStartPos.current.x);
    const dy = Math.abs(touch.clientY - longPressStartPos.current.y);
    if (dx > 8 || dy > 8) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    if (!isSelecting) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-selection-zone]")) return;
      clearSelection();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSelecting]);

  const handleBatchArchive = () => {
    if (selected.length === 0) return;
    selected.forEach((v) => handleArchive(v.id));
    clearSelection();
  };

  const handleBatchMaintenance = () => {
    if (selected.length === 0) return;
    selected.forEach((v) => {
      if (v.status === "available") handleStatusAction(v.id, "maintenance");
    });
    clearSelection();
  };

  const handleBatchMileage = () => {
    if (selected.length === 0) return;
    setGarageVehicle(selected[0]);
    setGarageModalOpen(true);
    clearSelection();
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchFocused(false);
    searchInputRef.current?.blur();
  };

  const getVehicleActions = (vehicle: Vehicle): RowAction<Vehicle>[] => {
    const actions: RowAction<Vehicle>[] = [
      {
        label: "Vehicle Profile",
        icon: Car,
        onClick: () => router.push(`/dashboard/fleet/${vehicle.id}`),
      },
    ];

    if (vehicle.is_archived) {
      actions.push({
        label: "Restore Vehicle",
        icon: Archive,
        variant: "primary",
        onClick: () => handleStatusAction(vehicle.id, "restore"),
      });
      return actions;
    }

    actions.push({
      label: "Edit Details",
      icon: Pencil,
      variant: "default",
      onClick: () => {
        setEditVehicle(vehicle);
        setIsEditModalOpen(true);
      },
    });

    if (vehicle.status === "pending_activation") {
      const isInvestorAsset = !!vehicle.owner_id;
      actions.push({
        label: isInvestorAsset ? "Review & Set Pricing" : "Activate Vehicle",
        icon: Shield,
        variant: "primary",
        onClick: () => handleStatusAction(vehicle.id, "activate"),
      });
    } else if (vehicle.owner_id) {
      actions.push({
        label: "Edit Lease Agreement",
        icon: Banknote,
        variant: "default",
        onClick: () => {
          setPricingVehicle(vehicle);
          setIsPricingModalOpen(true);
        },
      });
    }

    if (vehicle.mileage_due || vehicle.status === "maintenance") {
      actions.push({
        label: "Update Mileage",
        icon: Wrench,
        variant: "default",
        onClick: () => {
          setGarageVehicle(vehicle);
          setGarageModalOpen(true);
        },
      });
    }

    if (vehicle.status === "maintenance") {
      actions.push({
        label: "Reactivate Vehicle",
        icon: Shield,
        variant: "primary",
        onClick: () => handleStatusAction(vehicle.id, "reactivate"),
      });
    }

    if (vehicle.status === "available") {
      actions.push({
        label: "Send to Maintenance",
        icon: Shield,
        variant: "default",
        onClick: () => handleStatusAction(vehicle.id, "maintenance"),
      });
    }

    actions.push(
      {
        label: "Quick Garage",
        icon: Wrench,
        variant: "default",
        separator: true,
        onClick: () => {
          setGarageVehicle(vehicle);
          setGarageModalOpen(true);
        },
      },
      {
        label: "Archive",
        icon: Archive,
        variant: "default",
        onClick: () => handleArchive(vehicle.id),
      },
      {
        label: "Retire",
        icon: Ban,
        variant: "danger",
        onClick: () => handleRetire(vehicle.id),
      }
    );

    return actions;
  };

  const pendingCount = statusOptions.find((o) => o.value === "pending_activation")?.count ?? 0;
  const pillOptions = statusOptions.filter(
    (opt) => opt.value !== "pending_activation" && opt.value !== "maintenance",
  );
  const garageCount = statusOptions.find((o) => o.value === "maintenance")?.count ?? 0;

  // ✅ Compute exact array for mileage due to bypass parent filtering issues
  const mileageDueVehicles = useMemo(
    () => sortedVehicles.filter((v) => v.mileage_due),
    [sortedVehicles],
  );

  // ✅ Determine which data to show based on the pseudo-filter
  const displayVehicles = (statusFilter as any) === "mileage_due" 
    ? mileageDueVehicles 
    : sortedVehicles;

  return (
    <div className="md:hidden animate-in fade-in duration-300 relative">
      {/* Toolbar */}
      <div className="py-3" data-selection-zone>
        {isSelecting ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                aria-label="Clear selection"
              >
                <X size={16} />
              </button>
              <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                {selected.length} selected
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleBatchMileage}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Update mileage"
                title="Update Mileage"
              >
                <Clock size={16} />
              </button>
              <button
                onClick={handleBatchMaintenance}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Send to maintenance"
                title="Send to Maintenance"
              >
                <Wrench size={16} />
              </button>
              <button
                onClick={handleBatchArchive}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Archive"
                title="Archive"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => setSearchFocused(false), 150);
                }}
                placeholder="Search make, model, plate..."
                className="w-full h-10 pl-9 pr-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
              />
              {search && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center hover:bg-[var(--color-surface-border)] transition-colors"
                  aria-label="Clear search"
                >
                  <X size={12} className="text-[var(--color-ink-muted)]" />
                </button>
              )}
            </div>

            <div className={`overflow-x-auto scrollbar-none transition-all duration-200 ${searchFocused ? "max-h-0 opacity-0 overflow-hidden" : "max-h-20 opacity-100"}`}>
              <div className="flex items-center gap-2 py-1">
                <button
                  onClick={() => setStatusFilter("")}
                  className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border ${
                    statusFilter === ""
                      ? "text-[var(--color-primary)] border-[var(--color-primary)]"
                      : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  All
                </button>
                {pillOptions.map((opt) => {
                  const isActive = statusFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setStatusFilter((opt.value || "") as VehicleStatus | "")
                      }
                      className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                        isActive
                          ? "text-[var(--color-primary)] border-[var(--color-primary)]"
                          : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {opt.label}
                      {isActive && (
                        <span className="text-[9px] font-extrabold tabular-nums text-[var(--color-primary)]">
                          {opt.count}
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => setStatusFilter("maintenance")}
                  className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                    statusFilter === "maintenance"
                      ? "text-[var(--color-primary)] border-[var(--color-primary)]"
                      : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <Wrench size={11} className="flex-shrink-0" />
                  Garage
                  {statusFilter === "maintenance" && (
                    <span className="text-[9px] font-extrabold tabular-nums text-[var(--color-primary)]">
                      {garageCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setStatusFilter("retired")}
                  className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                    statusFilter === "retired"
                      ? "text-[var(--color-primary)] border-[var(--color-primary)]"
                      : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  <Archive size={11} className="flex-shrink-0" />
                  Archived
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Banners — hidden during search focus or selection. NO border-t */}
      <div className={searchFocused || isSelecting ? "hidden" : ""}>
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
              Viewing {filteredVehicles.length} pending {filteredVehicles.length === 1 ? "vehicle" : "vehicles"}
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
            {mileageDueVehicles.length} {mileageDueVehicles.length === 1 ? "vehicle" : "vehicles"} awaiting mileage
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

      {loading ? (
        <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading vehicles...
        </div>
      ) : displayVehicles.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
            <Car size={24} className="text-[var(--color-ink-subtle)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No vehicles found</h3>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            {search || statusFilter
              ? "Try adjusting your search query or filters."
              : "Add your first vehicle to get started."}
          </p>
        </div>
      ) : (
        <CardGrid
          data={displayVehicles}
          getCardId={(v: Vehicle) => v.id}
          compact={true}
          onCardClick={(v: Vehicle) => {
            if (longPressFired.current) {
              longPressFired.current = false;
              return;
            }
            if (isSelecting) {
              toggleSelection(v);
              return;
            }
            const trigger = document.querySelector(
              `[data-card-actions="${v.id}"] button`,
            ) as HTMLButtonElement | null;
            trigger?.click();
          }}
          cardClassName={`!p-0 !rounded-none !border-0 !bg-transparent !shadow-none transition-colors [&_[data-card-actions]]:absolute [&_[data-card-actions]]:top-0 [&_[data-card-actions]]:right-0 [&_[data-card-actions]>button]:w-0 [&_[data-card-actions]>button]:h-0 [&_[data-card-actions]>button]:overflow-hidden [&_[data-card-actions]>button]:opacity-0`}
          containerClassName="!p-0"
          maxHeight={searchFocused ? "calc(100vh - 120px)" : "calc(100vh - 220px)"}
          renderCardHeader={({ item }: { item: Vehicle }) => {
            const kmToService = item.next_service_km
              ? item.next_service_km - item.current_mileage
              : null;
            const isDueForService = kmToService !== null && kmToService <= 500;
            const activeRental = activeRentals[item.id] || null;
            const isSelected = selected.some((v) => v.id === item.id);

            const needsAttention =
              item.status === "pending_activation" ||
              item.status === "maintenance" ||
              isDueForService ||
              item.mileage_due;
            const dot = needsAttention
              ? {
                  color: "bg-amber-500",
                  pulse: item.status === "maintenance",
                }
              : null;
            const showWrench =
              item.status === "maintenance" || isDueForService || item.mileage_due;

            return (
              <div
                data-selection-zone
                onTouchStart={handleTouchStart(item)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`flex items-start gap-3 w-full py-3 border-b border-[var(--color-surface-border)]/50 last:border-b-0 transition-colors ${
                  isSelected
                    ? "bg-[var(--color-primary)]/10"
                    : "hover:bg-[var(--color-surface-hover)]/40"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/15 flex items-center justify-center overflow-hidden">
                    <Car size={26} className="text-[var(--color-primary)]" />
                  </div>
                  {dot && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center ring-2 ring-[var(--color-surface)] shadow-sm ${dot.color} ${dot.pulse ? "animate-pulse" : ""}`}
                    >
                      {showWrench && (
                        <Wrench size={7} className="text-white" strokeWidth={3} />
                      )}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col h-16 justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                        {item.make} {item.model}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-[var(--color-ink-subtle)] tracking-wide flex-shrink-0">
                        {formatPlate(item.plate_number)}
                      </span>
                      {item.owner_id && (
                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" title="Investor Owned">
                          <User size={11} className="text-[var(--color-ink-subtle)]" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 min-w-0 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Gauge size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                        <span className="text-[10px] text-[var(--color-ink-muted)] font-mono font-semibold">
                          {item.current_mileage} KM
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wrench
                          size={10}
                          className={
                            isDueForService
                              ? "text-amber-500 flex-shrink-0"
                              : "text-[var(--color-ink-subtle)] flex-shrink-0"
                          }
                        />
                        <span
                          className={`text-[10px] font-mono font-semibold ${
                            isDueForService
                              ? "text-amber-600 dark:text-amber-400"
                              : item.next_service_km
                                ? "text-[var(--color-ink-muted)]"
                                : "text-[var(--color-ink-subtle)] italic font-sans"
                          }`}
                        >
                          {item.next_service_km
                            ? `${item.next_service_km} KM`
                            : "Not provided"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-[9px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
                        KES
                      </span>
                      <span className="text-[11px] font-bold text-[var(--color-ink)] tabular-nums">
                        {Number(item.daily_rate).toLocaleString()}
                      </span>
                      <span className="text-[9px] font-medium text-[var(--color-ink-muted)]">/day</span>
                    </div>
                  </div>

                  {activeRental && (() => {
                    const remaining = formatTimeRemaining(activeRental.end_date);
                    if (!remaining) return null;
                    return (
                      <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
                        <Clock
                          size={10}
                          className={remaining.overdue ? "text-rose-500" : "text-emerald-500"}
                        />
                        <span
                          className={`text-[10px] font-bold ${
                            remaining.overdue
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {remaining.text}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {isSelecting && (
                  <div className="flex-shrink-0 self-center pl-1">
                    {isSelected ? (
                      <CheckCircle2
                        size={22}
                        className="text-[var(--color-primary)]"
                        strokeWidth={2.25}
                      />
                    ) : (
                      <Circle
                        size={22}
                        className="text-[var(--color-ink-subtle)]"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          }}
          renderCardBody={() => null}
          rowActions={getVehicleActions}
          renderActionSheetBadge={(item: Vehicle) => {
            const kmToService = item.next_service_km
              ? item.next_service_km - item.current_mileage
              : null;
            const isDueForService = kmToService !== null && kmToService <= 500;

            let label = statusLabels[item.status] || "Ready";
            let tone: "success" | "warning" | "info" | "default" = "default";
            let dotColor = "bg-gray-400";

            if (item.is_archived) {
              label = "Archived";
            } else if (item.status === "maintenance" || isDueForService || item.mileage_due) {
              label = item.status === "maintenance"
                ? "In Garage"
                : isDueForService
                  ? "Service Due Soon"
                  : "Mileage Due";
              tone = "warning";
              dotColor = "bg-amber-500";
            } else if (item.status === "rented") {
              label = "On Trip";
              tone = "success";
              dotColor = "bg-emerald-500";
            } else if (item.status === "available") {
              label = "Ready for Booking";
              tone = "info";
              dotColor = "bg-blue-500";
            }

            return (
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider border ${
                  tone === "success"
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    : tone === "warning"
                      ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                      : tone === "info"
                        ? "text-blue-500 bg-blue-500/10 border-blue-500/20"
                        : "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                {label}
              </span>
            );
          }}
        />
      )}

      {!isSelecting && !searchFocused && (
        <div className="fixed right-4 bottom-20 z-40 flex flex-col items-end gap-3">
          <button
            type="button"
            onClick={() => handleTabChange(activeTab === "fleet" ? "garage" : "fleet")}
            aria-label={`Switch to ${activeTab === "fleet" ? "Garage" : "Vehicles"}`}
            className="w-12 h-12 rounded-xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-surface-border)] shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-surface-hover)]/90 transition-all"
          >
            {activeTab === "fleet" ? (
              <Wrench size={18} className="text-[var(--color-ink-muted)]" />
            ) : (
              <CarFront size={18} className="text-[var(--color-ink-muted)]" />
            )}
          </button>

          <button
            type="button"
            onClick={onAddVehicle}
            aria-label="Add Vehicle"
            className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/20 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-primary)]/30 transition-all"
          >
            <div className="relative flex items-center justify-center">
              <CarFront size={22} strokeWidth={2} className="text-[var(--color-primary)]" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-sm">
                <Plus size={10} strokeWidth={3.5} />
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

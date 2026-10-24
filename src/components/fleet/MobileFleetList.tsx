// src/components/fleet/MobileFleetList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Car, Archive, Shield, Loader2,
  Ban, Wrench, CarFront, Gauge,
  Banknote, Pencil, Plus, Search, CheckCircle2, Circle, X,
  SlidersHorizontal,
} from "lucide-react";
import CardGrid, { RowAction } from "@/components/ui/CardGrid";
import { getVehicleBodyIcon, getVehicleBrandLogoUrl } from "@/components/fleet/vehicle-avatar";
import type { Vehicle, VehicleStatus, Booking } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────────────── */

const formatPlate = (plate: string) => plate.toUpperCase();

const formatPrice = (amount: number | string) => {
  const num = Number(amount);
  return num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatMileage = (km: number) => km.toString();

/** 
 * ✅ Returns the outer ring color ONLY if the vehicle needs attention.
 * Returns null when the vehicle is available / retired / archived (no ring).
 * 
 * Attention states: rented, pending_activation, maintenance, mileage_due.
 */
const getStatusRingColor = (
  vehicle: Vehicle,
  isDueForService: boolean
): string | null => {
  if (vehicle.is_archived) return null;
  if (vehicle.status === "maintenance" || isDueForService || vehicle.mileage_due) {
    return "ring-amber-400/80";
  }
  if (vehicle.status === "rented") {
    return "ring-blue-400/80";
  }
  if (vehicle.status === "pending_activation") {
    return "ring-violet-400/80";
  }
  return null; // available / retired → no ring
};

/* ─────────────────────────────────────────────────────────────────────
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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [selected, setSelected] = useState<Vehicle[]>([]);
  const isSelecting = selected.length > 0;

  const [searchFocused, setSearchFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);

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

  const mileageDueVehicles = useMemo(
    () => sortedVehicles.filter((v) => v.mileage_due),
    [sortedVehicles],
  );

  const displayVehicles = (statusFilter as any) === "mileage_due"
    ? mileageDueVehicles
    : sortedVehicles;

  const hasActiveFilter = statusFilter !== "";

  return (
    <div className="md:hidden animate-in fade-in duration-300 relative">
      {/* TOOLBAR */}
      <div
        className="sticky top-0 z-20 bg-[var(--color-bg)] py-2"
        data-selection-zone
      >
        <div className="px-0">
          {isSelecting ? (
            <div className="flex items-center justify-between gap-2 px-3">
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
                >
                  <Wrench size={16} />
                </button>
                <button
                  onClick={handleBatchMaintenance}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label="Send to maintenance"
                >
                  <Wrench size={16} />
                </button>
                <button
                  onClick={handleBatchArchive}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label="Archive"
                >
                  <Archive size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center h-11 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] overflow-hidden transition-colors mx-0">
                <div className="relative flex-1 h-full">
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
                    placeholder="Search vehicle, plate, driver..."
                    className="w-full h-full pl-10 pr-2 bg-transparent text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] outline-none"
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

                <div className="pr-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiltersOpen((v) => !v);
                    }}
                    aria-label={filtersOpen ? "Hide filters" : "Show filters"}
                    aria-expanded={filtersOpen}
                    className={`relative h-8 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 ${
                      filtersOpen
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : hasActiveFilter
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15"
                          : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    {hasActiveFilter && !filtersOpen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                    )}
                  </button>
                </div>
              </div>

              {filtersOpen && !searchFocused && (
                <div className="relative animate-in slide-in-from-top-1 fade-in duration-200">
                  <div className="overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-2 py-1 px-3 pr-6">
                      <button
                        onClick={() => setStatusFilter("")}
                        className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border ${
                          statusFilter === ""
                            ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
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
                            className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border ${
                              isActive
                                ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setStatusFilter("maintenance")}
                        className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                          statusFilter === "maintenance"
                            ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        <Wrench size={11} className="flex-shrink-0" />
                        Garage
                      </button>
                    </div>
                  </div>

                  <div
                    className="pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Banners */}
      <div className={`px-3 ${searchFocused || isSelecting ? "hidden" : ""}`}>
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
        <div className="pb-4">
          {displayVehicles.map((item, index) => {
            const isSelected = selected.some((v) => v.id === item.id);
            const isDark = mounted && resolvedTheme === "dark";
            const brandLogoUrl = getVehicleBrandLogoUrl(item);

            const kmToService = item.next_service_km
              ? item.next_service_km - item.current_mileage
              : null;
            const isDueForService = kmToService !== null && kmToService <= 500;
            const needsMileageAttention = isDueForService || item.mileage_due || item.status === "maintenance";

            const statusDisplay = (() => {
              if (item.is_archived) return { label: "Archived", color: "text-[var(--color-ink-muted)]" };
              if (item.status === "maintenance") return { label: "Maintenance", color: "text-amber-600 dark:text-amber-400" };
              if (isDueForService || item.mileage_due) return { label: "Mileage due", color: "text-amber-600 dark:text-amber-400" };
              if (item.status === "rented") return { label: "Rented", color: "text-blue-600 dark:text-blue-400" };
              if (item.status === "available") return { label: "Available", color: "text-emerald-600 dark:text-emerald-400" };
              if (item.status === "pending_activation") return { label: "Pending", color: "text-violet-600 dark:text-violet-400" };
              return { label: "Retired", color: "text-[var(--color-ink-muted)]" };
            })();

            const MileageIcon = needsMileageAttention ? Wrench : Gauge;
            const mileageColorClass = needsMileageAttention
              ? "text-amber-600 dark:text-amber-400"
              : "text-[var(--color-ink-muted)]";

            const ringColor = getStatusRingColor(item, isDueForService);
            const BodyIcon = getVehicleBodyIcon(item);
            const needsAttention = Boolean(ringColor);

            return (
              <div
                key={item.id}
                data-selection-zone
                onTouchStart={handleTouchStart(item)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                  if (longPressFired.current) {
                    longPressFired.current = false;
                    return;
                  }
                  if (isSelecting) {
                    toggleSelection(item);
                    return;
                  }
                  const trigger = document.querySelector(`[data-card-actions="${item.id}"] button`) as HTMLButtonElement | null;
                  trigger?.click();
                }}
                className={`relative flex items-center gap-3 py-2.5 px-3 transition-all cursor-pointer select-none bg-[var(--color-surface)] first:rounded-t-2xl last:rounded-b-2xl ${
                  isSelected
                    ? "border-y border-[var(--color-primary)] bg-[var(--color-primary)]/[0.04]"
                    : "hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                {index !== displayVehicles.length - 1 && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[var(--color-surface-border)] to-transparent" />
                )}
                
                {/* 
                  ✅ Avatar Container:
                  - Squircle shape (w-20 h-14 rounded-xl)
                  - Feather-thin ring only on attention states
                  - Ring-offset for the WhatsApp gap effect
                */}
                <div
                  className={`relative w-20 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-[var(--color-surface)] ${
                    needsAttention
                      ? `ring-1 ring-offset-1 ring-offset-[var(--color-surface)] ${ringColor}`
                      : "border border-[var(--color-surface-border)]"
                  }`}
                >
                  {brandLogoUrl && !isDark ? (
                    <img
                      src={brandLogoUrl}
                      alt={item.make}
                      className="w-12 h-12 object-contain mix-blend-multiply"
                      loading="lazy"
                    />
                  ) : (
                    <BodyIcon size={28} className="text-[var(--color-ink-muted)]" strokeWidth={1.75} />
                  )}
                </div>

                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-base font-bold text-[var(--color-ink)] truncate tracking-tight">
                      {item.make} {item.model}
                    </h3>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-tight bg-[var(--color-surface-hover)] text-[var(--color-ink)] border border-[var(--color-surface-border)] flex-shrink-0">
                      {formatPlate(item.plate_number)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <MileageIcon size={11} className={`flex-shrink-0 ${mileageColorClass}`} strokeWidth={2.25} />
                    <span className={`text-[11px] font-mono font-semibold ${mileageColorClass}`}>
                      {formatMileage(item.current_mileage)} km
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] font-semibold text-[var(--color-ink-muted)]">KES</span>
                      <span className="text-[12px] font-bold text-[var(--color-ink)] tabular-nums">
                        {formatPrice(item.daily_rate)}
                      </span>
                    </div>

                    <div className={`text-[11px] font-bold tracking-wide ${statusDisplay.color}`}>
                      {statusDisplay.label}
                    </div>
                  </div>
                </div>

                {isSelecting && (
                  <div className="absolute top-3.5 left-3.5 z-10">
                    {isSelected ? (
                      <CheckCircle2 size={20} className="text-[var(--color-primary)] bg-white rounded-full" />
                    ) : (
                      <Circle size={20} className="text-[var(--color-ink-subtle)] bg-white rounded-full" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Hidden CardGrid to render action sheets */}
      <div className="hidden">
        <CardGrid
          data={displayVehicles}
          getCardId={(v: Vehicle) => v.id}
          compact={true}
          onCardClick={() => {}}
          cardClassName="!p-0"
          containerClassName="!p-0"
          renderCardHeader={() => <div className="hidden" />}
          renderCardBody={() => null}
          rowActions={getVehicleActions}
        />
      </div>

      {!isSelecting && !searchFocused && (
        <div
          data-fab-stack
          className="fixed right-4 bottom-[108px] z-[65] flex flex-col items-end gap-3"
        >
          {activeTab !== "fleet" && (
            <button
              type="button"
              onClick={() => handleTabChange("fleet")}
              aria-label="Back to Vehicles"
              className="w-12 h-12 rounded-xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-surface-border)] shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-surface-hover)]/90 transition-all"
            >
              <CarFront size={18} className="text-[var(--color-ink-muted)]" />
            </button>
          )}

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

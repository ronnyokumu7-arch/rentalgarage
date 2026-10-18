// src/components/fleet/MobileFleetList.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Car, Archive, Shield, Loader2,
  Ban, Wrench, Gauge, User,
  Filter, Clock, Banknote, Pencil,
} from "lucide-react";
import CardGrid, { RowAction } from "@/components/ui/CardGrid";
import MobilePageToolbar from "@/components/ui/MobilePageToolbar";
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

const dotSpec: Record<VehicleStatus, { color: string; pulse: boolean }> = {
  available: { color: "bg-emerald-500", pulse: false },
  pending_activation: { color: "bg-amber-500", pulse: false },
  rented: { color: "bg-emerald-500", pulse: false },
  maintenance: { color: "bg-amber-500", pulse: true },
  retired: { color: "bg-gray-400", pulse: false },
};

const formatPlate = (plate: string) => plate.replace(/([A-Za-z])(\d)/, "$1 $2").toUpperCase();

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
  statusFilter: VehicleStatus | "";
  setStatusFilter: (v: VehicleStatus | "") => void;
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
  // ✅ NEW: Edit details plumbing
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
  mobileTabs,
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

    // ✅ Edit Details — always available for non-archived vehicles
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

  return (
    <div className="md:hidden bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
      <div className="p-3 border-b border-[var(--color-surface-border)]">
        <MobilePageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search make, model, plate..."
          segment={activeTab}
          onSegmentChange={(value) => handleTabChange(value)}
          segments={mobileTabs}
          segmentMenuMode="toggle"
          segmentTriggerIcon={Wrench}
          filters={[
            {
              id: "fleet-status",
              label: "Status",
              options: statusOptions,
              value: statusFilter || null,
              onChange: (value) =>
                setStatusFilter((value || "") as VehicleStatus | ""),
              icon: Filter,
            },
          ]}
          primaryAction={
            <button
              onClick={onAddVehicle}
              className="w-full h-10 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.99]"
            >
              Add Vehicle
            </button>
          }
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading vehicles...
        </div>
      ) : filteredVehicles.length === 0 ? (
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
          data={filteredVehicles}
          getCardId={(v: Vehicle) => v.id}
          compact={true}
          onCardClick={(v: Vehicle) => router.push(`/dashboard/fleet/${v.id}`)}
          cardClassName="!p-0 !rounded-none !border-0 !bg-transparent !shadow-none hover:!bg-[var(--color-surface-hover)]/40 transition-colors"
          containerClassName="!p-0"
          maxHeight="calc(100vh - 180px)"
          renderCardHeader={({ item }: { item: Vehicle }) => {
            const kmToService = item.next_service_km
              ? item.next_service_km - item.current_mileage
              : null;
            const isDueForService = kmToService !== null && kmToService <= 500;
            const showWrench = item.status === "maintenance" || isDueForService || item.mileage_due;
            const activeRental = activeRentals[item.id] || null;
            const dot = dotSpec[item.status] || { color: "bg-gray-400", pulse: false };

            return (
              <div className="flex items-start gap-3 w-full py-3 px-4 pr-10">
                {/* Icon + status dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 flex items-center justify-center">
                    <Car size={18} className="text-[var(--color-primary)]" />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full flex items-center justify-center ring-2 ring-[var(--color-surface)] shadow-sm ${dot.color} ${dot.pulse ? "animate-pulse" : ""}`}
                  >
                    {showWrench && (
                      <Wrench size={6} className="text-white" strokeWidth={3} />
                    )}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Row 1: Name + investor icon */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                      {item.make} {item.model}
                    </span>
                    {item.owner_id && (
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" title="Investor Owned">
                        <User size={11} className="text-[var(--color-ink-subtle)]" />
                      </div>
                    )}
                  </div>

                  {/* Row 2: Price (with KES prefix) */}
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[9px] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
                      KES
                    </span>
                    <span className="text-[11px] font-bold text-[var(--color-ink)] tabular-nums">
                      {Number(item.daily_rate).toLocaleString()}
                    </span>
                    <span className="text-[9px] font-medium text-[var(--color-ink-muted)]">/day</span>
                  </div>

                  {/* Row 3: Countdown if on trip, else plate | mileage | service */}
                  {activeRental ? (() => {
                    const remaining = formatTimeRemaining(activeRental.end_date);
                    return remaining ? (
                      <div className="flex items-center gap-1.5 mt-1 min-w-0">
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
                        {activeRental.booking_number && (
                          <>
                            <span className="text-[10px] text-[var(--color-ink-subtle)]">|</span>
                            <span className="text-[9px] text-[var(--color-ink-muted)] font-mono truncate">
                              {activeRental.booking_number}
                            </span>
                          </>
                        )}
                      </div>
                    ) : null;
                  })() : (
                    <div className="flex items-center gap-2 mt-1 min-w-0 flex-wrap">
                      <span className="text-[10px] text-[var(--color-ink-muted)] font-mono font-semibold truncate">
                        {formatPlate(item.plate_number)}
                      </span>

                      <span className="text-[10px] text-[var(--color-ink-subtle)]">|</span>

                      <div className="flex items-center gap-1">
                        <Gauge size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                        <span className="text-[10px] text-[var(--color-ink-muted)] font-mono font-semibold">
                          {item.current_mileage} KM
                        </span>
                      </div>

                      {item.next_service_km && (
                        <>
                          <span className="text-[10px] text-[var(--color-ink-subtle)]">|</span>
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
                                  : "text-[var(--color-ink-muted)]"
                              }`}
                            >
                              {item.next_service_km} KM
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
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
                ? "In Maintenance"
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
    </div>
  );
}

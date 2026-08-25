// src/components/fleet/FleetList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Car, Archive, Shield, Coins, Loader2,
  Search, Filter, Ban, Wrench, Plus, Gauge, RectangleHorizontal,
  ChevronRight
} from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import type { Vehicle, VehicleStatus, Booking } from "@/lib/types";
import { formatDateShort } from "@/components/bookings/booking_list/constants";

interface FleetListProps {
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  statusFilter: VehicleStatus | "";
  setStatusFilter: (status: VehicleStatus | "") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  actionLoadingId: number | null;
  openDropdownId: number | null;
  setOpenDropdownId: (id: number | null) => void;
  setGarageVehicle: (v: Vehicle | null) => void;
  setGarageModalOpen: (open: boolean) => void;
  handleStatusAction: (id: number, action: string) => void;
  handleArchive: (id: number) => void;
  handleRetire: (id: number) => void;
  filteredVehicles: Vehicle[];
  paginatedVehicles: Vehicle[];
  totalPages: number;
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  mileageDueCount?: number;  // ✅ NEW: vehicles needing mileage logging
  activeRentals?: Record<number, Booking>;
}

// ✅ LIFECYCLE: awaiting_mileage removed (now 5 states)
const FLEET_FILTER_OPTIONS: { value: VehicleStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "pending_activation", label: "Pending Activation" },
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired", label: "Retired" },
];

const statusStyles: Record<VehicleStatus, { bg: string; text: string }> = {
  pending_activation: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  available: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  rented: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  maintenance: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  retired: { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" },
};

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

export default function FleetList({
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  pageSize,
  actionLoadingId: _actionLoading,
  openDropdownId: _openDropdownId,
  setOpenDropdownId: _setOpenDropdownId,
  setGarageVehicle,
  setGarageModalOpen,
  handleStatusAction,
  handleArchive,
  handleRetire,
  filteredVehicles,
  paginatedVehicles,
  totalPages,
  totalVehicles: _totalVehicles,
  availableVehicles,
  rentedVehicles,
  mileageDueCount = 0,
  activeRentals = {},
}: FleetListProps) {
  const router = useRouter();

  // ✅ LIFECYCLE: garage count now uses mileage_due flag + maintenance
  const garageVehiclesCount = useMemo(() => {
    return filteredVehicles.filter((v) => v.mileage_due || v.status === "maintenance").length;
  }, [filteredVehicles]);

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
    } else {
      if (vehicle.status === "pending_activation") {
        actions.push({
          label: "Activate Vehicle",
          icon: Shield,
          variant: "primary",
          onClick: () => handleStatusAction(vehicle.id, "activate"),
        });
      }

      // ✅ REMOVED: "End Trip" action (trip ending is now via booking complete,
      // which sets vehicle→available + mileage_due atomically)

      // ✅ LIFECYCLE: show "Update Mileage" for vehicles with mileage_due flag OR in maintenance
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
    }

    return actions;
  };

  const calculateTripProgress = (vehicleId: number): { progress: number; rental: Booking | null } => {
    const rental = activeRentals[vehicleId] || null;
    if (!rental || !rental.start_date || !rental.end_date) {
      return { progress: 0, rental: null };
    }

    const start = new Date(rental.start_date).getTime();
    const end = new Date(rental.end_date).getTime();
    const now = Date.now();

    if (now < start) {
      return { progress: 0, rental };
    }
    if (now > end) {
      return { progress: 1, rental };
    }
    return { progress: (now - start) / (end - start), rental };
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading vehicles...
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Available</span>
            <span className="text-xs font-bold text-blue-500 tabular-nums">{availableVehicles}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Rented</span>
            <span className="text-xs font-bold text-emerald-500 tabular-nums">{rentedVehicles}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Garage</span>
            <span className="text-xs font-bold text-amber-500 tabular-nums">{garageVehiclesCount}</span>
          </div>
          {mileageDueCount > 0 && (
            <>
              <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Mileage Due</span>
                <span className="text-xs font-bold text-orange-500 tabular-nums">{mileageDueCount}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:w-80">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search make, model, plate..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>

            <FilterDropdown
              filterId="fleet-status"
              label="Status"
              options={FLEET_FILTER_OPTIONS.filter((opt) => opt.value !== "")}
              value={statusFilter || null}
              onChange={(value) => setStatusFilter((value || "") as VehicleStatus | "")}
              icon={Filter}
            />
          </div>

          <button
            onClick={() => router.push("/dashboard/fleet/new")}
            className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Vehicle
          </button>
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
            <Car size={24} className="text-[var(--color-ink-subtle)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No vehicles found</h3>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            {search || statusFilter ? "Try adjusting your search query or filters." : "Add your first vehicle to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className="block md:hidden">
            <CardGrid
              data={paginatedVehicles}
              getCardId={(v) => v.id}
              compact={true}
              cardClassName="!p-2.5 hover:!border-[var(--color-primary)]/30 hover:shadow-md transition-all duration-200"
              containerClassName="px-2 pb-2"
              maxHeight="calc(100vh - 160px)"

              renderCardHeader={({ item }) => {
                const kmToService = item.next_service_km ? item.next_service_km - item.current_mileage : null;
                const isDueForService = kmToService !== null && kmToService <= 500;
                const showWrench = item.status === 'maintenance' || isDueForService || item.mileage_due;
                const showOnTrip = item.status === 'rented';
                const dot = dotSpec[item.status] || { color: "bg-gray-400", pulse: false };

                return (
                  <div
                    className="flex items-center justify-between w-full cursor-pointer"
                    onClick={() => router.push(`/dashboard/fleet/${item.id}`)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                          <Car size={14} className="text-[var(--color-primary)]" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5">
                          {showWrench ? (
                            <div className="w-3 h-3 rounded-full bg-amber-500/20 flex items-center justify-center ring-1 ring-[var(--color-surface)]">
                              <Wrench size={8} className="text-amber-500" />
                            </div>
                          ) : showOnTrip ? (
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 flex items-center justify-center ring-1 ring-[var(--color-surface)]">
                              <span className="text-[4px] font-extrabold text-emerald-500">OT</span>
                            </div>
                          ) : (
                            <div className={`w-2 h-2 rounded-full ${dot.color} ring-1 ring-[var(--color-surface)] ${
                              dot.pulse ? "animate-pulse" : ""
                            }`} />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[var(--color-ink)] truncate">
                            {item.make} {item.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5">
                            <RectangleHorizontal size={9} className="text-[var(--color-ink-subtle)]" />
                            <span className="text-[9px] text-[var(--color-ink-muted)] font-mono font-medium truncate">
                              {formatPlate(item.plate_number)}
                            </span>
                          </div>
                          <span className="text-[8px] text-[var(--color-ink-subtle)]">•</span>
                          <div className="flex items-center gap-0.5">
                            <Gauge size={9} className="text-[var(--color-primary)]" />
                            <span className="text-[9px] text-[var(--color-primary-text)] font-mono font-medium">
                              {item.current_mileage.toLocaleString()} KM
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={14} className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" />
                  </div>
                );
              }}

              renderCardBody={({ item }) => {
                const kmToService = item.next_service_km ? item.next_service_km - item.current_mileage : null;
                const isDueForService = kmToService !== null && kmToService <= 500;

                const { progress: tripProgress, rental: activeRental } = calculateTripProgress(item.id);

                return (
                  <div className="mt-1.5 pt-1.5 border-t border-[var(--color-surface-border)]/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Coins size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                            KES {Number(item.daily_rate).toLocaleString()}
                          </p>
                          <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                            Daily Rate
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Wrench size={10} className={`flex-shrink-0 ${
                          isDueForService ? 'text-amber-500' : 'text-[var(--color-ink-subtle)]'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                            {item.next_service_km ? `${item.next_service_km.toLocaleString()} KM` : "—"}
                          </p>
                          <span className="text-[8px] text-[var(--color-ink-muted)] font-medium">
                            {isDueForService ? '⚠️ Due Soon' : 'Next Service'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-[var(--color-surface-border)]/50">
                      {(item.status === 'rented' && activeRental) ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500">
                                🚗 On Trip
                              </span>
                              {activeRental.booking_number && (
                                <span className="text-[7px] text-[var(--color-ink-muted)] font-medium">
                                  • {activeRental.booking_number}
                                </span>
                              )}
                            </div>
                            <span className="text-[8px] font-medium text-[var(--color-ink-muted)] tabular-nums">
                              {Math.min(Math.round(tripProgress * 100), 100)}%
                            </span>
                          </div>
                          <div className="relative h-1.5 w-full rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out"
                              style={{ width: `${Math.min(tripProgress * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[7px] font-medium text-[var(--color-ink-muted)]">
                              {formatDateShort(activeRental.start_date)}
                            </span>
                            <span className="text-[7px] font-medium text-[var(--color-ink-muted)]">
                              {formatDateShort(activeRental.end_date)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end">
                          {item.status === 'maintenance' && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-amber-500">
                              ⚠️ In Maintenance
                            </span>
                          )}
                          {item.status === 'available' && !item.mileage_due && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                              ● Available
                            </span>
                          )}
                          {item.status === 'available' && item.mileage_due && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-orange-500">
                              📊 Mileage Due
                            </span>
                          )}
                          {item.status === 'pending_activation' && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-amber-500">
                              ⏳ Pending
                            </span>
                          )}
                          {item.status === 'retired' && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                              ● Retired
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}

              rowActions={getVehicleActions}
            />
          </div>

          <div className="hidden md:block">
            <DataTable
              data={paginatedVehicles}
              columns={[
                {
                  header: "Vehicle",
                  accessorKey: "make",
                  cell: ({ row }) => {
                    const v = row.original;
                    return (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                          <Car size={16} />
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/fleet/${v.id}`);
                            }}
                            className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
                          >
                            {v.make} {v.model}
                          </button>
                          <p className="text-xs text-[var(--color-ink-muted)] font-mono truncate">YOM-{v.year}</p>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  header: "Plate",
                  accessorKey: "plate_number",
                  cell: ({ row }) => (
                    <span className="text-sm font-semibold text-[var(--color-ink)] font-mono">
                      {formatPlate(row.original.plate_number)}
                    </span>
                  ),
                },
                {
                  header: "Rate",
                  accessorKey: "daily_rate",
                  cell: ({ row }) => (
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      KES {Number(row.original.daily_rate).toLocaleString()}
                    </span>
                  ),
                },
                {
                  header: "Status",
                  accessorKey: "status",
                  cell: ({ row }) => {
                    const v = row.original;
                    const isArchived = v.is_archived;
                    const displayStatus = isArchived ? "Archived" : statusLabels[v.status] || "Unknown";
                    const style = isArchived
                      ? { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" }
                      : statusStyles[v.status] || statusStyles.retired;

                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                        {displayStatus}
                        {/* ✅ LIFECYCLE: mileage_due badge on available vehicles */}
                        {v.mileage_due && v.status === "available" && (
                          <span className="ml-1 text-orange-500">📊</span>
                        )}
                      </span>
                    );
                  },
                },
                {
                  header: "Mileage",
                  accessorKey: "current_mileage",
                  cell: ({ row }) => (
                    <span className="font-mono text-sm text-[var(--color-ink)]">
                      {row.original.current_mileage.toLocaleString()} KM
                    </span>
                  ),
                },
                {
                  header: "Next Service",
                  accessorKey: "next_service_km",
                  cell: ({ row }) => (
                    <span className="font-mono text-sm text-[var(--color-ink-muted)]">
                      {row.original.next_service_km ? `${row.original.next_service_km.toLocaleString()} KM` : "—"}
                    </span>
                  ),
                },
              ]}
              rowActions={getVehicleActions}
              getRowId={(v) => v.id}
              onRowClick={(v) => router.push(`/dashboard/fleet/${v.id}`)}
              loading={loading}
              emptyMessage="No vehicles found"
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVehicles.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              viewMode="desktop"
            />
          </div>
        </>
      )}
    </>
  );
}

// src/components/fleet/DesktopFleetList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Car, Archive, Shield,
  Search, Filter, Ban, Wrench, Plus,
  User, Banknote,
} from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import type { Vehicle, VehicleStatus, Booking } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────
   Static config
────────────────────────────────────────────────────────────────────── */

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

const formatPlate = (plate: string) => plate.replace(/([A-Za-z])(\d)/, "$1 $2").toUpperCase();

/* ──────────────────────────────────────────────────────────────────────
   Props
────────────────────────────────────────────────────────────────────── */

interface DesktopFleetListProps {
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: VehicleStatus | "";
  setStatusFilter: (v: VehicleStatus | "") => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize: number;
  totalPages: number;
  filteredVehicles: Vehicle[];
  paginatedVehicles: Vehicle[];
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  mileageDueCount: number;
  activeRentals: Record<number, Booking>;
  setGarageVehicle: (v: Vehicle | null) => void;
  setGarageModalOpen: (open: boolean) => void;
  setPricingVehicle: (v: Vehicle | null) => void;
  setIsPricingModalOpen: (open: boolean) => void;
  handleStatusAction: (id: number, action: string) => void;
  handleArchive: (id: number) => void;
  handleRetire: (id: number) => void;
  onAddVehicle: () => void;
}

export default function DesktopFleetList({
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  pageSize,
  totalPages,
  filteredVehicles,
  paginatedVehicles,
  totalVehicles: _totalVehicles,
  availableVehicles,
  rentedVehicles,
  mileageDueCount = 0,
  setGarageVehicle,
  setGarageModalOpen,
  setPricingVehicle,
  setIsPricingModalOpen,
  handleStatusAction,
  handleArchive,
  handleRetire,
  onAddVehicle,
}: DesktopFleetListProps) {
  const router = useRouter();

  const garageVehiclesCount = useMemo(
    () => filteredVehicles.filter((v) => v.mileage_due || v.status === "maintenance").length,
    [filteredVehicles]
  );

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
    }

    return actions;
  };

  return (
    <div className="hidden md:block bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="hidden sm:flex items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
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
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Update Mileage</span>
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
              options={FLEET_FILTER_OPTIONS.filter((opt) => opt.value !== "").map((opt) => ({
                ...opt,
                count: filteredVehicles.filter((vehicle) => vehicle.status === opt.value).length,
              }))}
              value={statusFilter || null}
              onChange={(value) => setStatusFilter((value || "") as VehicleStatus | "")}
              icon={Filter}
            />
          </div>

          <button
            onClick={onAddVehicle}
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
            {search || statusFilter
              ? "Try adjusting your search query or filters."
              : "Add your first vehicle to get started."}
          </p>
        </div>
      ) : (
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
                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-2">
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
                        {v.owner_id && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded-md border border-purple-500/20 flex items-center gap-1 whitespace-nowrap">
                            <User size={8} /> Investor
                          </span>
                        )}
                      </div>
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
                const displayStatus = isArchived
                  ? "Archived"
                  : statusLabels[v.status] || "Unknown";
                const style = isArchived
                  ? { bg: "bg-[var(--color-surface-hover)]", text: "text-[var(--color-ink-muted)]" }
                  : statusStyles[v.status] || statusStyles.retired;

                return (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                    {displayStatus}
                    {v.mileage_due && v.status === "available" && (
                      <span className="ml-1 text-orange-500"></span>
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
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Car, Loader2, Search, Filter, Plus, Gauge, RectangleHorizontal, ChevronRight } from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import type { Vehicle, VehicleStatus } from "@/lib/types";

interface InvestorFleetListProps {
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  statusFilter: VehicleStatus | "";
  setStatusFilter: (status: VehicleStatus | "") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  filteredVehicles: Vehicle[];
  paginatedVehicles: Vehicle[];
  totalPages: number;
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
}

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

export default function InvestorFleetList({
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  pageSize,
  filteredVehicles,
  paginatedVehicles,
  totalPages,
  totalVehicles,
  availableVehicles,
  rentedVehicles,
}: InvestorFleetListProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading your vehicles...
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="hidden sm:flex items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Total</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalVehicles}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Available</span>
            <span className="text-xs font-bold text-blue-500 tabular-nums">{availableVehicles}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Rented</span>
            <span className="text-xs font-bold text-emerald-500 tabular-nums">{rentedVehicles}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:w-80">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search make, model, plate..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>

            <FilterDropdown
              filterId="investor-fleet-status"
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
            onClick={() => router.push("/investor/fleet/new")}
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
            {search || statusFilter ? "Try adjusting your search query or filters." : "Add your first vehicle to start earning."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card Grid */}
          <div className="block md:hidden">
            <CardGrid
              data={paginatedVehicles}
              getCardId={(v) => v.id}
              compact={true}
              showGlassEffect={true}
              cardClassName="!p-3 hover:!border-[var(--color-primary)]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300"
              containerClassName="px-2 pb-4"
              maxHeight="calc(100vh - 160px)"
              renderCardHeader={({ item }) => {
                const dot = dotSpec[item.status] || { color: "bg-gray-400", pulse: false };
                return (
                  <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => router.push(`/investor/fleet/${item.id}`)}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center shadow-md">
                          <Car size={16} className="text-[var(--color-primary)]" />
                        </div>
                        <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${dot.color} ring-2 ring-[var(--color-surface)] shadow-sm ${dot.pulse ? "animate-pulse" : ""}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">{item.make} {item.model}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-1">
                            <RectangleHorizontal size={10} className="text-[var(--color-ink-subtle)]" />
                            <span className="text-[10px] text-[var(--color-ink-muted)] font-mono font-semibold truncate">{formatPlate(item.plate_number)}</span>
                          </div>
                          <span className="text-[8px] text-[var(--color-ink-subtle)]">•</span>
                          <div className="flex items-center gap-1">
                            <Gauge size={10} className="text-[var(--color-primary)]" />
                            <span className="text-[10px] text-[var(--color-primary-text)] font-mono font-semibold">{item.current_mileage.toLocaleString()} KM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" />
                  </div>
                );
              }}
              renderCardBody={({ item }) => (
                <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold text-[var(--color-ink-subtle)] uppercase tracking-wider">Daily Rate</span>
                    </div>
                    <p className="text-base font-extrabold text-[var(--color-ink)] tabular-nums tracking-tight">KES {Number(item.daily_rate).toLocaleString()}</p>
                  </div>
                  <div className={`rounded-xl px-3 py-2.5 border ${item.status === 'maintenance' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[var(--color-surface-hover)]/50 border-[var(--color-surface-border)]/50'}`}>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dotSpec[item.status]?.color || 'bg-gray-400'} flex-shrink-0`} />
                      <span className="text-[10px] font-semibold text-[var(--color-ink-muted)]">{statusLabels[item.status] || 'Ready'}</span>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Desktop Data Table */}
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
                              router.push(`/investor/fleet/${v.id}`);
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
                    const style = statusStyles[v.status] || statusStyles.retired;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                        {statusLabels[v.status] || "Unknown"}
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
              ]}
              getRowId={(v) => v.id}
              onRowClick={(v) => router.push(`/investor/fleet/${v.id}`)}
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

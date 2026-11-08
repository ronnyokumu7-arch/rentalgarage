"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Car, Plus, Wrench, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle, VehicleStatus, VehicleUpdatePayload } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import QuickGarageModal from "@/components/ui/QuickGarageModal";
import TableToolbar from "@/components/ui/TableToolbar"; // ✅ Added for unified layout

type ViewMode = "active" | "vault";

const statusColors: Record<VehicleStatus, "success" | "accent" | "warning" | "neutral"> = {
  available: "success",
  rented: "accent",
  maintenance: "warning",
  retired: "neutral",
};

const statusLabels: Record<VehicleStatus, string> = {
  available: "Available",
  rented: "Rented",
  maintenance: "Maintenance",
  retired: "Retired",
};

// ✅ Filter options for the TableToolbar
const FLEET_FILTER_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired", label: "Retired" },
];

export default function FleetPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const [garageVehicle, setGarageVehicle] = useState<Vehicle | null>(null);
  const [garageModalOpen, setGarageModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await vehiclesApi.list();
      setVehicles(data);
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  const handleGarageSave = async (data: VehicleUpdatePayload) => {
    if (!garageVehicle) return;
    try {
      await vehiclesApi.update(garageVehicle.id, data);
      toast.success("Vehicle updated successfully");
      setGarageModalOpen(false);
      setGarageVehicle(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update vehicle");
    }
  };

  const filtered = useMemo(() => {
    let result = vehicles;
    
    if (view === "vault") {
      result = result.filter((v) => v.is_archived === true);
    } else {
      result = result.filter((v) => v.is_archived !== true);
    }

    if (statusFilter) {
      result = result.filter((v) => v.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.plate_number.toLowerCase().includes(q)
      );
    }

    return result;
  }, [vehicles, view, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "make",
      header: "Vehicle",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
              <Car size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{v.make} {v.model}</p>
              <p className="text-xs text-gray-500 truncate">{v.year}</p>
            </div>
          </div>
        );
      },
    },
    // ✅ NEW: Plate Number Column
    {
      accessorKey: "plate_number",
      header: "Plate Number",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900">
          {row.original.plate_number}
        </span>
      ),
    },
    {
      accessorKey: "daily_rate",
      header: "Daily Rate",
      cell: ({ row }) => (
        // ✅ Removed Banknote icon
        <span className="text-sm font-semibold text-gray-900">
          KES {Number(row.original.daily_rate).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status]} dot>
          {statusLabels[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "current_mileage",
      header: "Mileage",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-700">
          {row.original.current_mileage.toLocaleString()} km
        </span>
      ),
    },
    {
      accessorKey: "next_service_km",
      header: "Next Service",
      cell: ({ row }) => {
        const km = row.original.next_service_km;
        return (
          <span className="text-sm font-medium text-gray-700">
            {km ? `${km.toLocaleString()} km` : "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Manage",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/fleet/${v.id}`); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="View Vehicle"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setGarageVehicle(v); setGarageModalOpen(true); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
              title="Quick Garage"
            >
              <Wrench size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Fleet"
        subtitle="Manage your vehicles and maintenance"
        icon={Car}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Fleet" }]}
        actions={view === "active" ? [{ label: "Add Vehicle", icon: Plus, variant: "primary", onClick: () => router.push("/dashboard/fleet/new") }] : []}
      />

      <SectionCard padding={false}>
        {/* ✅ Replaced manual toolbar with TableToolbar to match Clients page */}
        <TableToolbar
          viewMode={view}
          onViewModeChange={setView}
          activeCount={vehicles.filter((v) => v.is_archived !== true).length}
          vaultCount={vehicles.filter((v) => v.is_archived === true).length}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search make, model, plate..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={FLEET_FILTER_OPTIONS}
          filterPlaceholder="All Statuses"
        />

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading vehicles...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Car}
            title={view === "active" ? "No vehicles found" : "No vehicles in vault"}
            description={
              search || statusFilter
                ? "Try adjusting your search or filters."
                : view === "active"
                ? "Add your first vehicle to get started."
                : "Archived vehicles will appear here."
            }
            action={
              view === "active" && !search && !statusFilter ? (
                <button className="btn btn-primary" onClick={() => router.push("/dashboard/fleet/new")}>
                  <Plus size={16} /> Add Vehicle
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <DataTable
              data={paginated}
              columns={columns}
              onRowClick={(vehicle) => router.push(`/dashboard/fleet/${vehicle.id}`)}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </SectionCard>

      <QuickGarageModal
        vehicle={garageVehicle}
        open={garageModalOpen}
        onClose={() => { setGarageModalOpen(false); setGarageVehicle(null); }}
        onSave={handleGarageSave}
      />
    </div>
  );
}

"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, ChevronRight, Plus, Car, User } from "lucide-react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Booking, BookingStatus, Client, Vehicle } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import TableToolbar from "@/components/ui/TableToolbar";
import Badge from "@/components/ui/Badge";

type ViewMode = "active" | "vault";

const statusColors: Record<BookingStatus, "warning" | "accent" | "success" | "neutral" | "danger"> = {
  pending: "warning",
  confirmed: "accent",
  active: "success",
  completed: "neutral",
  cancelled: "danger",
  no_show: "danger",
};

const statusLabels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

const BOOKING_FILTER_OPTIONS = [
  { value: "pending", label: "Pending (Quotes)" },
  { value: "confirmed", label: "Confirmed" },
  { value: "active", label: "Active Trips" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No Show" },
];

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Restored view state for the Active/Vault toolbar toggle
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsData, clientsData, vehiclesData] = await Promise.all([
        bookingsApi.list(),
        clientsApi.list(),
        vehiclesApi.list(),
      ]);
      setBookings(bookingsData);
      setClients(clientsData);
      setVehicles(vehiclesData);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map clients and vehicles for O(1) lookups in the table
  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    
    // ✅ Filter by Active/Vault view
    if (view === "active") {
      result = result.filter((b) => !b.is_archived);
    } else {
      result = result.filter((b) => b.is_archived);
    }

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => {
        const client = clientMap.get(b.client_id);
        const vehicle = vehicleMap.get(b.vehicle_id);
        return (
          b.id.toString().includes(q) ||
          client?.full_name.toLowerCase().includes(q) ||
          vehicle?.plate_number.toLowerCase().includes(q) ||
          vehicle?.make.toLowerCase().includes(q)
        );
      });
    }
    return result;
  }, [bookings, view, statusFilter, search, clientMap, vehicleMap]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "id",
      header: "Booking",
      cell: ({ row }) => {
        const b = row.original;
        const client = clientMap.get(b.client_id);
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <CalendarDays size={16} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink truncate">Booking #{b.id}</p>
              <p className="text-xs text-ink-muted flex items-center gap-1">
                <User size={10} /> {client?.full_name || `Client #${b.client_id}`}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "vehicle_id",
      header: "Vehicle",
      cell: ({ row }) => {
        const vehicle = vehicleMap.get(row.original.vehicle_id);
        return (
          <div className="flex items-center gap-2">
            <Car size={14} className="text-ink-muted" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${row.original.vehicle_id}`}
              </p>
              <p className="text-xs text-ink-muted">{vehicle?.plate_number || "—"}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "start_date",
      header: "Trip Dates",
      cell: ({ row }) => {
        const start = new Date(row.original.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const end = new Date(row.original.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return (
          <span className="text-sm text-ink-muted whitespace-nowrap">
            {start} — {end}
          </span>
        );
      },
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
      accessorKey: "total_amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-bold text-ink">
          {row.original.currency_code} {Number(row.original.total_amount).toLocaleString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Manage",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/bookings/${c.id}`);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="View Booking Profile"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="Manage quotations, rentals, and trip lifecycles"
        icon={CalendarDays}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bookings" }]}
        // ✅ FIXED: PageHeader expects an array of Action objects, not React elements
        actions={[
          {
            label: "New Booking",
            icon: Plus,
            variant: "primary",
            onClick: () => router.push("/dashboard/bookings/new"),
          },
        ]}
      />

      <SectionCard padding={false}>
        <TableToolbar
          viewMode={view}
          onViewModeChange={setView}
          activeCount={bookings.filter((b) => !b.is_archived).length}
          vaultCount={bookings.filter((b) => b.is_archived).length}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search ID, client, or plate..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={BOOKING_FILTER_OPTIONS}
          filterPlaceholder="All Statuses"
        />

        {loading ? (
          <div className="p-12 text-center text-ink-muted">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={view === "active" ? "No bookings found" : "No archived bookings"}
            description={
              search || statusFilter
                ? "Try adjusting your search or filters."
                : view === "active"
                ? "Create a new booking to generate a quotation and start the rental lifecycle."
                : "Archived bookings will appear here."
            }
          />
        ) : (
          <>
            <DataTable 
              data={paginatedBookings} 
              columns={columns} 
              // ✅ Restored row click for better UX
              onRowClick={(booking) => router.push(`/dashboard/bookings/${booking.id}`)} 
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBookings.length}
              pageSize={pageSize}
              // ✅ FIXED TYPO: onPageChang e -> onPageChange
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </SectionCard>
    </div>
  );
}

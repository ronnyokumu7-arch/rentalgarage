"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, CaretRight as ChevronRight, Money as Banknote } from "@phosphor-icons/react/ssr";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Booking, Vehicle } from "@/lib/types";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

const statusColors: Record<string, "warning" | "accent" | "success" | "neutral" | "danger"> = {
  pending: "warning", confirmed: "accent", active: "success", completed: "neutral", cancelled: "danger", no_show: "danger"
};
const statusLabels: Record<string, string> = {
  pending: "Pending", confirmed: "Confirmed", active: "Active", completed: "Completed", cancelled: "Cancelled", no_show: "No Show"
};

export default function ClientBookingsTab({ clientId }: { clientId: number }) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsData, vehiclesData] = await Promise.all([
          bookingsApi.list({ client_id: clientId }),
          vehiclesApi.list()
        ]);
        setBookings(bookingsData);
        setVehicles(vehiclesData);
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
  const totalPages = Math.ceil(bookings.length / pageSize);
  const paginated = bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "id",
      header: "Booking",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">#{row.original.id}</p>
          <p className="text-xs text-gray-500">{new Date(row.original.created_at).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      accessorKey: "vehicle_id",
      header: "Vehicle",
      cell: ({ row }) => {
        const vehicle = vehicleMap.get(row.original.vehicle_id);
        return (
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${row.original.vehicle_id}`}
            </p>
            <p className="text-xs text-gray-500 truncate">{vehicle?.plate_number || "No plate"}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "start_date",
      header: "Duration",
      cell: ({ row }) => {
        const start = new Date(row.original.start_date);
        const end = new Date(row.original.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div className="min-w-0">
            <p className="text-xs text-gray-500">{start.toLocaleDateString()} → {end.toLocaleDateString()}</p>
            <p className="text-xs font-medium text-gray-700">{days} days</p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusColors[row.original.status]} dot>{statusLabels[row.original.status]}</Badge>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
          <Banknote size={12} className="text-emerald-600" aria-hidden="true" />
          {new Intl.NumberFormat("en-US", { style: "currency", currency: row.original.currency_code, maximumFractionDigits: 0 }).format(row.original.total_amount)}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`/dashboard/bookings/${row.original.id}`)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          title="View Booking"
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center p-8"><Spinner size="sm" /></div>;

  return (
    <SectionCard className="!p-0 bg-white border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center gap-2">
        <Calendar size={16} className="text-gray-500" aria-hidden="true" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Rental History</h3>
      </div>
      {bookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">No bookings found for this client.</div>
      ) : (
        <>
          <DataTable data={paginated} columns={columns} />
          {totalPages > 1 && (
            <div className="p-3 border-t border-slate-100">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={bookings.length} pageSize={pageSize} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}

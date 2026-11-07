// src/components/bookings/booking_list/BookingsListDesktop.tsx
"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Phone, Check } from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import { getClientDisplayName } from "@/lib/client-name";
import type { Booking, Client, Vehicle } from "@/lib/types";
import { getBookingActions, type BookingActionsContext } from "./getBookingActions";
import { formatDateShort, statusStyles, statusLabels } from "./constants";

interface BookingsListDesktopProps {
  bookings: Booking[];
  clientMap: Map<number, Client>;
  vehicleMap: Map<number, Vehicle>;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  setCurrentPage: (p: number) => void;
  actionsCtx: Omit<BookingActionsContext, "routerPush">;
}

const getClient = (map: Map<number, Client>, id: number) => map.get(id) || map.get(Number(id));
const getVehicle = (map: Map<number, Vehicle>, id: number) => map.get(id) || map.get(Number(id));

export default function BookingsListDesktop({
  bookings, clientMap, vehicleMap, loading,
  currentPage, totalPages, totalItems, pageSize, setCurrentPage, actionsCtx,
}: BookingsListDesktopProps) {
  const router = useRouter();
  const fullCtx: BookingActionsContext = { ...actionsCtx, routerPush: (h) => router.push(h) };
  const getRowActions = (b: Booking) => getBookingActions(b, fullCtx);

  const columns = [
    {
      header: "Booking",
      accessorKey: "booking_number",
      cell: ({ row }: { row: { original: Booking } }) => {
        const booking = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] flex-shrink-0">
              <CalendarDays size={16} />
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/bookings/${booking.id}`); }}
                className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
              >
                {booking.booking_number || `BK-${booking.id}`}
              </button>
            </div>
          </div>
        );
      },
    },
    {
      header: "Client",
      accessorKey: "client_id",
      cell: ({ row }: { row: { original: Booking } }) => {
        const client = getClient(clientMap, row.original.client_id);
        return (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
              {getClientDisplayName(client?.full_name) || `Client #${row.original.client_id}`}
            </p>
            {client?.phone ? (
              <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1.5 truncate mt-0.5">
                <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                <span className="truncate font-medium">{client.phone}</span>
              </p>
            ) : (
              <p className="text-xs text-[var(--color-ink-subtle)] italic mt-0.5">No phone</p>
            )}
          </div>
        );
      },
    },
    {
      header: "Vehicle",
      accessorKey: "vehicle_id",
      cell: ({ row }: { row: { original: Booking } }) => {
        const vehicle = getVehicle(vehicleMap, row.original.vehicle_id);
        return (
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-ink)] truncate">
              {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${row.original.vehicle_id}`}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] font-mono">{vehicle?.plate_number || "—"}</p>
          </div>
        );
      },
    },
    {
      header: "Trip Dates",
      accessorKey: "start_date",
      cell: ({ row }: { row: { original: Booking } }) => (
        <p className="text-sm font-medium text-[var(--color-ink)] truncate whitespace-nowrap">
          {formatDateShort(row.original.start_date)} to {formatDateShort(row.original.end_date)}
        </p>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: { original: Booking } }) => {
        const booking = row.original;
        const style = statusStyles[booking.status] || statusStyles.completed;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
            {booking.status === "active" && <Check size={10} className="text-[var(--color-success)]" />}
            {statusLabels[booking.status] || booking.status}
          </span>
        );
      },
    },
    {
      header: "Amount",
      accessorKey: "total_amount",
      cell: ({ row }: { row: { original: Booking } }) => (
        <span className="text-sm font-bold text-[var(--color-ink)]">
          {row.original.currency_code} {Number(row.original.total_amount).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="hidden md:block">
      <DataTable
        data={bookings}
        columns={columns}
        rowActions={getRowActions}
        getRowId={(booking) => booking.id}
        onRowClick={(booking) => router.push(`/dashboard/bookings/${booking.id}`)}
        loading={loading}
        emptyMessage="No bookings found"
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        viewMode="desktop"
      />
    </div>
  );
}

// src/components/bookings/BookingsListUI.tsx
"use client";

import { useRouter } from "next/navigation";
import { Calendar, Plus, CalendarDays } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Booking } from "@/lib/types";
import type { ViewMode } from "@/hooks/bookings/useBookingsList";

import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import TableToolbar from "@/components/ui/TableToolbar";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { BookingStatusBadge } from "@/components/ui/Badge";
import ActionButtons from "@/components/ui/ActionButtons";

interface BookingsListUIProps {
  loading: boolean;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string | null;
  setStatusFilter: (s: string | null) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  filteredBookings: Booking[];
  paginatedBookings: Booking[];
  totalPages: number;
}

export default function BookingsListUI(props: BookingsListUIProps) {
  const router = useRouter();
  const {
    loading, view, setView, search, setSearch, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, filteredBookings, paginatedBookings, totalPages
  } = props;

  const columns: ColumnDef<Booking>[] = [
    { accessorKey: "booking_number", header: "Booking #", cell: ({ row }) => <span className="font-mono text-xs font-bold text-ink">{row.original.booking_number}</span> },
    { accessorKey: "start_date", header: "Trip Dates", cell: ({ row }) => (
      <div className="text-xs">
        <div className="font-medium text-ink">{new Date(row.original.start_date).toLocaleDateString()}</div>
        <div className="text-ink-subtle">to {new Date(row.original.end_date).toLocaleDateString()}</div>
      </div>
    )},
    { accessorKey: "destination", header: "Route", cell: ({ row }) => row.original.destination || row.original.pickup_location || "N/A" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <BookingStatusBadge status={row.original.status} /> },
    { accessorKey: "total_amount", header: "Amount", cell: ({ row }) => <span className="font-semibold text-ink">KES {row.original.total_amount.toLocaleString()}</span> },
    { id: "actions", header: "", cell: ({ row }) => <ActionButtons viewUrl={`/dashboard/bookings/${row.original.id}`} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle="Manage confirmed rental trips and lifecycle"
        icon={Calendar}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bookings" }]}
        actions={view === "active" ? [{ label: "New Quotation", icon: Plus, variant: "primary", onClick: () => router.push("/dashboard/quotations/new") }] : []}
      />

      <SectionCard padding={false}>
        <TableToolbar
          viewMode={view}
          onViewModeChange={setView}
          searchValue={search}
          onSearchChange={setSearch}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={[
            { value: "confirmed", label: "Confirmed" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
          ]}
          filterPlaceholder="All Statuses"
        />

        {loading ? (
          <div className="p-12 text-center text-ink-muted">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={view === "active" ? "No active bookings" : "No archived bookings"}
            description={search || statusFilter ? "Try adjusting your search or filters." : "Create a quotation and get it approved to see bookings here."}
          />
        ) : (
          <>
            <DataTable data={paginatedBookings} columns={columns} onRowClick={(b) => router.push(`/dashboard/bookings/${b.id}`)} />
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredBookings.length} pageSize={10} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </div>
  );
}

// src/components/bookings/booking_list/BookingsList.tsx
"use client";

import { CalendarDays, Loader2 } from "lucide-react";
import BookingsToolbar from "./BookingsToolbar";
import BookingsListMobile from "./BookingsListMobile";
import BookingsListDesktop from "./BookingsListDesktop";
import type { BookingsListProps } from "./types";

export default function BookingsList({
  bookingsData, clientMap, vehicleMap, isReferenceDataLoading, onExtendBooking,
}: BookingsListProps) {
  const {
    loading: bookingsLoading,
    search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage, pageSize,
    filteredBookings, paginatedBookings, totalPages,
    upcomingCount, activeTripsCount, completedCount,
    handleConfirm, handleStartTrip, handleCompleteTrip,
    handleCancel, handleNoShow, handleCopyContractLink,
    handleCopyQuotationLink, hasContract, hasQuotation, // ✅ NEW: quotation link + doc awareness
  } = bookingsData;

  // ✅ Shared actions context (router is supplied inside each view component)
  const actionsCtx = {
    onExtendBooking,
    handleConfirm, handleStartTrip, handleCompleteTrip,
    handleCancel, handleNoShow, handleCopyContractLink,
    handleCopyQuotationLink, hasContract, hasQuotation, // ✅ NEW: pass through to factory
  };

  const loading = bookingsLoading || isReferenceDataLoading;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300 font-sans">
      <BookingsToolbar
        search={search} setSearch={setSearch}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        upcomingCount={upcomingCount}
        activeTripsCount={activeTripsCount}
        completedCount={completedCount}
      />

      {loading ? (
        <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={24} className="text-[var(--color-ink-subtle)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No bookings found</h3>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">
            {search || statusFilter ? "Try adjusting your search query or filters." : "Create a new booking to start."}
          </p>
        </div>
      ) : (
        <>
          <BookingsListMobile
            bookings={paginatedBookings}
            clientMap={clientMap} vehicleMap={vehicleMap}
            actionsCtx={actionsCtx}
          />
          <BookingsListDesktop
            bookings={paginatedBookings}
            clientMap={clientMap} vehicleMap={vehicleMap}
            loading={loading}
            currentPage={currentPage} totalPages={totalPages}
            totalItems={filteredBookings.length} pageSize={pageSize}
            setCurrentPage={setCurrentPage}
            actionsCtx={actionsCtx}
          />
        </>
      )}
    </div>
  );
}

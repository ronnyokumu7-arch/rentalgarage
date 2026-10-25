// src/components/bookings/booking_list/BookingsList.tsx
"use client";

import { Loader2 } from "lucide-react";
import BookingsToolbar from "./BookingsToolbar";
import BookingsListMobile from "./BookingsListMobile";
import BookingsListDesktop from "./BookingsListDesktop";
import type { BookingsListProps } from "./types";

interface ExtendedBookingsListProps extends BookingsListProps {
  statusOptions: { label: string; value: string; count?: number }[];
  activeTab: string;
  handleTabChange: (tab: string) => void;
}

export default function BookingsList({
  bookingsData,
  clientMap,
  vehicleMap,
  isReferenceDataLoading,
  onExtendBooking,
  statusOptions,
  activeTab,
  handleTabChange,
}: ExtendedBookingsListProps) {
  const {
    loading: bookingsLoading,
    search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage, pageSize,
    filteredBookings, paginatedBookings, totalPages,
    upcomingCount, activeTripsCount, completedCount,
    handleConfirm, handleStartTrip, handleCompleteTrip,
    handleCancel, handleNoShow, handleCopyContractLink,
    handleCopyQuotationLink, hasContract, hasQuotation,
  } = bookingsData;

  const actionsCtx = {
    onExtendBooking,
    handleConfirm, handleStartTrip, handleCompleteTrip,
    handleCancel, handleNoShow, handleCopyContractLink,
    handleCopyQuotationLink, hasContract, hasQuotation,
  };

  const loading = bookingsLoading || isReferenceDataLoading;

  return (
    <div className="md:bg-[var(--color-surface)] md:rounded-2xl md:border md:border-[var(--color-surface-border)] md:shadow-[var(--shadow-card)] md:overflow-hidden animate-in fade-in duration-300 font-sans">
      <div className="hidden md:block">
        <BookingsToolbar
          search={search} setSearch={setSearch}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          upcomingCount={upcomingCount}
          activeTripsCount={activeTripsCount}
          completedCount={completedCount}
        />
      </div>

      {loading ? (
        <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading bookings...
        </div>
      ) : (
        <>
          {/* 
            ✅ Always render BookingsListMobile. 
            It has its own internal empty state that keeps the search bar 
            and filters visible even when filteredBookings.length === 0.
            Payment status is fetched internally via useBookingPayments().
          */}
          <BookingsListMobile
            bookings={filteredBookings}
            clientMap={clientMap}
            vehicleMap={vehicleMap}
            actionsCtx={actionsCtx}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusOptions={statusOptions}
            activeTab={activeTab}
            handleTabChange={handleTabChange}
          />
          
          <BookingsListDesktop
            bookings={paginatedBookings}
            clientMap={clientMap} 
            vehicleMap={vehicleMap}
            loading={loading}
            currentPage={currentPage} 
            totalPages={totalPages}
            totalItems={filteredBookings.length} 
            pageSize={pageSize}
            setCurrentPage={setCurrentPage}
            actionsCtx={actionsCtx}
          />
        </>
      )}
    </div>
  );
}

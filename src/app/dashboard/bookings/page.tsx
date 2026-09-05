// src/app/dashboard/bookings/page.tsx
"use client";

import { LayoutList, CalendarDays } from "lucide-react"; // ✅ Used in Sidebar
import { useMemo } from "react";

import BookingsList from "@/components/bookings/BookingsList";
import ExtendBookingModal from "@/components/bookings/ExtendBookingModal";
import FleetTimelineCalendar from "@/components/bookings/FleetTimelineCalendar";
import { Booking } from "@/lib/types";
import { useBookingsPage, TabMode } from "@/hooks/bookings/useBookingsPage";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

const TABS = [
  { id: "list", label: "Reservations", icon: LayoutList },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
];

export default function BookingsPage() {
  const {
    activeTab,
    setActiveTab,
    bookingsData,
    clientMap,
    vehicleMap,
    isRefDataLoading,
    isExtendModalOpen,
    selectedBooking,
    isExtending,
    openExtendModal,
    closeExtendModal,
    handleExtend,
    handleCreateBookingFromCalendar,
  } = useBookingsPage();

  // ✅ Dynamic Header Info (PREMIUM: Matches Sidebar Icons)
  const currentTabInfo = useMemo(() => {
    return activeTab === "list" 
      ? { 
          title: "Manage Bookings", 
          description: "Create new reservations, manage bookings, and handle extensions.", 
          icon: <LayoutList size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" /> 
        }
      : { 
          title: "Fleet Timeline Calendar", 
          description: "Real-time look at vehicle distribution, active reservations, and scheduling blocks.", 
          icon: <CalendarDays size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" /> 
        };
  }, [activeTab]);

  const bookingsArray = bookingsData.bookings || [];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* ── HEADER & PREMIUM TAB SWITCHER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {/* ✅ Bare Icon - No container */}
            {currentTabInfo.icon}
            
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight truncate">
              {currentTabInfo.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1 truncate sm:whitespace-normal">
            {currentTabInfo.description}
          </p>
        </div>

        {/* ✅ Imported Reusable Premium Tab Switcher */}
        <PremiumTabSwitcher 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={(tabId) => setActiveTab(tabId as TabMode)} 
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="w-full min-w-0 transition-opacity duration-150">
        {activeTab === "list" ? (
          // ✅ WRAPPED BookingsList in same card container as Fleet/Clients pages
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
            <BookingsList 
              bookingsData={bookingsData}
              clientMap={clientMap}
              vehicleMap={vehicleMap}
              isReferenceDataLoading={isRefDataLoading}
              onExtendBooking={openExtendModal}
            />
          </div>
        ) : (
          isRefDataLoading ? (
            <div className="h-48 sm:h-64 flex items-center justify-center text-xs sm:text-sm text-[var(--color-ink-muted)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)]">
              Loading calendar assets...
            </div>
          ) : (
            <FleetTimelineCalendar
              bookings={bookingsArray as Booking[]}
              vehicleMap={vehicleMap}
              clientMap={clientMap}
              onExtendBooking={openExtendModal}
              onCreateBooking={handleCreateBookingFromCalendar}
            />
          )
        )}
      </div>

      {/* ── MODALS ── */}
      <ExtendBookingModal
        open={isExtendModalOpen}
        onClose={closeExtendModal}
        booking={selectedBooking}
        onExtend={handleExtend}
        isLoading={isExtending}
      />
    </div>
  );
}

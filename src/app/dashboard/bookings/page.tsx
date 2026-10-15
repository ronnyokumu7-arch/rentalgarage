// src/app/dashboard/bookings/page.tsx
"use client";

import { LayoutList, CalendarDays, Filter } from "lucide-react";
import { useMemo } from "react";

import BookingsList from "@/components/bookings/BookingsList";
import ExtendBookingModal from "@/components/bookings/ExtendBookingModal";
import FleetTimelineCalendar from "@/components/bookings/FleetTimelineCalendar";
import { Booking } from "@/lib/types";
import { useBookingsPage, TabMode } from "@/hooks/bookings/useBookingsPage";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import MobilePageToolbar from "@/components/ui/MobilePageToolbar";
import MobileFloatingSegment from "@/components/ui/MobileFloatingSegment";
import NewBookingButton from "@/components/bookings/NewBookingButton";

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
          icon: <LayoutList size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
        }
      : {
          title: "Fleet Timeline Calendar",
          description: "Real-time look at vehicle distribution, active reservations, and scheduling blocks.",
          icon: <CalendarDays size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
        };
  }, [activeTab]);

  const bookingsArray = bookingsData.bookings || [];

  // ✅ Status filter options for the mobile toolbar
  const statusOptions = useMemo(
    () => [
      { label: "Pending", value: "pending", count: bookingsData.upcomingCount },
      { label: "Confirmed", value: "confirmed" },
      { label: "Active", value: "active", count: bookingsData.activeTripsCount },
      { label: "Completed", value: "completed", count: bookingsData.completedCount },
      { label: "Cancelled", value: "cancelled" },
      { label: "No Show", value: "no_show" },
      { label: "Awaiting Mileage", value: "awaiting_mileage" },
    ],
    [
      bookingsData.upcomingCount,
      bookingsData.activeTripsCount,
      bookingsData.completedCount,
    ]
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* ── HEADER & PREMIUM TAB SWITCHER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">{currentTabInfo.icon}</span>

            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight truncate">
              {currentTabInfo.title}
            </h1>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1 whitespace-normal break-words [overflow-wrap:anywhere]">
            {currentTabInfo.description}
          </p>
        </div>

        {/* ✅ DESKTOP ONLY — mobile uses the toolbar's calendar trigger / floating switcher */}
        <div className="hidden md:block">
          <PremiumTabSwitcher
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabMode)}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      {activeTab === "list" ? (
        <>
          {/* ✅ MOBILE: single card — toolbar + list share ONE container */}
          <div className="md:hidden bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
            {/* Toolbar row inside the card */}
            <div className="p-3 border-b border-[var(--color-surface-border)]">
              <MobilePageToolbar
                search={bookingsData.search}
                onSearchChange={bookingsData.setSearch}
                searchPlaceholder="Search bookings..."
                segment={activeTab}
                onSegmentChange={(value) => setActiveTab(value as TabMode)}
                segments={TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
                segmentMenuMode="toggle"
                segmentTriggerIcon={CalendarDays}
                filters={[
                  {
                    id: "booking-status",
                    label: "Status",
                    options: statusOptions,
                    value: bookingsData.statusFilter,
                    onChange: bookingsData.setStatusFilter,
                    icon: Filter,
                  },
                ]}
                primaryAction={<NewBookingButton />}
              />
            </div>

            {/* List inside the same card */}
            <BookingsList
              bookingsData={bookingsData}
              clientMap={clientMap}
              vehicleMap={vehicleMap}
              isReferenceDataLoading={isRefDataLoading}
              onExtendBooking={openExtendModal}
            />
          </div>

          {/* ✅ DESKTOP: existing card structure (unchanged) */}
          <div className="hidden md:block bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
            <BookingsList
              bookingsData={bookingsData}
              clientMap={clientMap}
              vehicleMap={vehicleMap}
              isReferenceDataLoading={isRefDataLoading}
              onExtendBooking={openExtendModal}
            />
          </div>
        </>
      ) : isRefDataLoading ? (
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
      )}

      {/* ─── FLOATING SEGMENT TOGGLE — Calendar tab only (mobile) ─── */}
      {activeTab === "calendar" && (
        <MobileFloatingSegment
          segments={TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
          active={activeTab}
          onChange={(id) => setActiveTab(id as TabMode)}
          toggleTarget="list"
          triggerIcon={CalendarDays}
        />
      )}

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

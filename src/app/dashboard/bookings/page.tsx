// src/app/dashboard/bookings/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { LayoutList, CalendarDays } from "lucide-react";

import BookingsList from "@/components/bookings/BookingsList";
import ExtendBookingModal from "@/components/bookings/ExtendBookingModal";
import FleetTimelineCalendar from "@/components/bookings/FleetTimelineCalendar";
import { Booking } from "@/lib/types";
import { useBookingsPage, TabMode } from "@/hooks/bookings/useBookingsPage";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import MobileFloatingSegment from "@/components/ui/MobileFloatingSegment";
import { useSetPageHeader } from "@/context/page-header-context";

const TABS = [
  { id: "list",     label: "Reservations", icon: LayoutList },
  { id: "calendar", label: "Calendar",     icon: CalendarDays },
];

const VALID_TABS = new Set<TabMode>(["list", "calendar"]);

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    const t = searchParams.get("tab") as TabMode | null;
    if (t && VALID_TABS.has(t) && t !== activeTab) {
      setActiveTab(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    if (!VALID_TABS.has(tabId as TabMode)) return;
    const next = tabId as TabMode;
    if (next === activeTab) return;
    setActiveTab(next);
    router.push(`/dashboard/bookings?tab=${next}`, { scroll: false });
  };

  const currentTabInfo = useMemo(() => {
    return activeTab === "list"
      ? {
          title: "Manage Bookings",
          mobileTitle: "Bookings",
          description:
            "Create new reservations, manage bookings, and handle extensions.",
          icon: (
            <LayoutList size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />
          ),
        }
      : {
          title: "Fleet Timeline Calendar",
          mobileTitle: "Calendar",
          description:
            "Real-time look at vehicle distribution, active reservations, and scheduling blocks.",
          icon: (
            <CalendarDays size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />
          ),
        };
  }, [activeTab]);

  // ✅ Drive the mobile top bar
  useSetPageHeader(currentTabInfo.mobileTitle, currentTabInfo.description);

  const bookingsArray = bookingsData.bookings || [];

  const statusOptions = useMemo(
    () => [
      { label: "Pending",          value: "pending",           count: bookingsData.upcomingCount },
      { label: "Confirmed",        value: "confirmed" },
      { label: "Active",           value: "active",            count: bookingsData.activeTripsCount },
      { label: "Completed",        value: "completed",         count: bookingsData.completedCount },
      { label: "Cancelled",        value: "cancelled" },
      { label: "No Show",          value: "no_show" },
      { label: "Awaiting Mileage", value: "awaiting_mileage" },
    ],
    [
      bookingsData.upcomingCount,
      bookingsData.activeTripsCount,
      bookingsData.completedCount,
    ],
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* DESKTOP-ONLY HEADER */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
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

        <div className="hidden md:block">
          <PremiumTabSwitcher
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "list" ? (
        <>
          {/* MOBILE — no card chrome. List owns its own fixed toolbar. */}
          <div className="md:hidden">
            <BookingsList
              bookingsData={bookingsData}
              clientMap={clientMap}
              vehicleMap={vehicleMap}
              isReferenceDataLoading={isRefDataLoading}
              onExtendBooking={openExtendModal}
              statusOptions={statusOptions}
              activeTab={activeTab}
              handleTabChange={handleTabChange}
            />
          </div>

          {/* DESKTOP — unchanged card */}
          <div className="hidden md:block bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
            <BookingsList
              bookingsData={bookingsData}
              clientMap={clientMap}
              vehicleMap={vehicleMap}
              isReferenceDataLoading={isRefDataLoading}
              onExtendBooking={openExtendModal}
              statusOptions={statusOptions}
              activeTab={activeTab}
              handleTabChange={handleTabChange}
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

      {activeTab === "calendar" && (
        <MobileFloatingSegment
          segments={TABS.map((t) => ({
            id: t.id,
            label: t.label,
            icon: t.icon,
          }))}
          active={activeTab}
          onChange={handleTabChange}
          toggleTarget="list"
          triggerIcon={CalendarDays}
        />
      )}

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

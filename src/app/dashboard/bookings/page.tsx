// src/app/dashboard/bookings/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { LayoutList, CalendarDays, Filter } from "lucide-react";

import BookingsList from "@/components/bookings/BookingsList";
import ExtendBookingModal from "@/components/bookings/ExtendBookingModal";
import FleetTimelineCalendar from "@/components/bookings/FleetTimelineCalendar";
import { Booking } from "@/lib/types";
import { useBookingsPage, TabMode } from "@/hooks/bookings/useBookingsPage";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import MobilePageToolbar from "@/components/ui/MobilePageToolbar";
import MobileFloatingSegment from "@/components/ui/MobileFloatingSegment";
import NewBookingButton from "@/components/bookings/NewBookingButton";

/* ──────────────────────────────────────────────────────────────────────
   Tabs config
────────────────────────────────────────────────────────────────────── */

const TABS = [
  { id: "list",     label: "Reservations", icon: LayoutList },
  { id: "calendar", label: "Calendar",     icon: CalendarDays },
];

const VALID_TABS = new Set<TabMode>(["list", "calendar"]);

/* ──────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────── */

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

  /* ✅ Hydrate FROM URL — deep links (search results, back/forward) land
     on the right tab. Fallback to "list" if tab is invalid or absent. */
  useEffect(() => {
    const t = searchParams.get("tab") as TabMode | null;
    if (t && VALID_TABS.has(t) && t !== activeTab) {
      setActiveTab(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ✅ Single source of tab-change — always syncs URL + hook state */
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
          description:
            "Create new reservations, manage bookings, and handle extensions.",
          icon: (
            <LayoutList
              size={28}
              strokeWidth={1.5}
              className="text-[var(--color-primary)]"
            />
          ),
        }
      : {
          title: "Fleet Timeline Calendar",
          description:
            "Real-time look at vehicle distribution, active reservations, and scheduling blocks.",
          icon: (
            <CalendarDays
              size={28}
              strokeWidth={1.5}
              className="text-[var(--color-primary)]"
            />
          ),
        };
  }, [activeTab]);

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
      {/* ── HEADER & DESKTOP TAB SWITCHER ── */}
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

        <div className="hidden md:block">
          <PremiumTabSwitcher
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      {activeTab === "list" ? (
        <>
          {/* MOBILE — single card, toolbar + list */}
          <div className="md:hidden bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
            <div className="p-3 border-b border-[var(--color-surface-border)]">
              <MobilePageToolbar
                search={bookingsData.search}
                onSearchChange={bookingsData.setSearch}
                searchPlaceholder="Search bookings..."
                segment={activeTab}
                onSegmentChange={handleTabChange}
                segments={TABS.map((t) => ({
                  id: t.id,
                  label: t.label,
                  icon: t.icon,
                }))}
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

            <BookingsList
              bookingsData={bookingsData}
              clientMap={clientMap}
              vehicleMap={vehicleMap}
              isReferenceDataLoading={isRefDataLoading}
              onExtendBooking={openExtendModal}
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

      {/* ✅ FLOATING SEGMENT — mobile only, only on calendar tab */}
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

// src/app/dashboard/bookings/page.tsx
"use client";

import { LayoutList, CalendarDays } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";

import BookingsList from "@/components/bookings/BookingsList";
import ExtendBookingModal from "@/components/bookings/ExtendBookingModal";
import FleetTimelineCalendar from "@/components/bookings/FleetTimelineCalendar";
import { Booking } from "@/lib/types";
import { useBookingsPage, TabMode } from "@/hooks/bookings/useBookingsPage";

const TABS = [
  { id: "list", label: "Reservations", icon: LayoutList },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
];

// ✅ REUSABLE: Premium Sliding Tab Switcher (Matches Financials/Clients)
function PremiumTabSwitcher({ activeTab, setActiveTab }: { activeTab: TabMode; setActiveTab: (tab: TabMode) => void }) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; top: number; height: number } | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        const containerRect = activeEl.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setIndicatorStyle({
            left: rect.left - containerRect.left,
            width: rect.width,
            top: rect.top - containerRect.top,
            height: rect.height,
          });
        }
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="relative w-full sm:w-auto">
      {/* Sliding Indicator Pill */}
      {indicatorStyle && (
        <div
          className="absolute z-0 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

      {/* Tab Container - No Scrollbar, Snap Centering */}
      <div 
        className="relative z-10 flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-hide snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              type="button"
              onClick={() => setActiveTab(tab.id as TabMode)}
              className={`
                relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 
                whitespace-nowrap touch-manipulation cursor-pointer snap-center flex-shrink-0
                ${isActive 
                  ? "text-[var(--color-ink)]" 
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]/50"
                }
              `}
            >
              <Icon size={isActive ? 16 : 14} className={`transition-all duration-300 ${isActive ? "text-[var(--color-primary)]" : "opacity-70"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Subtle bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-surface-border)]/50 -z-10" />
    </div>
  );
}

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

  const currentTabInfo = useMemo(() => {
    return activeTab === "list" 
      ? { title: "Manage Bookings", description: "Create new reservations, manage bookings, and handle extensions.", icon: <LayoutList size={18} className="sm:w-5 sm:h-5" /> }
      : { title: "Fleet Timeline Calendar", description: "Real-time look at vehicle distribution, active reservations, and scheduling blocks.", icon: <CalendarDays size={18} className="sm:w-5 sm:h-5" /> };
  }, [activeTab]);

  const bookingsArray = bookingsData.bookings || [];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* ── HEADER & PREMIUM TAB SWITCHER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
              {currentTabInfo.icon}
            </div>
            <span className="truncate">{currentTabInfo.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1 truncate sm:whitespace-normal">
            {currentTabInfo.description}
          </p>
        </div>

        {/* ✅ Premium Sliding Tab Switcher */}
        <PremiumTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
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

// src/components/calendar/FleetCalendar.tsx
"use client";

import { useState } from "react";
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight, Calendar as CalendarIcon, Car, CheckCircle as CheckCircle2, Funnel as Filter, X } from "@phosphor-icons/react/ssr";
import { useCalendar } from "@/hooks/bookings/useCalendar";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import type { Booking } from "@/lib/types";

export default function FleetCalendar() {
  const {
    currentDate, goToPrevMonth, goToNextMonth, goToToday,
    vehicles, selectedVehicleIds, toggleVehicle, bookingsByDay, loading
  } = useCalendar();

  const [_selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  // ✅ NEW: Mobile filter drawer state
  const [showFilter, setShowFilter] = useState(false);

  const monthYear = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[75vh] lg:min-h-[600px]">
      
      {/* ─── MOBILE: Filter Trigger Button (shown only on mobile) ─── */}
      <button
        onClick={() => setShowFilter(true)}
        className="lg:hidden flex items-center justify-between gap-3 w-full p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] hover:border-[var(--color-primary)]/40 transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <Filter size={16} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-[var(--color-ink)] truncate">
              {selectedVehicleIds.size} {selectedVehicleIds.size === 1 ? "vehicle" : "vehicles"} selected
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)] truncate">Tap to filter fleet</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-[var(--color-ink-subtle)] shrink-0" aria-hidden="true" />
      </button>

      {/* ─── MOBILE: Filter Drawer Overlay ─── */}
      {showFilter && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowFilter(false)}
          />
          {/* Slide-in Drawer */}
          <div className="lg:hidden fixed top-0 left-0 bottom-0 z-[9999] w-[85%] max-w-[320px] flex flex-col animate-in slide-in-from-left duration-300">
            {renderSidebar(true)}
          </div>
        </>
      )}

      {/* ─── DESKTOP: Pinned Sidebar (hidden on mobile unless drawer is open) ─── */}
      <div className="hidden lg:flex w-full lg:w-80 flex-shrink-0">
        {renderSidebar(false)}
      </div>

      {/* ─── MAIN CALENDAR AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — wraps to 2 lines on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--color-ink)] capitalize">{monthYear}</h2>
            <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl p-1 shadow-sm">
              <button 
                onClick={goToPrevMonth} 
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all duration-200"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button 
                onClick={goToToday} 
                className="px-3 py-1 text-xs font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] rounded-lg transition-all duration-200"
              >
                Today
              </button>
              <button 
                onClick={goToNextMonth} 
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all duration-200"
                aria-label="Next month"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] border border-[var(--color-surface-border)] w-fit">
            <CalendarIcon size={14} className="text-[var(--color-primary)]" aria-hidden="true" />
            <span className="text-xs font-semibold text-[var(--color-ink)]">{selectedVehicleIds.size}</span>
            <span className="text-xs text-[var(--color-ink-muted)]">selected</span>
          </div>
        </div>

        {/* Grid — flex-1 lets it fill remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <CalendarGrid
            currentDate={currentDate}
            bookingsByDay={bookingsByDay}
            vehicles={vehicles}
            onBookingClick={setSelectedBooking}
          />
        </div>
      </div>
    </div>
  );

  /* ────────────────────────────────────────────────────────────
     SHARED SIDEBAR RENDERER (used by both mobile drawer + desktop pinned)
     `isMobileDrawer=true` adds a close button to the header.
     ──────────────────────────────────────────────────────────── */
  function renderSidebar(isMobileDrawer: boolean) {
    return (
      <div className="w-full flex-shrink-0 bg-[var(--color-surface)] rounded-r-none lg:rounded-2xl lg:border border-[var(--color-surface-border)] flex flex-col shadow-[var(--shadow-card)] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[var(--color-surface-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)]/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shadow-sm shrink-0">
                <Car size={20} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-[var(--color-ink)] truncate">Fleet Filter</h2>
                <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5 truncate">Select vehicles to display</p>
              </div>
            </div>
            {isMobileDrawer && (
              <button
                onClick={() => setShowFilter(false)}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors shrink-0"
                aria-label="Close filter"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {vehicles.map((v) => {
            const isActive = selectedVehicleIds.has(v.id);
            return (
              <button
                key={v.id}
                onClick={() => toggleVehicle(v.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 text-left group ${
                  isActive
                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/40 shadow-sm"
                    : "bg-[var(--color-surface)] border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-hover)]/50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full transition-all ${
                    isActive 
                      ? "bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)]" 
                      : "bg-[var(--color-ink-subtle)]"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate transition-colors ${
                      isActive ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]"
                    }`}>
                      {v.plate_number}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-subtle)] truncate mt-0.5">
                      {v.make} {v.model}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <div className="flex-shrink-0 ml-2">
                    <CheckCircle2 size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
          <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4">Booking Status</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-[var(--color-warning-bg)] border border-[var(--color-warning)]/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)]" />
              </div>
              <span className="text-[11px] font-medium text-[var(--color-ink-muted)]">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
              </div>
              <span className="text-[11px] font-medium text-[var(--color-ink-muted)]">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-[var(--color-success-bg)] border border-[var(--color-success)]/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
              </div>
              <span className="text-[11px] font-medium text-[var(--color-ink-muted)]">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" />
              </div>
              <span className="text-[11px] font-medium text-[var(--color-ink-muted)]">Cancelled</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
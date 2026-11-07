"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format, isToday as checkIsToday, startOfDay, endOfDay, isBefore } from "date-fns";
import {
  Car,
  User,
  MagnifyingGlass as Search,
  Calendar,
  Phone,
  Check,
  Gauge,
  Wrench,
  CalendarDots as CalendarDays,
  Pulse as Activity
} from "@phosphor-icons/react/ssr";
import type { Vehicle, Booking, Client, BookingClientRelation } from "@/lib/types";
import { getClientDisplayName } from "@/lib/client-name";

import TimelineHeader from "./timeline/TimelineHeader";
import { useTimelineCalendar } from "@/hooks/bookings/timeline/useTimelineCalendar";

interface FleetTimelineCalendarProps {
  bookings: Booking[];
  vehicleMap: Record<number, Vehicle> | Map<number, Vehicle> | Vehicle[];
  clientMap: Record<number, Client> | Map<number, Client> | Client[];
  onExtendBooking: (booking: Booking) => void;
  onCreateBooking: (payload: {
    vehicleId: number;
    startDate: string;
    endDate: string;
    clientId: number;
  }) => Promise<void>;
}

interface TooltipState {
  booking: Booking;
  client?: Client | BookingClientRelation | null;
  x: number;
  y: number;
}

export default function FleetTimelineCalendar({
  bookings = [],
  vehicleMap = {},
  clientMap = {},
  onExtendBooking,
  onCreateBooking,
}: FleetTimelineCalendarProps) {
  const {
    viewStartDate,
    viewEndDate,
    timelineDays,
    normalizedVehicles,
    normalizedClients,
    isCreateMode,
    schedulingStep,
    selectedStartDate,
    selectedEndDate,
    selectedClientId,
    setSelectedClientId,
    handleToggleCreateMode,
    handleCellClick,
    handleFinalizeBooking,
    getCellHighlightClass,
    shiftWindow,
    jumpToToday,
  } = useTimelineCalendar({ bookings, vehicleMap, clientMap, onCreateBooking });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    normalizedVehicles[0]?.id || null
  );
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Enable smooth mouse wheel horizontal scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const filteredVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return normalizedVehicles;
    const term = vehicleSearch.toLowerCase();
    return normalizedVehicles.filter(
      (v) =>
        v.make?.toLowerCase().includes(term) ||
        v.model?.toLowerCase().includes(term) ||
        v.plate_number?.toLowerCase().includes(term)
    );
  }, [normalizedVehicles, vehicleSearch]);

  const totalVehicles = normalizedVehicles.length;
  const vehiclesWithBookings = normalizedVehicles.filter((v) =>
    bookings.some((b) => b.vehicle_id === v.id)
  ).length;
  const availableVehicles = normalizedVehicles.filter((v) => v.status === "available").length;
  const fleetUtilizationRate =
    totalVehicles > 0 ? Math.round((vehiclesWithBookings / totalVehicles) * 100) : 0;

  const selectedVehicle = normalizedVehicles.find((v) => v.id === selectedVehicleId);
  const selectedVehicleBookings = bookings.filter((b) => b.vehicle_id === selectedVehicleId);

  const viewStart = new Date(viewStartDate);
  const viewEnd = new Date(viewEndDate);
  const totalDaysInView =
    Math.ceil((viewEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  let rentedDays = 0;
  selectedVehicleBookings.forEach((booking) => {
    const bookingStart = new Date(booking.start_date);
    const bookingEnd = new Date(booking.end_date);
    const overlapStart = new Date(Math.max(viewStart.getTime(), bookingStart.getTime()));
    const overlapEnd = new Date(Math.min(viewEnd.getTime(), bookingEnd.getTime()));
    if (overlapStart <= overlapEnd) {
      const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      rentedDays += days;
    }
  });

  const vehicleUtilizationRate =
    totalDaysInView > 0 ? Math.round((rentedDays / totalDaysInView) * 100) : 0;

  const getBookingBlockStyle = (status: string, isPast: boolean) => {
    const base = "w-[88%] h-[75%] rounded-[6px] border flex items-center justify-center transition-all duration-200 hover:scale-105 hover:z-10 cursor-pointer relative overflow-hidden";
    const pastPattern = isPast 
      ? "opacity-70 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.15)_4px,rgba(0,0,0,0.15)_8px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.1)_4px,rgba(255,255,255,0.1)_8px)]"
      : "opacity-100";

    switch (status?.toLowerCase()) {
      case "active":
        return `${base} ${pastPattern} bg-[var(--color-bar-success)] text-[var(--color-bar-success-text)] border-[var(--color-bar-success-border)]`;
      case "confirmed":
      case "scheduled":
        return `${base} ${pastPattern} bg-[var(--color-bar-primary)] text-[var(--color-bar-primary-text)] border-[var(--color-bar-primary-border)]`;
      case "pending":
        return `${base} ${pastPattern} bg-[var(--color-bar-warning)] text-[var(--color-bar-warning-text)] border-[var(--color-bar-warning-border)]`;
      case "cancelled":
      case "no_show":
        return `${base} bg-[var(--color-bar-danger)] text-[var(--color-bar-danger-text)] border-[var(--color-bar-danger-border)] opacity-60`;
      default:
        return `${base} bg-[var(--color-surface)] text-[var(--color-ink)] border-[var(--color-surface-border)]`;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-[var(--color-bar-success)]";
      case "confirmed": 
      case "scheduled": return "bg-[var(--color-bar-primary)]";
      case "pending": return "bg-[var(--color-bar-warning)]";
      default: return "bg-[var(--color-bar-danger)]";
    }
  };

  const handleBlockEnter = (
    e: React.MouseEvent,
    booking: Booking,
    client?: Client | BookingClientRelation | null,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 256;
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;

    let x = rect.right + 12;
    if (x + tooltipWidth > viewportWidth - 12) {
      x = Math.max(12, rect.left - tooltipWidth - 12);
    }
    if (x + tooltipWidth > viewportWidth - 12) {
      x = Math.max(12, (viewportWidth - tooltipWidth) / 2);
    }

    setTooltip({ booking, client, x, y: Math.max(12, rect.top) });
  };

  const handleBlockLeave = () => setTooltip(null);
  const todayStart = startOfDay(new Date());

  return (
    <div className="space-y-4 antialiased relative">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm rounded-2xl overflow-hidden flex flex-col">
        
        {/* Navigation Toolbar */}
        <TimelineHeader
          viewStartDate={viewStartDate}
          viewEndDate={viewEndDate}
          isCreateMode={isCreateMode}
          schedulingStep={schedulingStep}
          totalVehicles={totalVehicles}
          vehiclesWithBookings={vehiclesWithBookings}
          availableVehicles={availableVehicles}
          utilizationRate={fleetUtilizationRate}
          onShiftWindow={shiftWindow}
          onJumpToToday={jumpToToday}
          onToggleCreateMode={handleToggleCreateMode}
        />

        {/* Client Association Banner */}
        {schedulingStep === "link-client" && (
          <div className="bg-[var(--color-surface-hover)] border-b border-[var(--color-surface-border)] p-3.5 px-5 flex flex-row flex-nowrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs whitespace-nowrap">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                <User size={16} aria-hidden="true" />
              </div>
              <div>
                <span className="font-bold text-[var(--color-ink)] block">Associate Contract Holder</span>
                <span className="text-[11px] text-[var(--color-ink-muted)]">
                  Selected Window: <strong className="text-[var(--color-ink)] font-mono">{selectedStartDate}</strong> → <strong className="text-[var(--color-ink)] font-mono">{selectedEndDate}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0 whitespace-nowrap">
              <select
                className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl px-3 h-9 text-xs font-semibold outline-none text-[var(--color-ink)] w-48 shadow-xs transition-all cursor-pointer focus:ring-2 focus:ring-[var(--color-primary)]/20"
                value={selectedClientId || ""}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
              >
                <option value="">-- Pick Customer --</option>
                {normalizedClients.map((c) => (
                  <option key={c.id} value={c.id}>{getClientDisplayName(c.full_name)}</option>
                ))}
              </select>
              <button
                disabled={!selectedClientId}
                onClick={handleFinalizeBooking}
                className="h-9 px-4 bg-[var(--color-primary)] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 transition-all flex items-center gap-1.5 hover:bg-[var(--color-primary-hover)]"
              >
                <span>Confirm Booking</span>
              </button>
            </div>
          </div>
        )}

        {/* Master Scroll Container */}
        <div ref={scrollContainerRef} className="overflow-x-auto custom-scrollbar">
          <div className="w-full min-w-max flex flex-col relative">
            
            {/* Timeline Date Header Row */}
            <div className="flex border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] sticky top-0 z-30">
              <div className="w-36 sm:w-48 md:w-72 flex-shrink-0 p-3 px-4 border-r border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center sticky left-0 z-40 gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    placeholder="Filter fleet..."
                    className="w-full h-7 pl-7 pr-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-[11px] font-medium outline-none focus:border-[var(--color-primary)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)]"
                  />
                </div>
              </div>
              
              {/* Responsive Calendar Days Header (7 on Mobile, 14 on Desktop) */}
              <div className="flex flex-1 relative min-w-0">
                {timelineDays.map((day, i) => {
                  const isToday = checkIsToday(day);
                  return (
                    <div
                      key={i}
                      className={`w-[calc(100%/7)] md:w-[calc(100%/14)] flex-shrink-0 p-2.5 text-center border-r border-[var(--color-surface-border)] flex flex-col justify-center items-center ${
                        isToday ? "bg-[var(--color-primary)]/[0.03]" : ""
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isToday ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"
                      }`}>
                        {format(day, "EEE")}
                      </span>
                      <span className={`text-xs font-extrabold mt-1 w-7 h-7 flex items-center justify-center rounded-xl ${
                        isToday ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-ink)]"
                      }`}>
                        {format(day, "d")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Rows */}
            <div className="divide-y divide-[var(--color-surface-border)] bg-[var(--color-surface)] max-h-[28rem] overflow-y-auto custom-scrollbar relative">
              {filteredVehicles.map((vehicle) => {
                const vehicleBookings = bookings.filter((b) => b.vehicle_id === vehicle.id);
                const isLocked = vehicle.status !== "available";
                const isSelected = vehicle.id === selectedVehicleId;

                return (
                  <div 
                    key={vehicle.id} 
                    onClick={() => setSelectedVehicleId(vehicle.id)} 
                    className={`flex h-16 relative group/row transition-colors ${
                      isSelected ? "bg-[var(--color-primary)]/[0.025] border-l-4 border-l-[var(--color-primary)]" : ""
                    } ${isLocked ? "bg-[var(--color-surface-hover)]/30" : "hover:bg-[var(--color-surface-hover)]/50"}`}
                  >
                    {/* Sticky Vehicle Information Card */}
                    <div className="w-36 sm:w-48 md:w-72 flex-shrink-0 p-2 sm:p-3 border-r border-[var(--color-surface-border)] bg-[var(--color-surface)] z-20 flex items-center justify-between sticky left-0 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] shrink-0">
                          <Car size={15} aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[var(--color-ink)] truncate">{vehicle.make} {vehicle.model}</h4>
                          <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[var(--color-ink-muted)] uppercase truncate">{vehicle.plate_number || "No Plate"}</span>
                            <span className="hidden sm:inline text-[var(--color-surface-border)]">•</span>
                            <div className="hidden sm:flex items-center gap-1 text-[10px] text-[var(--color-ink-subtle)]">
                              <Gauge size={10} className="text-[var(--color-primary)]" aria-hidden="true" />
                              <span className="font-mono">{vehicle.current_mileage?.toLocaleString() || 0} km</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Grid Cells (7 on Mobile, 14 on Desktop) */}
                    <div className="flex-1 relative min-h-full flex items-center min-w-0">
                      {/* Background Grid Cells */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {timelineDays.map((day, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => !isLocked && handleCellClick(vehicle.id, format(day, "yyyy-MM-dd"))} 
                            className={`w-[calc(100%/7)] md:w-[calc(100%/14)] flex-shrink-0 border-r border-[var(--color-surface-border)]/40 h-full pointer-events-auto ${
                              getCellHighlightClass(vehicle.id, format(day, "yyyy-MM-dd"))
                            } ${
                              isLocked 
                                ? "bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,var(--color-surface-border)_6px,var(--color-surface-border)_12px)] opacity-30" 
                                : "hover:bg-[var(--color-primary)]/[0.05] cursor-pointer"
                            }`} 
                          />
                        ))}
                      </div>

                      {/* Booking Blocks */}
                      {timelineDays.map((day, dayIndex) => {
                        const dayStart = startOfDay(day);
                        const dayEnd = endOfDay(day);

                        const activeBooking = vehicleBookings.find((b) => {
                          const bStart = startOfDay(new Date(b.start_date));
                          const bEnd = endOfDay(new Date(b.end_date));
                          return dayStart <= bEnd && dayEnd >= bStart;
                        });

                        if (!activeBooking) return null;
                        const client = activeBooking.client || normalizedClients.find((c) => c.id === activeBooking.client_id);
                        const isPastBlock = isBefore(dayStart, todayStart);

                        return (
                          <div 
                            key={dayIndex} 
                            className="w-[calc(100%/7)] md:w-[calc(100%/14)] flex-shrink-0 relative h-full flex items-center justify-center p-0.5 z-10"
                          >
                            <div 
                              className={getBookingBlockStyle(activeBooking.status, isPastBlock)}
                              onMouseEnter={(e) => handleBlockEnter(e, activeBooking, client)}
                              onMouseLeave={handleBlockLeave}
                              onClick={(e) => {
                                e.stopPropagation();
                                onExtendBooking(activeBooking);
                              }}
                            >
                              {isPastBlock ? (
                                <Check size={10} className="opacity-80" aria-hidden="true" />
                              ) : (
                                <User size={10} className="opacity-80" aria-hidden="true" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Vehicle Stats */}
        {selectedVehicle && (
          <div className="border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 p-3 px-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4">
              <div className="flex items-center gap-2.5 min-w-[200px]">
                <Car size={16} className="text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--color-ink)] truncate">
                    {selectedVehicle.make} {selectedVehicle.model}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-ink-muted)] uppercase">
                    {selectedVehicle.plate_number || "No Plate"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold">Odometer</span>
                    <span className="font-bold text-[var(--color-ink)] font-mono">{selectedVehicle.current_mileage?.toLocaleString() || 0} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench size={14} className="text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold">Next Service</span>
                    <span className="font-bold text-[var(--color-ink)] font-mono">{selectedVehicle.next_service_km?.toLocaleString() || "N/A"} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold">Days Rented</span>
                    <span className="font-bold text-[var(--color-primary)]">{rentedDays}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold">Utilization</span>
                    <span className="font-bold text-[var(--color-primary)]">{vehicleUtilizationRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popover Tooltip */}
      {tooltip && (
        <div className="fixed z-[9999] pointer-events-none" style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}>
          <div className="w-64 bg-[var(--color-bg-elevated)]/95 backdrop-blur-xl border border-[var(--color-surface-border-strong)] rounded-xl shadow-[var(--shadow-2xl)] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusBadgeColor(tooltip.booking.status)}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">{tooltip.booking.status}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[var(--color-ink-subtle)]">
                #{tooltip.booking.booking_number || tooltip.booking.id}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[var(--color-ink)] truncate mb-1">
              {getClientDisplayName(tooltip.client?.full_name) || "Unknown Client"}
            </h4>
            {tooltip.client?.phone && (
              <p className="text-[11px] text-[var(--color-ink-muted)] flex items-center gap-1.5 mb-3">
                <Phone size={10} className="text-[var(--color-primary)]" aria-hidden="true" />
                <span className="font-mono">{tooltip.client.phone}</span>
              </p>
            )}
            <p className="text-[11px] text-[var(--color-ink-muted)] flex items-center gap-1.5">
              <Calendar size={10} aria-hidden="true" />
              {format(new Date(tooltip.booking.start_date), "MMM d")} - {format(new Date(tooltip.booking.end_date), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
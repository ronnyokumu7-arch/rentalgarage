// src/components/bookings/booking_list/BookingsListMobile.tsx
"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Phone, Car, ChevronRight } from "lucide-react";
import CardGrid from "@/components/ui/CardGrid";
import type { Booking, Client, Vehicle } from "@/lib/types";
import { getBookingActions, type BookingActionsContext } from "./getBookingActions";
import { formatDateShort, statusDotColors, statusLabels } from "./constants";

interface BookingsListMobileProps {
  bookings: Booking[];
  clientMap: Map<number, Client>;
  vehicleMap: Map<number, Vehicle>;
  actionsCtx: Omit<BookingActionsContext, "routerPush">;
}

const getClient = (map: Map<number, Client>, id: number) => map.get(id) || map.get(Number(id));
const getVehicle = (map: Map<number, Vehicle>, id: number) => map.get(id) || map.get(Number(id));

export default function BookingsListMobile({
  bookings, clientMap, vehicleMap,
  actionsCtx,
}: BookingsListMobileProps) {
  const router = useRouter();
  const fullCtx: BookingActionsContext = { ...actionsCtx, routerPush: (h) => router.push(h) };
  const getRowActions = (b: Booking) => getBookingActions(b, fullCtx);

  return (
    <div className="block md:hidden">
      <CardGrid
        data={bookings}
        getCardId={(booking) => booking.id}
        compact={true}
        showGlassEffect={true}
        cardClassName="!p-3 hover:!border-[var(--color-primary)]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300"
        containerClassName="px-2 pb-4"
        maxHeight="calc(100vh - 160px)"
        
        renderCardHeader={({ item }) => {
          const statusColor = statusDotColors[item.status] || "bg-gray-400";
          const isPulsing = item.status === "confirmed" || item.status === "active";
          const statusLabel = statusLabels[item.status] || item.status;
          
          return (
            <div 
              className="flex items-center justify-between w-full cursor-pointer"
              onClick={() => router.push(`/dashboard/bookings/${item.id}`)}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Premium Icon Container */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center shadow-md">
                    <CalendarDays size={16} className="text-[var(--color-primary)]" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5">
                    <div className={`w-3 h-3 rounded-full ${statusColor} ring-2 ring-[var(--color-surface)] shadow-sm ${
                      isPulsing ? "animate-pulse" : ""
                    }`} />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                      {item.booking_number || `BK-${item.id}`}
                    </span>
                    <span className="text-[8px] font-bold text-[var(--color-ink-muted)] px-1.5 py-0.5 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] whitespace-nowrap uppercase tracking-wide">
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CalendarDays size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="text-[10px] text-[var(--color-ink-muted)] font-medium">
                      {formatDateShort(item.start_date)}
                    </span>
                    <span className="text-[9px] text-[var(--color-ink-subtle)]">→</span>
                    <span className="text-[10px] text-[var(--color-ink-muted)] font-medium">
                      {formatDateShort(item.end_date)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Smooth Chevron */}
              <ChevronRight size={16} className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" />
            </div>
          );
        }}
        
        renderCardBody={({ item }) => {
          const client = getClient(clientMap, item.client_id);
          const vehicle = getVehicle(vehicleMap, item.vehicle_id);
          
          return (
            <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60">
              
              {/* Client & Vehicle Section - Compact, Clean */}
              <div className="flex items-center justify-between gap-4">
                
                {/* Client */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)]/80 flex items-center justify-center flex-shrink-0">
                    <Phone size={12} className="text-[var(--color-ink-subtle)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-ink)] truncate leading-tight">
                      {client?.full_name || `Client #${item.client_id}`}
                    </p>
                    {client?.phone && (
                      <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">
                        {client.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Vehicle */}
                <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                  <div className="min-w-0 text-right">
                    <p className="text-xs font-semibold text-[var(--color-ink)] truncate leading-tight">
                      {vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle #${item.vehicle_id}`}
                    </p>
                    {vehicle?.plate_number && (
                      <span className="text-[9px] font-mono font-bold text-[var(--color-ink-muted)]">
                        {vehicle.plate_number}
                      </span>
                    )}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)]/80 flex items-center justify-center flex-shrink-0">
                    <Car size={12} className="text-[var(--color-ink-subtle)]" />
                  </div>
                </div>
              </div>

              {/* Cost Section - Clean and Minimal */}
              <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                  Trip Total
                </span>
                <p className="text-base font-extrabold text-[var(--color-primary-text)] tabular-nums tracking-tight">
                  {item.currency_code} {Number(item.total_amount).toLocaleString()}
                </p>
              </div>
              
            </div>
          );
        }}
        
        rowActions={getRowActions}
      />
    </div>
  );
}

// src/components/bookings/BookingManifestCards.tsx
"use client";

import { User, Car, Receipt, Edit2 } from "lucide-react";
import type { Booking, Client, Vehicle } from "@/lib/types";

interface BookingManifestCardsProps {
  booking: Booking;
  client: Client | null;
  vehicle: Vehicle | null;
  isEditable: boolean;
  onChangeClient: () => void;
  onChangeVehicle: () => void;
}

export default function BookingManifestCards({
  booking, client, vehicle, isEditable, onChangeClient, onChangeVehicle
}: BookingManifestCardsProps) {
  
  const duration = Math.ceil(
    (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Client Card */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-light/20 flex items-center justify-center text-accent-dark font-bold text-sm">
              {client?.full_name.charAt(0) || "C"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink truncate">{client?.full_name || "Unknown Client"}</p>
              <p className="text-xs text-ink-muted truncate">{client?.email || "No email"}</p>
            </div>
          </div>
          {isEditable && (
            <button onClick={onChangeClient} className="text-accent-dark hover:text-accent-darker transition-colors" title="Change Client">
              <Edit2 size={14} />
            </button>
          )}
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-ink-muted">
            <User size={12} className="flex-shrink-0" />
            <span className="truncate">{client?.phone || "No phone"}</span>
          </div>
          {client?.residential_address && (
            <div className="flex items-center gap-2 text-ink-muted">
              <Car size={12} className="flex-shrink-0" />
              <span className="truncate">{client.residential_address}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Vehicle Card */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-hover border border-surface-border flex items-center justify-center text-ink-muted">
              <Car size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink truncate">{vehicle ? `${vehicle.make} ${vehicle.model}` : "Unknown Vehicle"}</p>
              <p className="text-xs text-ink-muted truncate">{vehicle?.plate_number} • {vehicle?.year}</p>
            </div>
          </div>
          {isEditable && (
            <button onClick={onChangeVehicle} className="text-accent-dark hover:text-accent-darker transition-colors" title="Change Vehicle">
              <Edit2 size={14} />
            </button>
          )}
        </div>
        <div className="p-3 rounded-lg bg-surface-hover border border-surface-border">
          <p className="text-[10px] uppercase text-ink-subtle font-bold tracking-wider">Status</p>
          <p className="text-xs font-bold text-ink mt-0.5">{vehicle?.status || "N/A"}</p>
        </div>
      </div>

      {/* 3. Financial Card */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success-bg flex items-center justify-center text-success">
              <Receipt size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Financials</p>
              <p className="text-xs text-ink-muted">Total Contract Value</p>
            </div>
          </div>
        </div>
        
        <p className="text-2xl font-bold text-ink mb-3">
          {booking.currency_code} {Number(booking.total_amount).toLocaleString()}
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-surface-hover border border-surface-border">
            <p className="text-[9px] uppercase text-ink-subtle font-bold">Duration</p>
            <p className="text-xs font-bold text-ink">{duration} Days</p>
          </div>
          <div className="p-2 rounded-lg bg-surface-hover border border-surface-border">
            <p className="text-[9px] uppercase text-ink-subtle font-bold">Daily Rate</p>
            <p className="text-xs font-bold text-ink">
              {booking.currency_code} {Math.round(Number(booking.total_amount) / duration).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

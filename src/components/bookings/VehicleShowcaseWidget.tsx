"use client";

import React from "react";
import Link from "next/link";
import { 
  Car, 
  Gauge, 
  ShieldWarning as ShieldAlert,
  GasPump as Fuel,
  Sparkle as Sparkles,
  ArrowUpRight, 
  Key as KeyRound,
  CheckCircle as CheckCircle2,
  Hash,
  Calendar
} from "@phosphor-icons/react/ssr";
import type { Booking } from "@/lib/types";

interface Props {
  booking: Booking;
}

export function VehicleShowcaseWidget({ booking }: Props) {
  const vehicle = booking.vehicle;

  // Gracefully handle zero-state when no vehicle is linked
  if (!vehicle) {
    return (
      <div className="relative overflow-hidden p-6 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--color-surface-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldAlert size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Fleet Unit Assignment
              </h2>
              <p className="text-base font-bold text-[var(--color-ink)]">Pending Allocation</p>
            </div>
          </div>
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Unassigned
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-surface-hover)]/40 border border-dashed border-[var(--color-surface-border)] flex items-center justify-between">
          <p className="text-xs text-[var(--color-ink-muted)]">
            No vehicle unit is currently mapped to this booking ledger entry.
          </p>
          <Link
            href="/dashboard/fleet"
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all shrink-0"
          >
            Assign Fleet Unit
          </Link>
        </div>
      </div>
    );
  }

  // ✅ PURE DATA RESOLUTION: Strictly aligned with BookingVehicleRelation & backend schema
  const make = vehicle.make || "";
  const model = vehicle.model || "";
  const fullVehicleTitle = [make, model].filter(Boolean).join(" ") || "Executive Fleet Unit";
  
  const year = vehicle.year ? String(vehicle.year) : "N/A";
  const plateNumber = vehicle.plate_number || "NO-PLATE";
  const mileage = vehicle.current_mileage !== null && vehicle.current_mileage !== undefined 
    ? vehicle.current_mileage.toLocaleString() 
    : "N/A";
  const status = vehicle.status || "Active";
  
  // ✅ Safe defaults for fields not provided in the nested BookingVehicleRelation
  const category = "Standard Class"; 
  const fuelType = "Gasoline"; 

  return (
    <div className="relative overflow-hidden p-6 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-3xl shadow-sm space-y-6">
      {/* Subtle Luxury Brand Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-surface-border)] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-primary)]/5 text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-inner">
            <Car size={22} aria-hidden="true" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--color-surface)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Assigned Fleet Asset
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                <Sparkles size={10} aria-hidden="true" /> Tier 1 Asset
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--color-ink)] tracking-tight mt-0.5">
              {fullVehicleTitle}
            </h2>
          </div>
        </div>

        {/* License Plate Identity Tag */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] font-mono text-xs font-bold text-[var(--color-ink)] shadow-xs">
          <Hash size={14} className="text-[var(--color-primary)]" aria-hidden="true" />
          <span className="tracking-wider uppercase">{plateNumber}</span>
        </div>
      </div>

      {/* Core Telemetry Grid (Make, Model, Year, Mileage) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Model Year Node */}
        <div className="p-3.5 rounded-2xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] space-y-1 transition-all hover:border-[var(--color-primary)]/30 group">
          <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
            <Calendar size={13} className="group-hover:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Model Year</span>
          </div>
          <p className="text-xs font-bold text-[var(--color-ink)] font-mono">{year}</p>
        </div>

        {/* Odometer/Mileage Node */}
        <div className="p-3.5 rounded-2xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] space-y-1 transition-all hover:border-[var(--color-primary)]/30 group">
          <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
            <Gauge size={13} className="group-hover:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Odometer</span>
          </div>
          <p className="text-xs font-bold text-[var(--color-ink)] font-mono">
            {mileage !== "N/A" ? `${mileage} km` : mileage}
          </p>
        </div>

        {/* Category Node */}
        <div className="p-3.5 rounded-2xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] space-y-1 transition-all hover:border-[var(--color-primary)]/30 group">
          <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
            <KeyRound size={13} className="group-hover:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Category</span>
          </div>
          <p className="text-xs font-bold text-[var(--color-ink)] capitalize truncate">{category}</p>
        </div>

        {/* Powertrain Node */}
        <div className="p-3.5 rounded-2xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] space-y-1 transition-all hover:border-[var(--color-primary)]/30 group">
          <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
            <Fuel size={13} className="group-hover:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Powertrain</span>
          </div>
          <p className="text-xs font-bold text-[var(--color-ink)] capitalize truncate">{fuelType}</p>
        </div>
      </div>

      {/* Footer Status & Fleet CRM Link */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-surface-border)] text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-500" aria-hidden="true" />
          <span className="text-[var(--color-ink-muted)] font-medium">
            Fleet Status: <strong className="text-[var(--color-ink)] capitalize">{status}</strong>
          </span>
        </div>

        {vehicle.id && (
          <Link
            href={`/dashboard/fleet/${vehicle.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl shadow-md shadow-[var(--color-primary)]/10 transition-all active:scale-[0.98] group"
          >
            <span>Telemetry & Fleet Profile</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default VehicleShowcaseWidget;

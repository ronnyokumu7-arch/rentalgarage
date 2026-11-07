// src/components/fleet/VehicleHeader.tsx
"use client";

import React from "react";
import { Car, PencilSimple as Pencil, FloppyDisk as Save, X, Archive, Warning as AlertTriangle, CheckCircle, ArrowCounterClockwise as RotateCcw, Flag, ArrowClockwise as RotateCw } from "@phosphor-icons/react/ssr";
import type { Vehicle } from "@/lib/types";

interface VehicleHeaderProps {
  vehicle: Vehicle;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  actionLoading: string | null;
  onAction: (action: "activate" | "maintenance" | "reactivate" | "retire" | "archive" | "restore") => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending_activation: { label: "Pending Activation", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  available: { label: "Available", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  rented: { label: "Rented", color: "text-[var(--color-primary)]", bg: "bg-[var(--color-primary)]/10", border: "border-[var(--color-primary)]/20" },
  awaiting_mileage: { label: "Awaiting Mileage", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  maintenance: { label: "In Maintenance", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  retired: { label: "Retired", color: "text-[var(--color-ink-muted)]", bg: "bg-[var(--color-surface-hover)]", border: "border-[var(--color-surface-border)]" },
  archived: { label: "Archived", color: "text-[var(--color-ink-muted)]", bg: "bg-[var(--color-surface-hover)]", border: "border-[var(--color-surface-border)]" },
};

export default function VehicleHeader({ vehicle, isEditing, setIsEditing, actionLoading, onAction }: VehicleHeaderProps) {
  const isArchived = vehicle.is_archived;
  const config = isArchived ? statusConfig.archived : (statusConfig[vehicle.status] || statusConfig.available);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)] space-y-3.5 sm:space-y-4">
      {/* 1. Hero Header Banner */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
            <Car className="w-5 h-5 sm:w-7 sm:h-7" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight truncate">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-xs text-[var(--color-ink-muted)] font-medium">
              Model Year {vehicle.year}
            </p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border} flex-shrink-0 shadow-sm`}>
          {config.label}
        </span>
      </div>

      {/* 2. Micro Card Grid for Vehicle Identity Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="bg-[var(--color-bg)]/60 border border-[var(--color-surface-border)] rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Plate Number</span>
          <span className="font-mono text-xs sm:text-sm font-bold text-[var(--color-ink)] mt-0.5 truncate">{vehicle.plate_number}</span>
        </div>

        <div className="bg-[var(--color-bg)]/60 border border-[var(--color-surface-border)] rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Year</span>
          <span className="text-xs sm:text-sm font-bold text-[var(--color-ink)] mt-0.5 truncate">{vehicle.year}</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[var(--color-bg)]/60 border border-[var(--color-surface-border)] rounded-xl p-2.5 flex flex-col justify-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">VIN</span>
          <span className="font-mono text-xs sm:text-sm font-semibold text-[var(--color-ink)] truncate mt-0.5">{vehicle.vin || "Not Specified"}</span>
        </div>
      </div>

      {/* 3. Action Bar (Full-width on mobile, right-aligned natural width on desktop) */}
      <div className="pt-2 border-t border-[var(--color-surface-border)] flex items-center justify-between gap-2">
        {isEditing ? (
          <div className="flex items-center justify-end gap-2 w-full">
            <button 
              type="button"
              onClick={() => setIsEditing(false)} 
              className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all active:scale-95"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <button 
              form="vehicle-edit-form" 
              type="submit" 
              disabled={actionLoading === "update"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 disabled:opacity-50"
            >
              {actionLoading === "update" ? <span className="animate-spin">⟳</span> : <Save size={15} aria-hidden="true" />} Save Changes
            </button>
          </div>
        ) : isArchived ? (
          <button 
            type="button"
            onClick={() => onAction("restore")} 
            disabled={!!actionLoading} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {actionLoading === "restore" ? <span className="animate-spin">⟳</span> : <RotateCw size={15} aria-hidden="true" />} Restore to Fleet
          </button>
        ) : (
          <div className="flex items-center justify-between sm:justify-end w-full gap-2">
            {/* Primary Action Button */}
            <div className="flex-1 sm:flex-initial min-w-0">
              {vehicle.status === "available" && (
                <button 
                  type="button"
                  onClick={() => onAction("maintenance")} 
                  disabled={!!actionLoading} 
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 active:scale-95 transition-all disabled:opacity-50 truncate"
                >
                  <AlertTriangle size={15} className="flex-shrink-0" aria-hidden="true" /> <span className="truncate">Maintenance</span>
                </button>
              )}
              {vehicle.status === "pending_activation" && (
                <button 
                  type="button"
                  onClick={() => onAction("activate")} 
                  disabled={!!actionLoading} 
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 truncate"
                >
                  {actionLoading === "activate" ? <span className="animate-spin">⟳</span> : <CheckCircle size={15} className="flex-shrink-0" aria-hidden="true" />} <span className="truncate">Activate</span>
                </button>
              )}
              {vehicle.status === "maintenance" && (
                <button 
                  type="button"
                  onClick={() => onAction("reactivate")} 
                  disabled={!!actionLoading} 
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 truncate"
                >
                  {actionLoading === "reactivate" ? <span className="animate-spin">⟳</span> : <RotateCcw size={15} className="flex-shrink-0" aria-hidden="true" />} <span className="truncate">Reactivate</span>
                </button>
              )}
            </div>

            {/* Secondary Toolbar Actions */}
            <div className="flex items-center gap-1 bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] rounded-xl p-1 flex-shrink-0">
              <button 
                type="button"
                onClick={() => setIsEditing(true)} 
                className="p-1.5 sm:p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] active:scale-95 transition-all" 
                title="Edit Details"
              >
                <Pencil size={15} aria-hidden="true" />
              </button>
              {vehicle.status !== "retired" && vehicle.status !== "pending_activation" && (
                <button 
                  type="button"
                  onClick={() => onAction("retire")} 
                  disabled={!!actionLoading} 
                  className="p-1.5 sm:p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-rose-500 hover:bg-[var(--color-surface)] active:scale-95 transition-all disabled:opacity-50" 
                  title="Retire Vehicle"
                >
                  <Flag size={15} aria-hidden="true" />
                </button>
              )}
              <button 
                type="button"
                onClick={() => onAction("archive")} 
                disabled={!!actionLoading} 
                className="p-1.5 sm:p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] active:scale-95 transition-all disabled:opacity-50" 
                title="Archive Vehicle"
              >
                <Archive size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
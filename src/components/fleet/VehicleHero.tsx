"use client";

import { useRouter } from "next/navigation";
import {
  Car, ChevronRight, MoreVertical, Wrench, Gauge, User, Pencil,
} from "lucide-react";
import type { Vehicle } from "@/lib/types";
import {
  STATUS_LABELS, STATUS_TONE, formatPlate, formatMoney,
} from "@/lib/fleet/constants";

interface VehicleHeroProps {
  vehicle: Vehicle;
  onOpenActions: () => void;
  onUpdateMileage: () => void;
  onSendToMaintenance: () => void;
  onEditDetails: () => void; // ✅ NEW
}

export default function VehicleHero({
  vehicle,
  onOpenActions,
  onUpdateMileage,
  onSendToMaintenance,
  onEditDetails,
}: VehicleHeroProps) {
  const router = useRouter();
  const tone = STATUS_TONE[vehicle.status];
  const label = STATUS_LABELS[vehicle.status];

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-4 sm:p-6">
      <button
        onClick={() => router.push("/dashboard/fleet")}
        className="md:hidden flex items-center gap-1 text-[11px] font-medium text-[var(--color-ink-muted)] mb-3 hover:text-[var(--color-primary)] transition-colors"
      >
        Fleet <ChevronRight size={12} /> {formatPlate(vehicle.plate_number)}
      </button>

      <div className="flex items-start sm:items-center gap-3 sm:gap-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
          <Car size={24} className="text-[var(--color-primary)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight truncate">
              {vehicle.make} {vehicle.model}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tone.bg} ${tone.text} ${tone.border}`}
            >
              {label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1 font-mono">
            {formatPlate(vehicle.plate_number)} · {vehicle.year} · YOM-{vehicle.year}
          </p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-[var(--color-ink)] tabular-nums">
              {formatMoney(vehicle.daily_rate)}
              <span className="text-[10px] font-medium text-[var(--color-ink-muted)] ml-1">/day</span>
            </span>
            <span className="text-[10px] text-[var(--color-ink-subtle)]">•</span>
            <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-ink-muted)]">
              {vehicle.owner_id ? (
                <>
                  <User size={11} className="text-[var(--color-ink-subtle)]" />
                  Investor Owned
                </>
              ) : (
                "Agency Owned"
              )}
            </span>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEditDetails}
            className="h-9 px-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-ink)] transition-colors flex items-center gap-1.5"
          >
            <Pencil size={13} /> Edit
          </button>
          {vehicle.status === "available" && (
            <button
              onClick={onSendToMaintenance}
              className="h-9 px-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-ink)] transition-colors"
            >
              Send to Maintenance
            </button>
          )}
          <button
            onClick={onUpdateMileage}
            className="h-9 px-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-ink)] transition-colors flex items-center gap-1.5"
          >
            <Gauge size={13} /> Update Mileage
          </button>
          <button
            onClick={onOpenActions}
            className="w-9 h-9 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition-colors"
            aria-label="More actions"
          >
            <MoreVertical size={16} className="text-[var(--color-ink-muted)]" />
          </button>
        </div>

        {/* Mobile actions trigger */}
        <button
          onClick={onOpenActions}
          className="md:hidden w-9 h-9 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0"
          aria-label="More actions"
        >
          <MoreVertical size={16} className="text-[var(--color-ink-muted)]" />
        </button>
      </div>

      {/* Mobile action strip */}
      <div className="md:hidden flex items-center gap-2 mt-4 overflow-x-auto scrollbar-none">
        <button
          onClick={onEditDetails}
          className="flex-shrink-0 h-9 px-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-ink)] flex items-center gap-1.5"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={onUpdateMileage}
          className="flex-shrink-0 h-9 px-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-ink)] flex items-center gap-1.5"
        >
          <Gauge size={13} /> Mileage
        </button>
        {vehicle.status === "available" && (
          <button
            onClick={onSendToMaintenance}
            className="flex-shrink-0 h-9 px-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-ink)] flex items-center gap-1.5"
          >
            <Wrench size={13} /> Maintenance
          </button>
        )}
      </div>
    </div>
  );
}

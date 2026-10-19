// src/components/fleet/VehicleHero.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Car, MoreVertical, User, ArrowLeft,
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
  onEditDetails: () => void;
}

export default function VehicleHero({
  vehicle,
  onOpenActions,
}: VehicleHeroProps) {
  const router = useRouter();
  const tone = STATUS_TONE[vehicle.status];
  const label = STATUS_LABELS[vehicle.status];

  return (
    <div className="space-y-3">
      <button
        onClick={() => router.push("/dashboard/fleet")}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11px] font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors group"
        aria-label="Back to Fleet"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Fleet
      </button>

      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-4 sm:p-6">
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
              {formatPlate(vehicle.plate_number)} · {vehicle.year}
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

          <button
            onClick={onOpenActions}
            className="w-9 h-9 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="More actions"
          >
            <MoreVertical size={16} className="text-[var(--color-ink-muted)]" />
          </button>
        </div>
      </div>
    </div>
  );
}

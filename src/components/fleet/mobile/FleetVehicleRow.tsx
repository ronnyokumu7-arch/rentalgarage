// src/components/fleet/mobile/FleetVehicleRow.tsx
"use client";

import {
  Gauge, Wrench, CheckCircle2, Circle, MoreVertical,
} from "lucide-react";
import {
  getVehicleBodyIcon,
  getVehicleBrandLogoUrl,
} from "@/components/fleet/vehicle-avatar";
import type { Vehicle } from "@/lib/types";

const formatPlate = (plate: string) => plate.toUpperCase();
const formatPrice = (amount: number | string) => {
  const num = Number(amount);
  return num.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const formatMileage = (km: number) => km.toString();

const getStatusRing = (
  vehicle: Vehicle,
  isDueForService: boolean
): string => {
  if (vehicle.is_archived) return "ring-slate-500/40";
  if (vehicle.status === "retired") return "ring-slate-500/40";
  if (vehicle.status === "maintenance" || isDueForService || vehicle.mileage_due)
    return "ring-amber-500/70";
  if (vehicle.status === "pending_activation") return "ring-violet-500/70";
  if (vehicle.status === "rented") return "ring-blue-500/70";
  if (vehicle.status === "available") return "ring-emerald-500/70";
  return "ring-slate-400/40";
};

interface FleetVehicleRowProps {
  item: Vehicle;
  isSelected: boolean;
  isSelecting: boolean;
  isMounted: boolean;
  isDark: boolean;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClick: () => void;
  onMoreClick: (e: React.MouseEvent) => void;
}

export default function FleetVehicleRow({
  item,
  isSelected,
  isSelecting,
  isMounted,
  isDark,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClick,
  onMoreClick,
}: FleetVehicleRowProps) {
  const brandLogoUrl = getVehicleBrandLogoUrl(item);
  const BodyIcon = getVehicleBodyIcon(item);

  const kmToService = item.next_service_km
    ? item.next_service_km - item.current_mileage
    : null;
  const isDueForService = kmToService !== null && kmToService <= 500;
  const needsMileageAttention =
    isDueForService || item.mileage_due || item.status === "maintenance";

  const statusRing = getStatusRing(item, isDueForService);
  const isDarkWithLogo = isMounted && isDark && Boolean(brandLogoUrl);
  const isMuted = item.is_archived || item.status === "retired";
  const statusBadgeClass =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold";

  const getInlineStatus = () => {
    if (item.status === "rented") {
      return (
        <span className={`${statusBadgeClass} bg-blue-500/10 text-blue-700 dark:text-blue-400`}>
          Rented
        </span>
      );
    }

    if (item.status === "pending_activation") {
      return (
        <span className={`${statusBadgeClass} bg-violet-500/10 text-violet-700 dark:text-violet-400`}>
          Pending
        </span>
      );
    }

    if (item.status === "available") {
      return (
        <span className={`${statusBadgeClass} bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`}>
          Available
        </span>
      );
    }

    if (item.status === "maintenance") {
      return (
        <span className={`${statusBadgeClass} bg-amber-500/10 text-amber-700 dark:text-amber-400`}>
          Garage
        </span>
      );
    }

    if (needsMileageAttention) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
          <Wrench size={10} className="flex-shrink-0" />
          Update Mileage
        </span>
      );
    }

    return (
      <span className={`${statusBadgeClass} bg-slate-500/10 text-slate-700 dark:text-slate-400`}>
        Retired
      </span>
    );
  };

  return (
    <div
      data-selection-zone
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      className={`relative flex items-start gap-3 w-full py-3 px-3 transition-colors select-none bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]/40 ${
        isMuted ? "opacity-60" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden transition-all ring-2 ring-offset-2 ring-offset-[var(--color-surface)] ${statusRing} ${
          isDarkWithLogo
            ? "bg-white shadow-[inset_0_0_6px_rgba(0,0,0,0.08)]"
            : "bg-[var(--color-surface-hover)]"
        }`}
      >
        {brandLogoUrl ? (
          <img
            src={brandLogoUrl}
            alt={item.make}
            className={`w-8 h-8 object-contain ${
              isDark ? "" : "mix-blend-multiply"
            } ${isMuted ? "grayscale" : ""}`}
            loading="lazy"
          />
        ) : (
          <BodyIcon
            size={20}
            className="text-[var(--color-ink-muted)]"
            strokeWidth={1.75}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 min-w-0 pr-6">
          <h3 className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
            {item.make} {item.model}
          </h3>
          <span className="text-[10px] font-mono font-semibold tracking-tight text-[var(--color-ink-subtle)] flex-shrink-0">
            {item.year}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-semibold text-[var(--color-ink-muted)]">
              KES
            </span>
            <span className="text-[13px] font-bold text-[var(--color-ink)] tabular-nums">
              {formatPrice(item.daily_rate)}
            </span>
          </div>
          {getInlineStatus()}
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-[var(--color-ink-muted)] flex-wrap">
          <span className="font-mono tracking-tight">
            {formatPlate(item.plate_number)}
          </span>

          <span className="inline-flex items-center gap-1">
            <Gauge size={11} className="flex-shrink-0 text-[var(--color-ink-subtle)]" />
            <span className="font-mono tracking-tight">
              {formatMileage(item.current_mileage)} km
            </span>
          </span>

          {item.next_service_km ? (
            <span
              className={`inline-flex items-center gap-1 ${
                needsMileageAttention
                  ? "text-amber-600 dark:text-amber-400"
                  : ""
              }`}
            >
              <Wrench
                size={11}
                className={`flex-shrink-0 ${
                  needsMileageAttention
                    ? ""
                    : "text-[var(--color-ink-subtle)]"
                }`}
              />
              <span className="font-mono tracking-tight">
                {formatMileage(item.next_service_km)} km
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[var(--color-ink-subtle)]">
              <Wrench size={11} className="flex-shrink-0" />
              <span className="font-mono tracking-tight italic">Not set</span>
            </span>
          )}
        </div>
      </div>

      {/* ✅ 3-dots CTA — same action as tapping the row */}
      {!isSelecting && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoreClick(e);
          }}
          aria-label="Vehicle actions"
          className="absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors active:scale-90"
        >
          <MoreVertical size={16} strokeWidth={2} />
        </button>
      )}

      {isSelecting && (
        <div className="flex-shrink-0 self-center pl-1">
          {isSelected ? (
            <CheckCircle2
              size={22}
              className="text-[var(--color-primary)]"
              strokeWidth={2.25}
            />
          ) : (
            <Circle
              size={22}
              className="text-[var(--color-ink-subtle)]"
              strokeWidth={1.5}
            />
          )}
        </div>
      )}
    </div>
  );
}

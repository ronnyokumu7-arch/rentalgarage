// src/components/fleet/mobile/FleetVehicleRow.tsx
"use client";

import {
  Gauge, Wrench, CheckCircle2, Circle, Clock,
} from "lucide-react";
import {
  getVehicleBodyIcon,
  getVehicleBrandLogoUrl,
} from "@/components/fleet/vehicle-avatar";
import type { Vehicle, Booking } from "@/lib/types";

const formatPlate = (plate: string) => plate.toUpperCase();
const formatPrice = (amount: number | string) => {
  const num = Number(amount);
  return num.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
const formatMileage = (km: number) => km.toLocaleString();

const getStatusRing = (
  vehicle: Vehicle,
  isDueForService: boolean,
  isOnTrip: boolean
): string => {
  if (vehicle.is_archived) return "ring-slate-500/40";
  if (vehicle.status === "retired") return "ring-slate-500/40";
  if (vehicle.status === "maintenance" || isDueForService || vehicle.mileage_due)
    return "ring-amber-500/70";
  if (vehicle.status === "pending_activation") return "ring-violet-500/70";
  if (vehicle.status === "rented") {
    return isOnTrip ? "ring-blue-500/70" : "ring-emerald-500/70";
  }
  if (vehicle.status === "available") return "ring-slate-400/40";
  return "ring-slate-400/40";
};

const formatCountdown = (endDate: string): string | null => {
  const end = new Date(endDate).getTime();
  const diff = end - Date.now();
  if (diff <= 0) return "Expiring";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / 1000 / 60) % 60);

  if (days > 0) {
    const dayStr = days === 1 ? "day" : "days";
    const hrStr = hours === 1 ? "hr" : "hrs";
    return `${days} ${dayStr} ${hours} ${hrStr}`;
  }
  if (hours > 0) {
    const hrStr = hours === 1 ? "hr" : "hrs";
    const minStr = mins === 1 ? "min" : "mins";
    return `${hours} ${hrStr} ${mins} ${minStr}`;
  }
  return `${mins} mins`;
};

interface FleetVehicleRowProps {
  item: Vehicle;
  index: number;
  total: number;
  isSelected: boolean;
  isSelecting: boolean;
  activeRental?: Booking;
  isMounted: boolean;
  isDark: boolean;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClick: () => void;
}

export default function FleetVehicleRow({
  item,
  index,
  total,
  isSelected,
  isSelecting,
  activeRental,
  isMounted,
  isDark,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClick,
}: FleetVehicleRowProps) {
  const brandLogoUrl = getVehicleBrandLogoUrl(item);
  const BodyIcon = getVehicleBodyIcon(item);

  const kmToService = item.next_service_km
    ? item.next_service_km - item.current_mileage
    : null;
  const isDueForService = kmToService !== null && kmToService <= 500;
  const needsMileageAttention =
    isDueForService || item.mileage_due || item.status === "maintenance";

  const isOnTrip = (() => {
    if (item.status !== "rented" || !activeRental) return false;
    const now = Date.now();
    const start = new Date(activeRental.start_date).getTime();
    const end = new Date(activeRental.end_date).getTime();
    return now >= start && now <= end;
  })();

  const statusRing = getStatusRing(item, isDueForService, isOnTrip);
  const isDarkWithLogo = isMounted && isDark && Boolean(brandLogoUrl);
  const isMuted = item.is_archived || item.status === "retired";

  const getInlineStatus = () => {
    if (item.status === "rented") {
      if (activeRental) {
        const now = Date.now();
        const start = new Date(activeRental.start_date).getTime();
        const end = new Date(activeRental.end_date).getTime();

        if (now >= start && now <= end) {
          const countdown = formatCountdown(activeRental.end_date);
          return (
            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
              <Clock size={10} className="flex-shrink-0" />
              {countdown}
            </span>
          );
        }

        if (now < start) {
          return (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Rented
            </span>
          );
        }
      }

      return (
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
          Rented
        </span>
      );
    }

    if (item.status === "pending_activation") {
      return (
        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
          Pending
        </span>
      );
    }

    if (item.status === "available") {
      return (
        <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">
          Available
        </span>
      );
    }

    if (needsMileageAttention) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
          <Wrench size={10} className="flex-shrink-0" />
          {item.status === "maintenance" ? "Garage" : "Update Mileage"}
        </span>
      );
    }

    return (
      <span className="text-[10px] font-bold text-[var(--color-ink-muted)]">
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
      {index !== total - 1 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[var(--color-surface-border)] to-transparent" />
      )}

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
        {/* ✅ Row 1: Name + year badge */}
        <div className="flex items-baseline gap-1.5 min-w-0">
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

        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-tight bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
            {formatPlate(item.plate_number)}
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--color-surface-hover)] text-[9px] font-bold text-[var(--color-ink-muted)]">
            <Gauge size={9} className="flex-shrink-0" />
            <span className="font-mono tracking-tight">
              {formatMileage(item.current_mileage)} km
            </span>
          </span>

          {item.next_service_km && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${
                needsMileageAttention
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
              }`}
            >
              <Wrench size={9} className="flex-shrink-0" />
              <span className="font-mono tracking-tight">
                {formatMileage(item.next_service_km)} km
              </span>
            </span>
          )}
        </div>
      </div>

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

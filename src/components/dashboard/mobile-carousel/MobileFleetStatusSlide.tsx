// src/components/dashboard/mobile-carousel/MobileFleetStatusSlide.tsx
"use client";

import { Car, Wrench, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

/* ──────────────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────────────── */

export interface CarouselVehicle {
  id: number;
  status: string;
  make: string;
  model: string;
  plate_number: string;
  current_mileage: number;
  next_service_km: number | null;
  mileage_due: boolean;
}

interface MobileFleetStatusSlideProps {
  vehicles: CarouselVehicle[];
}

/* ──────────────────────────────────────────────────────────────────────
   Fleet Status slide — premium tiles in a snap-scroll carousel
────────────────────────────────────────────────────────────────────── */

export default function MobileFleetStatusSlide({
  vehicles,
}: MobileFleetStatusSlideProps) {
  const available = vehicles.filter((v) => v.status === "available").length;
  const rented = vehicles.filter((v) => v.status === "rented").length;
  const maintenance = vehicles.filter((v) => v.status === "maintenance").length;
  const total = vehicles.length;
  const operational = available + rented;
  const utilizationPct = total > 0 ? Math.round((rented / total) * 100) : 0;

  const tiles = [
    {
      id: "available",
      label: "Available",
      count: available,
      gradient: "from-emerald-500 to-teal-600",
      tint: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: Car,
    },
    {
      id: "rented",
      label: "Rented",
      count: rented,
      gradient: "from-blue-500 to-indigo-600",
      tint: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: TrendingUp,
    },
    {
      id: "service",
      label: "Service",
      count: maintenance,
      gradient: "from-amber-500 to-orange-600",
      tint: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: Wrench,
    },
  ];

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pr-16">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Fleet Status
          </p>
          <p className="text-xs text-ink-subtle mt-0.5 truncate">
            {operational}/{total} operational
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[9px] font-bold text-success-text uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      {/* Utilization bar */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-semibold text-ink-muted mb-1">
          <span>Utilization</span>
          <span className="tabular-nums">{utilizationPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${utilizationPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
          />
        </div>
      </div>

      {/* ✅ Snap-scroll tiles — one card dominant + strong peek of the next.
          Left edge aligns flush with the header/tab switcher; right bleeds
          past the container so the next tile peeks under the card border. */}
      <div className="-mr-4">
        <div
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pr-4 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                className={`snap-start flex-shrink-0 w-[62%] flex items-center gap-3 rounded-xl ${tile.tint} border ${tile.border} p-3 overflow-hidden`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tile.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <Icon size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-ink tracking-tight font-display tabular-nums leading-none">
                    {tile.count}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mt-1 truncate">
                    {tile.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

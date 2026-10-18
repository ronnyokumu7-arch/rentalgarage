// src/components/dashboard/mobile-carousel/MobileFleetStatusSlide.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Car, Wrench, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
      href: "/dashboard/fleet?status=available",
      gradient: "from-emerald-500 to-teal-600",
      tint: "bg-emerald-500/5",
      border: "border-emerald-500/15",
      icon: Car,
      textColor: "text-emerald-500",
    },
    {
      id: "rented",
      label: "Rented",
      count: rented,
      href: "/dashboard/fleet?status=rented",
      gradient: "from-blue-500 to-indigo-600",
      tint: "bg-blue-500/5",
      border: "border-blue-500/15",
      icon: TrendingUp,
      textColor: "text-blue-500",
    },
    {
      id: "service",
      label: "Needs Service",
      count: maintenance,
      href: "/dashboard/fleet?status=maintenance",
      gradient: "from-amber-500 to-orange-600",
      tint: "bg-amber-500/5",
      border: "border-amber-500/15",
      icon: Wrench,
      textColor: "text-amber-500",
    },
  ];

  // ✅ Tap-vs-Scroll detection state
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) return;
    const distX = Math.abs(e.clientX - pointerStart.current.x);
    const distY = Math.abs(e.clientY - pointerStart.current.y);
    
    // If moved more than 10px, assume the user is scrolling
    if (distX > 10 || distY > 10) {
      setIsDragging(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
    }
    // Otherwise let Next.js Link handle the actual navigation
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pr-16">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Fleet Status
          </p>
          <p className="text-xs text-ink-subtle mt-0.5 truncate">
            {operational}/{total} vehicles operational
          </p>
        </div>
      </div>

      {/* Utilization bar */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-bold text-ink-muted mb-1.5 uppercase tracking-wider">
          <span>Utilization</span>
          <span className="tabular-nums text-[11px] text-ink">{utilizationPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-hover overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${utilizationPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
          />
        </div>
      </div>

      {/* Snap-scroll tiles */}
      <div className="-mr-4">
        <div
          className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scroll-smooth pr-4 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tiles.map((tile) => {
            const Icon = tile.icon;
            const unit = tile.count === 1 ? "car" : "cars";

            return (
              <Link
                key={tile.id}
                href={tile.href}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onClick={handleClick}
                className={`snap-start flex-shrink-0 w-[62%] flex items-center gap-3 rounded-xl ${tile.tint} border ${tile.border} p-3 transition-all active:scale-[0.98] cursor-pointer hover:border-[var(--color-primary)]/30 group`}
              >
                {/* Icon Tile */}
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tile.gradient} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  <Icon size={18} className="text-white" strokeWidth={2.5} />
                </div>
                
                {/* Text Block */}
                <div className="min-w-0 flex flex-col justify-center">
                  <p className={`text-lg font-black tracking-tight font-display tabular-nums leading-none mb-0.5 ${tile.textColor}`}>
                    {tile.count} {unit}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted truncate group-hover:text-[var(--color-ink)] transition-colors">
                    {tile.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// src/components/fleet/mobile/FleetSection.tsx
"use client";

import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import FleetVehicleRow from "./FleetVehicleRow";
import type { Vehicle, Booking } from "@/lib/types";
import type { FleetSectionData } from "./types";

interface FleetSectionProps {
  section: FleetSectionData;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onEditCollection?: () => void;
  isMounted: boolean;
  isDark: boolean;
  isSelecting: boolean;
  selectedIds: Set<number>;
  activeRentals: Record<number, Booking>;
  makeHandlers: (vehicle: Vehicle) => {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onClick: () => void;
  };
  isFirst: boolean; // ✅ To handle rounded top corners
}

export default function FleetSection({
  section,
  isCollapsed,
  onToggleCollapse,
  onEditCollection,
  isMounted,
  isDark,
  isSelecting,
  selectedIds,
  activeRentals,
  makeHandlers,
  isFirst,
}: FleetSectionProps) {
  const isUngrouped = section.collection === null;

  return (
    <div className="w-full">
      {/* ✅ The Group Header Stripe */}
      <div
        className={`flex items-center justify-between px-3 py-2 bg-[var(--color-surface-hover)]/50 ${
          isFirst ? "rounded-t-2xl" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => !isUngrouped && onToggleCollapse()}
          className="flex items-center gap-2 min-w-0 flex-1 group"
        >
          {isUngrouped ? (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
              All units
            </span>
          ) : (
            <>
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isCollapsed ? (
                  <ChevronRight size={14} className="text-[var(--color-ink-muted)]" />
                ) : (
                  <ChevronDown size={14} className="text-[var(--color-ink-muted)]" />
                )}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                {section.collection!.name}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] text-[var(--color-ink-muted)] tabular-nums">
                {section.vehicles.length}
              </span>
            </>
          )}
        </button>
        {!isUngrouped && onEditCollection && (
          <button
            type="button"
            onClick={onEditCollection}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label="Edit collection"
          >
            <MoreHorizontal size={14} />
          </button>
        )}
      </div>

      {/* ✅ The Vehicle Rows (no extra background/border, they flow inside the main container) */}
      {!isCollapsed && (
        <div>
          {section.vehicles.map((item, idx) => (
            <FleetVehicleRow
              key={item.id}
              item={item}
              index={idx}
              total={section.vehicles.length}
              isSelected={selectedIds.has(item.id)}
              isSelecting={isSelecting}
              activeRental={activeRentals[item.id]}
              isMounted={isMounted}
              isDark={isDark}
              {...makeHandlers(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

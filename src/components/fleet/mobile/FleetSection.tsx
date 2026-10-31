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
    onMoreClick: (e: React.MouseEvent) => void;
  };
  isFirst: boolean;
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
      {/* Section header */}
      <div
        className={`flex items-center justify-between px-3 py-2 ${
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
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-[var(--color-ink-muted)] tabular-nums">
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

      {/* ✅ Each vehicle becomes its own rounded card with spacing */}
      {!isCollapsed && (
        <div className="flex flex-col gap-2 px-3 pb-3">
          {section.vehicles.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm"
            >
              <FleetVehicleRow
                item={item}
                isSelected={selectedIds.has(item.id)}
                isSelecting={isSelecting}
                activeRental={activeRentals[item.id]}
                isMounted={isMounted}
                isDark={isDark}
                {...makeHandlers(item)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

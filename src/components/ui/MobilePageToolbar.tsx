// src/components/ui/MobilePageToolbar.tsx
"use client";

import { Search, X } from "lucide-react";
import FilterDropdown, { FilterOption } from "@/components/ui/FilterDropdown";

/* ──────────────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────────────── */

export interface ToolbarSegment {
  id: string;
  label: string;
  icon?: React.ElementType;
}

export interface ToolbarFilter {
  id: string;
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  icon?: React.ElementType;
  allowClear?: boolean;
}

interface MobilePageToolbarProps {
  // Row 1 — search
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Row 1 — segment control
  segment: string;
  onSegmentChange: (value: string) => void;
  segments: ToolbarSegment[];
  /**
   * How the segment control behaves.
   * - "select" (default): shows active segment's icon, lists ALL segments with active marked.
   * - "navigate": fixed trigger icon, lists OTHER segments as destinations.
   * - "toggle": fixed trigger icon, no popover — tapping immediately switches to the
   *             other segment. Use only when exactly two segments exist.
   */
  segmentMenuMode?: "select" | "navigate" | "toggle";
  /** Required for "navigate" and "toggle" modes. Fixed trigger icon. */
  segmentTriggerIcon?: React.ElementType;
  /** Optional title for the trigger button. */
  segmentTriggerLabel?: string;

  // Row 1 — filters
  filters?: ToolbarFilter[];

  // Row 2 — primary action
  primaryAction: React.ReactNode;
}

/* ──────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────── */

export default function MobilePageToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  segment,
  onSegmentChange,
  segments,
  segmentMenuMode = "select",
  segmentTriggerIcon,
  segmentTriggerLabel,
  filters = [],
  primaryAction,
}: MobilePageToolbarProps) {
  const isNavigate = segmentMenuMode === "navigate";
  const isToggle = segmentMenuMode === "toggle";

  const activeSegment = segments.find((s) => s.id === segment) ?? segments[0];

  // ─── Toggle mode ────────────────────────────────────────────────
  // Two segments only. Tap → switch to the OTHER one. No popover.
  const toggleTarget = isToggle
    ? segments.find((s) => s.id !== segment)
    : undefined;

  const handleToggleClick = () => {
    if (toggleTarget) onSegmentChange(toggleTarget.id);
  };

  // ─── Select / Navigate modes (popover-based) ─────────────────────
  const popoverTriggerIcon = isNavigate
    ? (segmentTriggerIcon ?? activeSegment?.icon)
    : activeSegment?.icon;

  const popoverOptions: FilterOption[] = isNavigate
    ? segments
        .filter((s) => s.id !== segment)
        .map((s) => ({ label: s.label, value: s.id }))
    : segments.map((s) => ({ label: s.label, value: s.id }));

  // ✅ Popover segment is ONLY rendered in select / navigate mode.
  //    In toggle mode, the toggle button is the only segment control.
  const showPopoverSegment = isToggle
    ? false
    : isNavigate
    ? popoverOptions.length > 0
    : segments.length > 1;

  const showToggleSegment = isToggle && !!toggleTarget && !!segmentTriggerIcon;

  return (
    <div className="space-y-2">
      {/* ── Row 1: Search + grouped segment/filters ─────────────── */}
      <div className="flex items-center gap-2">
        {/* Search — flex-1, its own inset container */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-9 pr-9 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-all"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Grouped cluster — segment + filters */}
        <div className="flex items-center h-10 px-1 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex-shrink-0">
          {/* Toggle segment — direct-switch icon button (no popover) */}
          {showToggleSegment && toggleTarget && segmentTriggerIcon && (
            <>
              <ToggleSegmentButton
                icon={segmentTriggerIcon}
                label={segmentTriggerLabel ?? `Switch to ${toggleTarget.label}`}
                onClick={handleToggleClick}
              />
              {filters.length > 0 && <FadeSeparator />}
            </>
          )}

          {/* Popover segment — navigate / select modes ONLY */}
          {showPopoverSegment && (
            <>
              <FilterDropdown
                filterId="segment"
                label="View"
                options={popoverOptions}
                value={isNavigate ? null : segment}
                onChange={(value) => {
                  if (value) onSegmentChange(value);
                }}
                icon={popoverTriggerIcon}
                allowClear={false}
                variant="ghost"
              />
              {filters.length > 0 && <FadeSeparator />}
            </>
          )}

          {/* Filters */}
          {filters.map((filter, index) => (
            <div key={filter.id} className="flex items-center">
              <FilterDropdown
                filterId={filter.id}
                label={filter.label}
                options={filter.options}
                value={filter.value}
                onChange={filter.onChange}
                icon={filter.icon}
                allowClear={filter.allowClear ?? true}
                variant="ghost"
              />
              {index < filters.length - 1 && <FadeSeparator />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Primary action — full width ──────────────────── */}
      <div>{primaryAction}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Toggle segment — direct-switch icon button (no popover)
────────────────────────────────────────────────────────────────────── */

function ToggleSegmentButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-ink)] active:bg-[var(--color-primary)]/15 transition-all flex-shrink-0"
    >
      <Icon size={15} />
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Fade separator
────────────────────────────────────────────────────────────────────── */

function FadeSeparator() {
  return (
    <span
      aria-hidden="true"
      className="w-px h-5 mx-0.5 bg-gradient-to-b from-transparent via-[var(--color-surface-border)] to-transparent flex-shrink-0"
    />
  );
}

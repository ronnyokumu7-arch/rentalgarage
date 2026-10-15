// src/components/ui/MobileFloatingSegment.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { CarFront } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────────────── */

export interface FloatingSegmentItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface MobileFloatingSegmentProps {
  segments: FloatingSegmentItem[];
  active: string;
  onChange: (id: string) => void;
  /**
   * When set, the component behaves as a direct toggle:
   * tapping the trigger fires `onChange(toggleTarget)` immediately — no popover.
   * Use for two-segment contexts (Fleet mobile, Bookings mobile).
   * When not set, falls back to popover mode listing all other segments.
   */
  toggleTarget?: string;
  /** Trigger icon. Defaults to CarFront. */
  triggerIcon?: React.ElementType;
  /** Aria label. Defaults based on mode. */
  triggerAriaLabel?: string;
}

/* ──────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────── */

export default function MobileFloatingSegment({
  segments,
  active,
  onChange,
  toggleTarget,
  triggerIcon: TriggerIcon = CarFront,
  triggerAriaLabel,
}: MobileFloatingSegmentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isToggle = !!toggleTarget;

  // Popover destinations — everyone except the active tab
  const destinations = segments.filter((s) => s.id !== active);
  const toggleTargetSegment = segments.find((s) => s.id === toggleTarget);

  // Click-outside + Escape to close (popover mode only)
  useEffect(() => {
    if (!isOpen || isToggle) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isToggle]);

  // ─── Guard against no valid action ───────────────────────────────
  // Toggle mode needs a valid target. Popover mode needs at least one destination.
  if (isToggle) {
    if (!toggleTargetSegment) return null;
  } else {
    if (destinations.length === 0) return null;
  }

  const ariaLabel =
    triggerAriaLabel ??
    (isToggle && toggleTargetSegment
      ? `Switch to ${toggleTargetSegment.label}`
      : "Switch view");

  const handleTriggerClick = () => {
    if (isToggle && toggleTarget) {
      // Direct switch — no popover
      onChange(toggleTarget);
    } else {
      setIsOpen((v) => !v);
    }
  };

  return (
    <div className="md:hidden">
      <div
        ref={containerRef}
        className="fixed right-4 z-40"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)",
        }}
      >
        {/* Floating trigger */}
        <button
          type="button"
          onClick={handleTriggerClick}
          aria-label={ariaLabel}
          aria-haspopup={isToggle ? undefined : "true"}
          aria-expanded={isToggle ? undefined : isOpen}
          className="w-12 h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_28px_-8px_rgba(0,0,0,0.45)] active:scale-95 transition-all duration-200 flex items-center justify-center"
        >
          <TriggerIcon size={20} className="text-[var(--color-primary)]" />
        </button>

        {/* Popover — only in non-toggle mode */}
        {!isToggle && isOpen && (
          <>
            {/* Touch backdrop for reliable outside-tap on mobile */}
            <div
              className="fixed inset-0 -z-10"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            <div
              className="absolute right-0 bottom-[calc(100%+8px)] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              role="menu"
            >
              <div className="py-1">
                {destinations.map((segment) => {
                  const Icon = segment.icon;
                  return (
                    <button
                      key={segment.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onChange(segment.id);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      {Icon && (
                        <Icon
                          size={15}
                          className="text-[var(--color-primary)] flex-shrink-0"
                        />
                      )}
                      <span className="flex-1 text-left">{segment.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

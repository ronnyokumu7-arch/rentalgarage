"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from 'lucide-react';
import { TIME_SLOTS } from "./constants";

interface TimePickerProps {
  value: string;
  onChange: (t: string) => void;
  /** Earliest selectable time in "HH:MM" format. Slots earlier than this are hidden. */
  minTime?: string;
}

export default function TimePicker({ value, onChange, minTime }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Filter slots to those at or after minTime (string compare works for "HH:MM")
  const visibleSlots = useMemo(() => {
    if (!minTime) return TIME_SLOTS;
    return TIME_SLOTS.filter((slot) => slot >= minTime);
  }, [minTime]);

  // Auto-correct selected value if it falls outside the filtered range
  useEffect(() => {
    if (minTime && value && value < minTime) {
      onChange(visibleSlots[0] || minTime);
    }
  }, [minTime]); // intentionally omit value/onChange to avoid loop

  return (
    <div ref={ref} className="relative w-[104px] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Select time"
        className="w-full flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm font-semibold tabular-nums active:scale-[0.98]"
      >
        <Clock size={14} className="text-[var(--color-ink-subtle)]" />
        {value || "09:00"}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 right-0 w-48 max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] shadow-xl p-1 grid grid-cols-3 gap-1">
          {visibleSlots.length === 0 ? (
            <div className="col-span-3 text-[10px] text-center text-[var(--color-ink-muted)] py-3">
              No later slots available today
            </div>
          ) : (
            visibleSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => { onChange(slot); setOpen(false); }}
                className={`px-2 py-2 rounded-md text-xs font-semibold tabular-nums transition-colors ${
                  slot === (value || "09:00")
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]"
                }`}
              >
                {slot}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

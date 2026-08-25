"use client";

import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (t: string) => void;
  /** Earliest selectable time in "HH:MM" format. Times before this are blocked. */
  minTime?: string;
}

export default function TimePicker({ value, onChange, minTime }: TimePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-correct: if current value is earlier than minTime, snap forward.
  // Native input visually rejects it, but we also correct the state to keep
  // the form in sync with the user's intent.
  useEffect(() => {
    if (minTime && value && value < minTime) {
      onChange(minTime);
    }
  }, [minTime, value, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v) onChange(v);
  };

  // Open the picker when the wrapper is clicked (native input click area is small).
  const openPicker = () => {
    inputRef.current?.showPicker?.();
  };

  return (
    <div
      className="relative w-[104px] shrink-0 cursor-pointer"
      onClick={openPicker}
      role="presentation"
    >
      <div className="w-full flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/30 focus-within:border-[var(--color-primary)] transition-all text-sm font-semibold tabular-nums">
        <Clock size={14} className="text-[var(--color-ink-subtle)] shrink-0" />
        <input
          ref={inputRef}
          type="time"
          value={value || ""}
          min={minTime}
          onChange={handleChange}
          className="bg-transparent outline-none border-none p-0 m-0 w-full text-sm font-semibold tabular-nums text-[var(--color-ink)] cursor-pointer [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden"
          aria-label="Select time"
        />
      </div>

      {/* Visual fallback label when no value is set */}
      {!value && (
        <span className="absolute inset-0 flex items-center justify-center gap-1.5 px-2 pointer-events-none text-sm font-semibold text-[var(--color-ink-subtle)] tabular-nums">
          <Clock size={14} />
          09:00
        </span>
      )}
    </div>
  );
}

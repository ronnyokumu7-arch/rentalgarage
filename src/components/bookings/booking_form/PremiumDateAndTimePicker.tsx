"use client";

import { CalendarDays } from 'lucide-react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import TimePicker from "./TimePicker";
import { formatDateToLocalYYYYMMDD, inputClass, labelClass } from "./constants";

/**
 * Date + Time picker (time always visible = transparent pricing).
 *
 * Time-blocking props:
 *   - blockPast: when true AND the selected date is today, slots before "now
 *     (rounded up to the next 30-min boundary)" are hidden. Use on pickup.
 *   - minTime: explicit "HH:MM" constraint applied regardless of today-status.
 *     Use on return to force "after pickup" when same-day.
 */
export default function PremiumDateAndTimePicker({
  value,
  onChange,
  label,
  required = false,
  minDate,
  blockPast = false,
  minTime,
}: {
  value: string; // "YYYY-MM-DDTHH:mm:ss" or ""
  onChange: (datetime: string) => void;
  label: string;
  required?: boolean;
  minDate?: string;
  blockPast?: boolean;
  minTime?: string;
}) {
  const [datePart, timeRaw] = value ? value.split("T") : ["", ""];
  const timePart = timeRaw ? timeRaw.slice(0, 5) : "";

  // ✅ Guard: never emit partial datetimes (e.g., "T08:00:00" or "2026-01-26T:00")
  const emit = (d: string, t: string) => {
    if (!d || !t) return;
    onChange(`${d}T${t}:00`);
  };

  // Compute "now rounded up to next 30-min slot" for past-time blocking
  const isToday = datePart === formatDateToLocalYYYYMMDD(new Date());
  const nowMinTime = (() => {
    if (!blockPast || !isToday) return undefined;
    const now = new Date();
    const totalMin = now.getHours() * 60 + now.getMinutes();
    const slotMin = Math.ceil(totalMin / 30) * 30;
    const h = Math.floor(slotMin / 60);
    const m = slotMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  })();

  // Explicit minTime wins over computed; fall back to computed if set
  const effectiveMinTime = minTime || nowMinTime;

  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <div className="flex gap-2">
        {/* Date */}
        <div className="relative flex-1 min-w-0">
          <CalendarDays size={16} className="absolute left-3 top-3 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
          <Flatpickr
            value={datePart}
            onChange={(dates) => {
              if (dates[0]) {
                const newDate = formatDateToLocalYYYYMMDD(dates[0]);
                // If switching to today AND current time is past the current slot, default to next slot
                const isSwitchingToToday = newDate === formatDateToLocalYYYYMMDD(new Date());
                let defaultTime = timePart || "09:00";
                if (isSwitchingToToday && blockPast && nowMinTime && defaultTime < nowMinTime) {
                  defaultTime = nowMinTime;
                }
                emit(newDate, defaultTime);
              }
            }}
            options={{
              dateFormat: "Y-m-d",
              minDate: minDate || "today",
              disableMobile: true,
            }}
            className={inputClass}
            placeholder="Select date..."
          />
        </div>
        {/* Time — native input, always visible */}
        <TimePicker
          value={timePart || "09:00"}
          onChange={(t) => emit(datePart || formatDateToLocalYYYYMMDD(new Date()), t)}
          minTime={effectiveMinTime}
        />
      </div>
    </div>
  );
}

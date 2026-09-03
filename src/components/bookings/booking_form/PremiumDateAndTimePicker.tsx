"use client";

import { useState } from "react";
import { CalendarDays, X, Check } from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { inputClass, labelClass } from "./constants";

/**
 * ✅ MODAL-BASED DATE+TIME PICKER — 12-hour clock with AM/PM.
 *
 * Flow: click input → modal → pick date → set time (1–12 + AM/PM) → Save.
 * Internally everything is stored/emitted as 24h "YYYY-MM-DDTHH:mm"
 * (backend contract unchanged); only the editing UI is 12h.
 *
 * Snap rules (contract v2.1), applied on Save:
 *   - Start pickers: earlier than now → snaps to current minute ("now" allowed).
 *   - End pickers (floor + exclusiveFloor): <= floor → snaps to floor + 1 min.
 */
export default function PremiumDateAndTimePicker({
  value,
  onChange,
  label,
  required = false,
  floor,
  exclusiveFloor = false,
}: {
  value: string;
  onChange: (localDatetime: string) => void;
  label: string;
  required?: boolean;
  floor?: string;
  exclusiveFloor?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<string>("");
  const [draftHour, setDraftHour] = useState<string>("9");   // 1–12
  const [draftMinute, setDraftMinute] = useState<string>("00");
  const [draftMeridiem, setDraftMeridiem] = useState<"AM" | "PM">("AM");

  const pad = (n: number) => String(n).padStart(2, "0");

  // ── 12h ⇄ 24h conversions ────────────────────────────────────────
  const to12 = (h24: number): { h12: number; meridiem: "AM" | "PM" } => {
    const meridiem = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return { h12, meridiem };
  };

  const to24 = (h12: number, meridiem: "AM" | "PM"): number => {
    let h = h12 % 12;
    if (meridiem === "PM") h += 12;
    return h;
  };

  const parseValue = (iso: string) => {
    if (!iso) return { date: "", h12: "9", minute: "00", meridiem: "AM" as "AM" | "PM" };
    const d = new Date(iso);
    if (isNaN(d.getTime())) return { date: "", h12: "9", minute: "00", meridiem: "AM" as "AM" | "PM" };
    const { h12, meridiem } = to12(d.getHours());
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      h12: String(h12),
      minute: pad(d.getMinutes()),
      meridiem,
    };
  };

  const openModal = () => {
    const { date, h12, minute, meridiem } = parseValue(value);
    setDraftDate(date);
    setDraftHour(h12);
    setDraftMinute(minute);
    setDraftMeridiem(meridiem);
    setIsOpen(true);
  };

  // ── Snap rules (contract v2.1) ───────────────────────────────────
  const floorDate = floor ? new Date(floor) : null;
  const snap = (d: Date): Date => {
    if (exclusiveFloor && floorDate) {
      if (d <= floorDate) {
        const s = new Date(floorDate);
        s.setMinutes(s.getMinutes() + 1);
        s.setSeconds(0, 0);
        return s;
      }
      return d;
    }
    const nowMinute = new Date();
    nowMinute.setSeconds(0, 0);
    return d < nowMinute ? nowMinute : d;
  };

  const saveAndClose = () => {
    if (!draftDate) return;
    const h24 = to24(Math.min(12, Math.max(1, parseInt(draftHour) || 12)), draftMeridiem);
    const m = Math.min(59, Math.max(0, parseInt(draftMinute) || 0));
    const combined = new Date(`${draftDate}T${pad(h24)}:${pad(m)}:00`);
    const snapped = snap(combined);
    onChange(
      `${snapped.getFullYear()}-${pad(snapped.getMonth() + 1)}-${pad(snapped.getDate())}T${pad(snapped.getHours())}:${pad(snapped.getMinutes())}`
    );
    setIsOpen(false);
  };

  const cancelAndClose = () => setIsOpen(false);

  // Display value for the input (12h, human-friendly)
  const displayValue = (() => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  })();

  const refDay = exclusiveFloor && floorDate ? floorDate : new Date();
  const minDay = new Date(refDay.getFullYear(), refDay.getMonth(), refDay.getDate());

  const timeInputClass =
    "px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-bg)] text-[var(--color-ink)] text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all";

  return (
    <div>
      <label className={labelClass}>
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <div className="relative">
        <CalendarDays
          size={16}
          className="absolute left-3 top-3 text-[var(--color-ink-subtle)] pointer-events-none z-10"
        />
        <button
          type="button"
          onClick={openModal}
          className={`${inputClass} text-left cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors`}
        >
          {displayValue || "Select date & time..."}
        </button>
      </div>

      {/* ── MODAL ── */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)]">
              <h3 className="text-base font-bold text-[var(--color-ink)]">{label}</h3>
              <button
                onClick={cancelAndClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Step 1: Date */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-ink-muted)] mb-2 block">
                  Date
                </label>
                <Flatpickr
                  value={draftDate}
                  onChange={(dates) => {
                    if (dates[0]) {
                      const d = dates[0];
                      setDraftDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
                    }
                  }}
                  options={{
                    dateFormat: "Y-m-d",
                    minDate: minDay,
                    disableMobile: true,
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-bg)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-all"
                  placeholder="Select date..."
                />
              </div>

              {/* Step 2: Time (12h + AM/PM) */}
              <div>
                <label className="text-xs font-semibold text-[var(--color-ink-muted)] mb-2 block">
                  Time
                </label>
                <div className="flex items-center gap-2">
                  {/* Hour 1–12 */}
                  <select
                    value={draftHour}
                    onChange={(e) => setDraftHour(e.target.value)}
                    className={`${timeInputClass} w-20 cursor-pointer`}
                    aria-label="Hour"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <option key={h} value={String(h)}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <span className="text-2xl font-bold text-[var(--color-ink-muted)]">:</span>

                  {/* Minute 00–59 */}
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={draftMinute}
                    onChange={(e) => setDraftMinute(pad(Math.min(59, Math.max(0, parseInt(e.target.value) || 0))))}
                    className={`${timeInputClass} w-20`}
                    aria-label="Minute"
                  />

                  {/* AM / PM segmented toggle */}
                  <div className="flex rounded-xl border border-[var(--color-surface-border)] overflow-hidden ml-1">
                    {(["AM", "PM"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDraftMeridiem(m)}
                        className={`px-3 py-2.5 text-sm font-bold transition-colors ${
                          draftMeridiem === m
                            ? "bg-[var(--color-primary)] text-white"
                            : "bg-[var(--color-bg)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-surface-border)] bg-[var(--color-bg)]/50 rounded-b-2xl">
              <button
                type="button"
                onClick={cancelAndClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAndClose}
                disabled={!draftDate}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <Check size={16} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

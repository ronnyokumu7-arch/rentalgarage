// src/components/forms/DateRangePicker.tsx
"use client";
import { CalendarDots as CalendarDays, ArrowRight } from "@phosphor-icons/react/ssr";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  minDate?: string;
  label?: string;
  required?: boolean; // ✅ Added this
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  label,
  required = false, // ✅ Added this
}: DateRangePickerProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
        {/* Start Date */}
        <div className="flex-1 relative group">
          <CalendarDays size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" aria-hidden="true" />
          <input
            type="date"
            value={startDate || ""}
            onChange={(e) => onStartDateChange(e.target.value)}
            min={minDate}
            className="w-full bg-transparent text-sm text-gray-900 pl-8 pr-2 py-2 rounded-lg outline-none cursor-pointer hover:bg-gray-50 transition-colors"
            placeholder="Start Date"
          />
        </div>

        {/* Divider with Arrow */}
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0">
          <ArrowRight size={14} className="text-gray-400" aria-hidden="true" />
        </div>

        {/* End Date */}
        <div className="flex-1 relative group">
          <CalendarDays size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" aria-hidden="true" />
          <input
            type="date"
            value={endDate || ""}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || minDate}
            className="w-full bg-transparent text-sm text-gray-900 pl-8 pr-2 py-2 rounded-lg outline-none cursor-pointer hover:bg-gray-50 transition-colors"
            placeholder="End Date"
          />
        </div>
      </div>
    </div>
  );
}

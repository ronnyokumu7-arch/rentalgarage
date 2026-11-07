"use client";
import React, { useState } from "react";
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight, Calendar as CalendarIcon } from "@phosphor-icons/react/ssr";

interface CalendarEvent {
  id: string | number;
  title: string;
  date: string;
  type: "check-in" | "check-out" | "maintenance";
  clientName?: string;
  vehicleName?: string;
}

interface BookingCalendarProps {
  events?: CalendarEvent[];
  currentMonth?: Date;
}

export default function BookingCalendar({ events = [], currentMonth }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(currentMonth || new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateStr);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const navigateMonth = (direction: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(selectedDate);
  const today = new Date();

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-accent-dark" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-ink">
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted hover:bg-surface-hover transition-colors"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-muted hover:bg-surface-hover transition-colors"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-ink-subtle py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = date && date.toDateString() === today.toDateString();

          return (
            <div
              key={index}
              className={`
                min-h-[60px] p-1 rounded-lg border transition-all
                ${!date ? "invisible" : ""}
                ${isToday ? "bg-accent-bg/30 border-accent/30" : "bg-surface border-surface-border"}
                ${dayEvents.length > 0 ? "cursor-pointer hover:border-accent/50" : ""}
              `}
            >
              {date && (
                <>
                  <div className={`
                    text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? "bg-accent-dark text-white" : "text-ink"}
                  `}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`
                          text-[9px] px-1 py-0.5 rounded truncate
                          ${event.type === "check-in" ? "bg-success-bg text-success-text" : ""}
                          ${event.type === "check-out" ? "bg-warning-bg text-warning-text" : ""}
                          ${event.type === "maintenance" ? "bg-danger-bg text-danger-text" : ""}
                        `}
                      >
                        {event.type === "check-in" ? "✓" : event.type === "check-out" ? "○" : "!"} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-ink-subtle pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-surface-border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success-bg" />
          <span className="text-xs text-ink-subtle">Check-in</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning-bg" />
          <span className="text-xs text-ink-subtle">Check-out</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-danger-bg" />
          <span className="text-xs text-ink-subtle">Maintenance</span>
        </div>
      </div>
    </div>
  );
}

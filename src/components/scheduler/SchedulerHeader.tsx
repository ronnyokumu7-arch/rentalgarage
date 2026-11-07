// src/components/scheduler/SchedulerHeader.tsx
"use client";

import { CaretLeft as ChevronLeft, CaretRight as ChevronRight, Calendar, Plus, MagnifyingGlass as Search, Funnel as Filter, X, Minus, Plus as PlusIcon } from "@phosphor-icons/react/ssr";
import { format, parseISO } from "date-fns";

interface SchedulerHeaderProps {
  viewStartDate: string;
  viewEndDate: string;
  searchQuery: string;
  statusFilter: string;
  isCreateMode: boolean;
  daysToShow: number;
  onShiftWindow: (direction: "prev" | "next") => void;
  onJumpToToday: () => void;
  onToggleCreateMode: () => void;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

export default function SchedulerHeader({
  viewStartDate,
  viewEndDate,
  searchQuery,
  statusFilter,
  isCreateMode,
  daysToShow,
  onShiftWindow,
  onJumpToToday,
  onToggleCreateMode,
  onSearchChange,
  onStatusFilterChange,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
}: SchedulerHeaderProps) {
  return (
    <header className="flex-none flex items-center justify-between gap-4 p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] z-10">
      {/* Left: Date Navigation & Zoom Controls */}
      <div className="flex items-center gap-4">
        {/* Date Navigation */}
        <nav className="flex items-center p-1 border rounded-xl bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]">
          <button
            type="button"
            onClick={() => onShiftWindow("prev")}
            className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-ink-muted)]"
            title="Previous period"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onJumpToToday}
            className="flex items-center gap-1.5 px-3 h-8 text-xs font-extrabold transition-colors rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-ink)]"
          >
            <Calendar size={14} className="text-[var(--color-primary)]" aria-hidden="true" />
            Today
          </button>
          <button
            type="button"
            onClick={() => onShiftWindow("next")}
            className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-ink-muted)]"
            title="Next period"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>

        {/* Zoom Controls */}
        <nav className="flex items-center p-1 border rounded-xl bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]">
          <button
            type="button"
            onClick={onZoomIn}
            disabled={!canZoomIn}
            className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-ink-muted)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title={canZoomIn ? "Zoom in: Show fewer days" : "Minimum view (1 day)"}
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          
          {/* View Indicator */}
          <div className="flex items-center gap-2 px-3">
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">
              {daysToShow} {daysToShow === 1 ? 'day' : 'days'}
            </span>
            <span className="text-[10px] text-[var(--color-ink-subtle)]">
              {daysToShow === 1 ? 'Day' : daysToShow <= 7 ? 'Week' : daysToShow <= 14 ? 'Bi-week' : 'Month'}
            </span>
          </div>

          <button
            type="button"
            onClick={onZoomOut}
            disabled={!canZoomOut}
            className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-ink-muted)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            title={canZoomOut ? "Zoom out: Show more days" : "Maximum view (31 days)"}
          >
            <PlusIcon size={14} aria-hidden="true" />
          </button>
        </nav>

        {/* Date Range Display */}
        <div className="hidden text-xs font-bold font-mono text-[var(--color-ink-muted)] sm:block">
          {format(parseISO(viewStartDate), "MMM d")} – {format(parseISO(viewEndDate), "MMM d, yyyy")}
        </div>
      </div>

      {/* Right: Search, Filter, CTA */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          <input
            type="text"
            placeholder="Filter staff..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-44 h-9 pl-9 pr-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 text-xs text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Status Filter */}
        <div className="relative flex items-center">
          <Filter size={13} className="absolute left-3 text-[var(--color-ink-subtle)] pointer-events-none" aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-9 pl-8 pr-8 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 text-xs font-semibold text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Schedule Workflow Button */}
        <button
          type="button"
          onClick={onToggleCreateMode}
          className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
            isCreateMode
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-[var(--color-primary)] text-white"
          }`}
        >
          {isCreateMode ? <X size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
          <span>{isCreateMode ? "Exit" : "Schedule Workflow"}</span>
        </button>
      </div>
    </header>
  );
}

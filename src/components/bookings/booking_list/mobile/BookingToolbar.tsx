// src/components/bookings/booking_list/mobile/BookingToolbar.tsx
"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";

interface BookingToolbarProps {
  search: string;
  setSearch: (v: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  searchFocused: boolean;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  hasActiveFilter: boolean;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  statusOptions: { label: string; value: string; count?: number }[];
}

export default function BookingToolbar({
  search,
  setSearch,
  onSearchFocus,
  onSearchBlur,
  filtersOpen,
  onToggleFilters,
  hasActiveFilter,
  statusFilter,
  setStatusFilter,
  statusOptions,
}: BookingToolbarProps) {
  const handleClearSearch = () => {
    setSearch("");
  };

  return (
    <div className="sticky top-0 z-30 bg-[var(--color-bg)] py-2">
      <div className="px-0">
        <div className="space-y-2">
          {/* Search bar */}
          <div className="flex items-center h-11 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] overflow-hidden transition-colors mx-0">
            <div className="relative flex-1 h-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                placeholder="Search bookings..."
                className="w-full h-full pl-10 pr-2 bg-transparent text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] outline-none"
              />
              {search && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center hover:bg-[var(--color-surface-border)] transition-colors"
                  aria-label="Clear search"
                >
                  <X size={12} className="text-[var(--color-ink-muted)]" />
                </button>
              )}
            </div>

            <div className="pr-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFilters();
                }}
                aria-label={filtersOpen ? "Hide filters" : "Show filters"}
                aria-expanded={filtersOpen}
                className={`relative h-8 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 ${
                  filtersOpen
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : hasActiveFilter
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15"
                      : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                }`}
              >
                <SlidersHorizontal size={14} />
                {hasActiveFilter && !filtersOpen && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                )}
              </button>
            </div>
          </div>

          {/* Filter pills */}
          {filtersOpen && (
            <div className="relative animate-in slide-in-from-top-1 fade-in duration-200">
              <div className="overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-2 py-1 px-3 pr-6">
                  <button
                    onClick={() => setStatusFilter(null)}
                    className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border ${
                      !statusFilter
                        ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    All
                  </button>
                  {statusOptions.map((opt) => {
                    const isActive = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border ${
                          isActive
                            ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                            : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                className="pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

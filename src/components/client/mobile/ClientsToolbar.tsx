// src/components/clients/mobile/ClientsToolbar.tsx
"use client";

import {
  Search,
  X,
  SlidersHorizontal,
  Shield,
  Ban,
  Archive,
  Calendar,
} from "lucide-react";

interface ClientsToolbarProps {
  isSelecting: boolean;
  selectedCount: number;
  onClearSelection: () => void;
  onBatchVerify: () => void;
  onBatchSuspend: () => void;
  onBatchArchive: () => void;

  search: string;
  setSearch: (v: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  placeholder: string;

  filtersOpen: boolean;
  onToggleFilters: () => void;

  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  statusOptions: { label: string; value: string; count: number }[];

  hasActiveFilter: boolean;
  searchFocused: boolean;
}

export default function ClientsToolbar({
  isSelecting,
  selectedCount,
  onClearSelection,
  onBatchVerify,
  onBatchSuspend,
  onBatchArchive,
  search,
  setSearch,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  searchInputRef,
  placeholder,
  filtersOpen,
  onToggleFilters,
  statusFilter,
  setStatusFilter,
  statusOptions,
  hasActiveFilter,
  searchFocused,
}: ClientsToolbarProps) {
  return (
    <div
      className="sticky top-0 z-20 bg-[var(--color-bg)] py-2"
      data-selection-zone
    >
      <div className="px-0">
        {isSelecting ? (
          <div className="flex items-center justify-between gap-2 px-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onClearSelection}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                aria-label="Clear selection"
              >
                <X size={16} />
              </button>
              <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                {selectedCount} selected
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onBatchVerify}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Verify clients"
              >
                <Shield size={16} />
              </button>
              <button
                onClick={onBatchSuspend}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Suspend clients"
              >
                <Ban size={16} />
              </button>
              <button
                onClick={onBatchArchive}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Archive clients"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center h-11 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] overflow-hidden transition-colors mx-0">
              <div className="relative flex-1 h-full">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                  placeholder={placeholder}
                  className="w-full h-full pl-10 pr-2 bg-transparent text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onClearSearch}
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

            {filtersOpen && !searchFocused && (
              <div className="relative animate-in slide-in-from-top-1 fade-in duration-200">
                <div className="overflow-x-auto scrollbar-none">
                  <div className="flex items-center gap-2 py-1 px-3 pr-6">
                    <button
                      onClick={() => setStatusFilter(null)}
                      className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border ${
                        statusFilter === null || statusFilter === ""
                          ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                          : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      All
                    </button>

                    {statusOptions
                      .filter((opt) => opt.value !== "pending" && opt.value !== "inactive")
                      .map((opt) => {
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

                    <button
                      onClick={() => setStatusFilter("with_booking")}
                      className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                        statusFilter === "with_booking"
                          ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                          : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <Calendar size={11} className="flex-shrink-0" />
                      With Booking
                    </button>

                    <button
                      onClick={() => setStatusFilter("inactive")}
                      className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                        statusFilter === "inactive"
                          ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                          : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <Archive size={11} className="flex-shrink-0" />
                      Archived
                    </button>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

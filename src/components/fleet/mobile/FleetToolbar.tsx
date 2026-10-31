// src/components/fleet/mobile/FleetToolbar.tsx
"use client";

import {
  X, Search, SlidersHorizontal, Wrench, Archive,
  FolderPlus, Folder, Plus,
} from "lucide-react";
import type { VehicleStatus } from "@/lib/types";
import type { VehicleCollection } from "@/lib/collections";

interface FleetToolbarProps {
  isSelecting: boolean;
  selectedCount: number;
  onClearSelection: () => void;
  onBatchAddToCollection: () => void;
  onBatchMileage: () => void;
  onBatchMaintenance: () => void;
  onBatchArchive: () => void;

  search: string;
  setSearch: (v: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;

  filtersOpen: boolean;
  onToggleFilters: () => void;

  statusFilter: VehicleStatus | "" | "mileage_due";
  setStatusFilter: (v: VehicleStatus | "" | "mileage_due") => void;
  statusOptions: { label: string; value: string; count: number }[];
  collectionFilter: string | null;
  setCollectionFilter: (v: string | null) => void;
  collections: VehicleCollection[];
  onCreateCollection: () => void;

  hasActiveFilter: boolean;
  searchFocused: boolean;
}

export default function FleetToolbar({
  isSelecting,
  selectedCount,
  onClearSelection,
  onBatchAddToCollection,
  onBatchMileage,
  onBatchMaintenance,
  onBatchArchive,
  search,
  setSearch,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  searchInputRef,
  filtersOpen,
  onToggleFilters,
  statusFilter,
  setStatusFilter,
  statusOptions,
  collectionFilter,
  setCollectionFilter,
  collections,
  onCreateCollection,
  hasActiveFilter,
  searchFocused,
}: FleetToolbarProps) {
  const pillOptions = statusOptions.filter(
    (opt) => opt.value !== "pending_activation" && opt.value !== "maintenance",
  );

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
                onClick={onBatchAddToCollection}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
                aria-label="Add to collection"
              >
                <FolderPlus size={16} />
              </button>
              <button
                onClick={onBatchMileage}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Update mileage"
              >
                <Wrench size={16} />
              </button>
              <button
                onClick={onBatchMaintenance}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Send to maintenance"
              >
                <Wrench size={16} />
              </button>
              <button
                onClick={onBatchArchive}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Archive"
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
                  placeholder="Search vehicle, plate, driver..."
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
                      onClick={() => {
                        setStatusFilter("");
                        setCollectionFilter(null);
                      }}
                      className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border ${
                        statusFilter === "" && collectionFilter === null
                          ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                          : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      All
                    </button>

                    {collections.length > 0 && (
                      <>
                        <div className="h-5 w-px bg-[var(--color-surface-border)] mx-1 flex-shrink-0" />
                        {collections.map((c) => {
                          const isActive = collectionFilter === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => setCollectionFilter(isActive ? null : c.id)}
                              className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                                isActive
                                  ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                  : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                              }`}
                            >
                              <Folder size={11} className="flex-shrink-0" />
                              {c.name}
                            </button>
                          );
                        })}
                        <div className="h-5 w-px bg-[var(--color-surface-border)] mx-1 flex-shrink-0" />
                      </>
                    )}

                    {pillOptions.map((opt) => {
                      const isActive = statusFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() =>
                            setStatusFilter((opt.value || "") as VehicleStatus | "")
                          }
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
                      onClick={() => setStatusFilter("maintenance")}
                      className={`flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                        statusFilter === "maintenance"
                          ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                          : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      <Wrench size={11} className="flex-shrink-0" />
                      Garage
                    </button>
                    <button
                      onClick={() => {
                        setCollectionFilter(null);
                        onCreateCollection();
                      }}
                      className="flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border border-dashed border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] flex items-center gap-1.5"
                    >
                      <Plus size={11} className="flex-shrink-0" />
                      New Collection
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

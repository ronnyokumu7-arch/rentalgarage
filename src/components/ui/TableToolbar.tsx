// src/components/ui/TableToolbar.tsx
"use client";

import { useState } from "react";
import { Search, Download, ChevronDown, X, Filter } from "lucide-react";
import FilterDropdown, { FilterOption } from "./FilterDropdown";

interface TableToolbarProps {
  // View Toggle
  viewMode: "active" | "vault";
  onViewModeChange: (mode: "active" | "vault") => void;
  activeCount: number;
  vaultCount: number;

  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filter (now uses FilterDropdown)
  filterId: string; // Unique ID for the filter dropdown
  filterLabel: string; // Label for the filter (e.g., "Status")
  filterValue: string | null;
  onFilterChange: (value: string | null) => void;
  filterOptions: FilterOption[];

  // Export
  onExport?: (format: "csv" | "excel") => void;
}

export default function TableToolbar({
  activeCount,
  vaultCount,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterId,
  filterLabel,
  filterValue,
  onFilterChange,
  filterOptions,
  onExport,
}: TableToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
      
      {/* Left: View Toggle + Metrics (matches Clients page counter pattern) */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
          <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
          <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{activeCount}</span>
        </div>
        <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
          <span className="text-xs font-medium text-[var(--color-ink-muted)]">Vault</span>
          <span className="text-xs font-bold text-[var(--color-ink-muted)] tabular-nums">{vaultCount}</span>
        </div>
      </div>

      {/* Right: Search + Filter + Export (matches Clients page controls pattern) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
        <div className="flex items-center gap-2 flex-1 sm:w-80">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-all"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* ✅ Reusable FilterDropdown (replaces native select) */}
          <FilterDropdown
            filterId={filterId}
            label={filterLabel}
            options={filterOptions}
            value={filterValue}
            onChange={onFilterChange}
            icon={Filter}
          />
        </div>

        {/* Export Button with Dropdown */}
        {onExport && (
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <Download size={14} />
              Export
              <ChevronDown size={12} />
            </button>
            
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => { onExport("csv"); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center text-[var(--color-success-text)] font-bold text-xs">
                      CSV
                    </div>
                    <div>
                      <div className="font-medium">Download CSV</div>
                      <div className="text-[10px] text-[var(--color-ink-subtle)]">Comma-separated</div>
                    </div>
                  </button>
                  <div className="h-px bg-[var(--color-surface-border)]" />
                  <button
                    type="button"
                    onClick={() => { onExport("excel"); setShowExportMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-xs">
                      XLS
                    </div>
                    <div>
                      <div className="font-medium">Download Excel</div>
                      <div className="text-[10px] text-[var(--color-ink-subtle)]">Microsoft Excel</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

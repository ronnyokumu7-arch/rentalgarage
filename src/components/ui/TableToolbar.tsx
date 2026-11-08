"use client";
import { useState } from "react";
import { Search, Filter, Download, ChevronDown, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface TableToolbarProps {
  // View Toggle
  viewMode: "active" | "vault";
  onViewModeChange: (mode: "active" | "vault") => void;
  activeCount?: number;
  vaultCount?: number;

  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filter
  filterValue: string | null;
  onFilterChange: (value: string | null) => void;
  filterOptions: FilterOption[];
  filterPlaceholder?: string;

  // Export
  onExport?: (format: "csv" | "excel") => void;
}

export default function TableToolbar({
  viewMode,
  onViewModeChange,
  activeCount,
  vaultCount,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = "All",
  onExport,
}: TableToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="p-4 border-b border-surface-border bg-surface-card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Side: Toggle + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
          
          {/* View Toggle - Active/Vault */}
          <div className="inline-flex p-1 rounded-lg bg-surface-hover border border-surface-border flex-shrink-0">
            <button
              onClick={() => onViewModeChange("active")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "active"
                  ? "bg-surface-card text-ink shadow-sm border border-surface-border"
                  : "text-ink-muted hover:text-ink hover:bg-surface-card/50"
              }`}
            >
              Active {activeCount !== undefined && <span className="ml-1 text-xs opacity-70">({activeCount})</span>}
            </button>
            <button
              onClick={() => onViewModeChange("vault")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "vault"
                  ? "bg-surface-card text-ink shadow-sm border border-surface-border"
                  : "text-ink-muted hover:text-ink hover:bg-surface-card/50"
              }`}
            >
              Vault {vaultCount !== undefined && <span className="ml-1 text-xs opacity-70">({vaultCount})</span>}
            </button>
          </div>

          {/* Search Input with Enhanced Hover */}
          <div className="relative w-full sm:w-72 flex-shrink-0 group">
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle transition-colors group-hover:text-ink-muted" 
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-surface-border bg-surface-card text-ink placeholder:text-ink-subtle 
                transition-all duration-200
                hover:border-surface-border-strong hover:shadow-sm
                focus:border-accent-dark focus:ring-2 focus:ring-accent-bg/20 focus:outline-none"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Filter + Export */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* Filter Dropdown with Enhanced Hover */}
          <div className="relative w-full sm:w-48 flex-shrink-0 group">
            <Filter 
              size={14} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none transition-colors group-hover:text-ink-muted" 
            />
            <select
              value={filterValue || ""}
              onChange={(e) => onFilterChange(e.target.value || null)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-surface-border bg-surface-card text-ink appearance-none cursor-pointer
                transition-all duration-200
                hover:border-surface-border-strong hover:shadow-sm
                focus:border-accent-dark focus:ring-2 focus:ring-accent-bg/20 focus:outline-none"
            >
              <option value="">{filterPlaceholder}</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={14} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none transition-colors group-hover:text-ink-muted" 
            />
          </div>

          {/* Export Button with Dropdown */}
          {onExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-surface-border bg-surface-card text-ink-muted
                  transition-all duration-200
                  hover:border-surface-border-strong hover:text-ink hover:shadow-sm
                  focus:border-accent-dark focus:ring-2 focus:ring-accent-bg/20 focus:outline-none"
              >
                <Download size={14} />
                Export
                <ChevronDown size={12} className="ml-1" />
              </button>
              
              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowExportMenu(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 z-20 bg-surface-card border border-surface-border rounded-lg shadow-[var(--shadow-dropdown)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => { onExport("csv"); setShowExportMenu(false); }}
                      className="w-full px-4 py-3 text-left text-sm text-ink hover:bg-surface-hover flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-success-bg flex items-center justify-center text-success-text font-bold text-xs">
                        CSV
                      </div>
                      <div>
                        <div className="font-medium">Download CSV</div>
                        <div className="text-xs text-ink-subtle">Comma-separated</div>
                      </div>
                    </button>
                    <div className="h-px bg-surface-border" />
                    <button
                      onClick={() => { onExport("excel"); setShowExportMenu(false); }}
                      className="w-full px-4 py-3 text-left text-sm text-ink hover:bg-surface-hover flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent-bg flex items-center justify-center text-accent-dark font-bold text-xs">
                        XLS
                      </div>
                      <div>
                        <div className="font-medium">Download Excel</div>
                        <div className="text-xs text-ink-subtle">Microsoft Excel</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

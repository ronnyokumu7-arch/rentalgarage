"use client";
import React from "react";
import { Funnel as Filter } from "@phosphor-icons/react/ssr";
// Import your existing SearchInput component
import SearchInput from "./SearchInput"; 

interface FilterOption {
  value: string;
  label: string;
}

interface ListToolbarProps {
  // View Toggle Props
  viewMode: "active" | "archived";
  onViewModeChange: (mode: "active" | "archived") => void;
  activeCount: number;
  archivedCount: number;

  // Search Props
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filter Props
  filterValue: string | null;
  onFilterChange: (value: string | null) => void;
  filterOptions: FilterOption[];
  filterPlaceholder?: string;
}

export default function ListToolbar({
  viewMode,
  onViewModeChange,
  activeCount,
  archivedCount,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = "All Statuses",
}: ListToolbarProps) {
  return (
    <div className="p-4 border-b border-surface-border bg-surface-card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Side: Toggle + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
          
          {/* 1. View Toggle (Active/Archived) */}
          <div className="inline-flex p-1 rounded-lg bg-surface-hover border border-surface-border flex-shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange("active")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "active"
                  ? "bg-surface-card text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Active <span className="ml-1 text-xs opacity-70">({activeCount})</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("archived")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === "archived"
                  ? "bg-surface-card text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Archived <span className="ml-1 text-xs opacity-70">({archivedCount})</span>
            </button>
          </div>

          {/* 2. Search Input (Using your existing component) */}
          <div className="w-full sm:w-72 flex-shrink-0">
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
        </div>

        {/* Right Side: Filter Dropdown */}
        <div className="relative w-full sm:w-48 flex-shrink-0">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" aria-hidden="true" />
          <select
            value={filterValue || ""}
            onChange={(e) => onFilterChange(e.target.value || null)}
            className="input pl-9 pr-8 py-2 text-sm appearance-none cursor-pointer w-full bg-surface-card"
          >
            <option value="">{filterPlaceholder}</option>
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

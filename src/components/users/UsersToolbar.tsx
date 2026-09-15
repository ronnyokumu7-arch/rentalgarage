// src/components/users/UsersToolbar.tsx
"use client";

import { Search, Shield, Briefcase, Filter } from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import AddUserButton from "@/components/users/AddUserButton";
import type { CategoryMode } from "@/hooks/users/useUsersList";

interface UsersToolbarProps {
  category: CategoryMode;
  setCategory: (cat: CategoryMode) => void;
  search: string;
  setSearch: (val: string) => void;
  departmentFilter: string | null;
  setDepartmentFilter: (val: string | null) => void;
  departmentOptions: { value: string; label: string }[];
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  onQuickAdd: () => void;
  onInvite: () => void;
}

export default function UsersToolbar({
  category,
  setCategory,
  search,
  setSearch,
  departmentFilter,
  setDepartmentFilter,
  departmentOptions,
  totalUsers,
  activeUsers,
  inactiveUsers,
  onQuickAdd,
  onInvite,
}: UsersToolbarProps) {
  return (
    <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
      
      {/* LEFT SIDE: Category Toggle + Metrics (Evenly Distributed) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
        
        {/* Executive vs Staff Toggle Switcher — HIDDEN ON MOBILE (<640px) */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm h-9">
          <button
            type="button"
            onClick={() => setCategory("executive")}
            className={`flex items-center justify-center gap-1.5 px-3 h-full rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              category === "executive"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Shield size={13} />
            <span>Executive</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory("staff")}
            className={`flex items-center justify-center gap-1.5 px-3 h-full rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              category === "staff"
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Briefcase size={13} />
            <span>Staff</span>
          </button>
        </div>

        {/* Metrics Breakdown Pills - Text-only, evenly distributed */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
          <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Team</span>
            <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{totalUsers}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
            <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{activeUsers}</span>
          </div>
          <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
          <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">Inactive</span>
            <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{inactiveUsers}</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Search + Premium Filter + Add Member Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
        <div className="flex items-center gap-2 flex-1 sm:w-80">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* ✅ Reusable FilterDropdown for Department */}
          {departmentOptions.length > 0 && (
            <FilterDropdown
              filterId="user-department"
              label="Department"
              options={departmentOptions}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              icon={Filter}
            />
          )}
        </div>

        {/* Unified Add Member Dropdown Button */}
        <AddUserButton onQuickAdd={onQuickAdd} onInvite={onInvite} />
      </div>
    </div>
  );
}

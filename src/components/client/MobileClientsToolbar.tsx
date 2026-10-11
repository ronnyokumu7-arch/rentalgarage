// src/components/client/MobileClientsToolbar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search, X, User as UserIcon, Building2, Link2,
} from "lucide-react";
import FilterDropdown, { FilterOption } from "@/components/ui/FilterDropdown";
import AddClientButton from "@/components/client/AddClientButton";

export type ClientSegment = "individual" | "corporate" | "invites";

interface MobileClientsToolbarProps {
  activeSegment: ClientSegment;
  onSegmentChange: (segment: ClientSegment) => void;
  statusFilter: string | null;
  onStatusChange: (value: string | null) => void;
  statusOptions: FilterOption[];
  search: string;
  onSearchChange: (value: string) => void;
}

const SEGMENTS: { id: ClientSegment; label: string; icon: React.ElementType }[] = [
  { id: "individual", label: "Individual", icon: UserIcon },
  { id: "corporate", label: "Corporate", icon: Building2 },
  { id: "invites", label: "Invites", icon: Link2 },
];

export default function MobileClientsToolbar({
  activeSegment,
  onSegmentChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  search,
  onSearchChange,
}: MobileClientsToolbarProps) {
  const [searchMode, setSearchMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ✅ Auto-focus when search mode opens
  useEffect(() => {
    if (!searchMode) return;
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [searchMode]);

  const activeSegmentDef =
    SEGMENTS.find((s) => s.id === activeSegment) ?? SEGMENTS[0];
  const ActiveSegmentIcon = activeSegmentDef.icon;

  const segmentOptions: FilterOption[] = SEGMENTS.map((s) => ({
    label: s.label,
    value: s.id,
  }));

  const handleSearchToggle = () => {
    if (searchMode) {
      onSearchChange("");
      setSearchMode(false);
    } else {
      setSearchMode(true);
    }
  };

  return (
    <div className="flex items-center gap-2 h-10">
      {searchMode ? (
        /* ── SEARCH MODE: input full-row, × ghost close ───────────── */
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleSearchToggle}
            className="w-9 h-9 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-ink)] active:bg-[var(--color-primary)]/15 flex items-center justify-center transition-all flex-shrink-0"
            aria-label="Close search"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        /* ── DEFAULT MODE: search+label · spacer · filters · New ─── */
        <>
          {/* ✅ Ghost search trigger — icon + "Search..." label */}
          <button
            type="button"
            onClick={handleSearchToggle}
            className="h-9 px-2.5 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-ink)] active:bg-[var(--color-primary)]/15 flex items-center gap-1.5 transition-all flex-shrink-0"
            aria-label="Search clients"
          >
            <Search size={18} />
            <span className="text-sm font-medium">Search...</span>
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2 flex-shrink-0">
            <FilterDropdown
              filterId="client-segment"
              label="Segment"
              options={segmentOptions}
              value={activeSegment}
              onChange={(value) => {
                if (value) onSegmentChange(value as ClientSegment);
              }}
              icon={ActiveSegmentIcon}
              allowClear={false}
              variant="ghost"
            />

            <FilterDropdown
              filterId="client-status"
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={onStatusChange}
              variant="ghost"
            />

            <AddClientButton />
          </div>
        </>
      )}
    </div>
  );
}

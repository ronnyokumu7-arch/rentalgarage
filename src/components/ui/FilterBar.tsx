// src/components/ui/FilterBar.tsx
"use client";

import { Funnel as FilterIcon } from "@phosphor-icons/react/ssr";
import FilterDropdown, { FilterOption } from "./FilterDropdown";

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  icon?: React.ElementType; // Optional custom icon per filter
}

interface FilterBarProps {
  filters: FilterConfig[];
  onClearAll?: () => void;
}

export default function FilterBar({ filters, onClearAll }: FilterBarProps) {
  const activeCount = filters.filter((f) => f.value !== null).length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
        <FilterIcon size={16} weight="light" aria-hidden="true" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {filters.map((filter) => (
        <FilterDropdown
          key={filter.id}
          filterId={filter.id}
          label={filter.label}
          options={filter.options}
          value={filter.value}
          onChange={filter.onChange}
          icon={filter.icon}
        />
      ))}

      {activeCount > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] transition-colors"
        >
          Clear all ({activeCount})
        </button>
      )}
    </div>
  );
}

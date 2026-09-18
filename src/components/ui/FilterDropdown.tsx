// src/components/ui/FilterDropdown.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Filter, Check } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterDropdownProps {
  filterId: string;
  label: string;
  options: FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  icon?: React.ElementType; // Optional custom icon
}

export default function FilterDropdown({
  filterId,
  label,
  options,
  value,
  onChange,
  icon: CustomIcon,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = CustomIcon || Filter;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find((opt) => opt.value === value);
  const isActive = !!activeOption;

  return (
    <div className="relative flex-shrink-0" ref={ref} data-filter-dropdown={filterId}>
      {/* Icon-only trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
          isActive
            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
            : "bg-[var(--color-surface)] border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        }`}
        title={isActive ? `${label}: ${activeOption?.label}` : `Filter by ${label.toLowerCase()}`}
        aria-label={`Filter by ${label.toLowerCase()}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Icon size={15} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Menu panel */}
          <div className="absolute right-0 top-[calc(100%+8px)] w-48 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="py-1">
              {/* "All" option */}
              <button
                type="button"
                onClick={() => { onChange(null); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${
                  value === null
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <span>All {label}s</span>
                {value === null && <Check size={14} />}
              </button>
              
              <div className="h-px bg-[var(--color-surface-border)]" />
              
              {/* Filter options */}
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => { onChange(option.value); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors ${
                    value === option.value
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <span>{option.label}{option.count !== undefined ? ` (${option.count})` : ""}</span>
                  {value === option.value && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

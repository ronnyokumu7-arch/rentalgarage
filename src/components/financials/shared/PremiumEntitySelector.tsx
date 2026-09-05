// src/components/financials/shared/PremiumEntitySelector.tsx
"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { useEntitySelector } from "@/hooks/financials/useEntitySelector";

interface PremiumEntitySelectorProps<T> {
  fetcher: () => Promise<T[]>;
  // ✅ FIXED: Changed from (keyof T)[] to string[] to allow nested keys
  searchKeys: string[];
  placeholder: string;
  emptyMessage: string;
  renderEntityCard: (entity: T) => React.ReactNode;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  // ✅ NEW: Pass the full entity object to the parent
  onSelectEntity?: (entity: T | null) => void;
  label: string;
  required?: boolean;
}

export default function PremiumEntitySelector<T>({
  fetcher,
  searchKeys,
  placeholder,
  emptyMessage,
  renderEntityCard,
  selectedId,
  onSelect,
  onSelectEntity, // ✅ NEW
  label,
  required = false,
}: PremiumEntitySelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading, search, setSearch, filteredData } = useEntitySelector<T>({
    fetcher,
    searchKeys,
  });

  const selectedEntity = data.find((item) => {
    const itemId = (item as any).id ?? (item as any).booking_id;
    return itemId === selectedId;
  });

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
  const labelClass =
    "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

  return (
    <div className="relative">
      <label className={labelClass}>
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${inputClass} flex items-center justify-between text-left cursor-pointer`}
      >
        {selectedEntity ? (
          renderEntityCard(selectedEntity)
        ) : (
          <span className="text-[var(--color-ink-muted)]">{placeholder}</span>
        )}
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-[var(--color-ink-subtle)] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Panel - ✅ FIXED FOR MOBILE */}
      {isOpen && (
        <div 
          className={`
            mt-2 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-dropdown)] overflow-hidden animate-in fade-in zoom-in-95 duration-200
            
            /* MOBILE: In-flow, takes up real estate, fully scrollable */
            relative block w-full max-h-[45vh] flex flex-col
            
            /* DESKTOP: Floating dropdown, absolute positioned */
            sm:absolute sm:left-0 sm:right-0 sm:z-20 sm:max-h-[280px] sm:shadow-[var(--shadow-xl)]
          `}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-[var(--color-surface-border)] flex-shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink)] text-sm placeholder-[var(--color-ink-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                autoFocus
              />
            </div>
          </div>

          {/* List - ✅ Mobile scrolls within the modal, desktop scrolls within the floating box */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-[var(--color-ink-muted)]">
                <Loader2 size={20} className="animate-spin mr-2" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <AlertCircle size={20} className="text-[var(--color-ink-subtle)] mb-2" />
                <p className="text-sm text-[var(--color-ink-muted)]">{emptyMessage}</p>
              </div>
            ) : (
              filteredData.map((entity) => {
                const entityId = (entity as any).id ?? (entity as any).booking_id;
                const isSelected = entityId === selectedId;
                return (
                  <button
                    key={entityId}
                    type="button"
                    onClick={() => {
                      onSelect(entityId);
                      // ✅ NEW: Pass the full entity object to the parent
                      if (onSelectEntity) {
                        onSelectEntity(entity);
                      }
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20"
                        : "hover:bg-[var(--color-surface-hover)] border border-transparent"
                    }`}
                  >
                    {renderEntityCard(entity)}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

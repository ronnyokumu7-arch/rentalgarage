// src/components/tenants/TenantsToolbar.tsx
import { Search, Filter, Archive, X, Download, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FilterDropdown, { FilterOption } from "@/components/ui/FilterDropdown";

interface TenantsToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string | null) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  onExport?: (format: "csv" | "excel") => void;
}

const STATUS_OPTIONS: FilterOption[] = [
  { label: "All Accounts", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Needs Attention", value: "ATTENTION" },
  { label: "Vaulted", value: "VAULTED" },
];

export function TenantsToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  showArchived,
  setShowArchived,
  onExport,
}: TenantsToolbarProps) {
  const router = useRouter();
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col gap-3">
      
      {/* Row 1: View Toggle - Full width */}
      <div className="flex items-center gap-3 px-3.5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto w-full">
        <button
          onClick={() => setShowArchived(false)}
          className={`flex items-center gap-2 whitespace-nowrap px-3 py-1 transition-all ${
            !showArchived
              ? "bg-[var(--color-primary)] text-white"
              : "hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
          }`}
        >
          <span className="text-xs font-medium">Active</span>
        </button>
        <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
        <button
          onClick={() => setShowArchived(true)}
          className={`flex items-center gap-2 whitespace-nowrap px-3 py-1 transition-all ${
            showArchived
              ? "bg-[var(--color-primary)] text-white"
              : "hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
          }`}
        >
          <Archive size={14} />
          <span className="text-xs font-medium">Vault</span>
        </button>
      </div>

      {/* Row 2: Search + Filters on same line */}
      <div className="flex flex-row items-center gap-2 w-full">
        {/* Search Input - Takes remaining space */}
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or KRA PIN..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-all"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters - Same line, compact */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <FilterDropdown
            filterId="tenant-status"
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "ALL")}
            icon={Filter}
          />
        </div>
      </div>

      {/* Row 3: Onboard New - Full width */}
      <div className="flex flex-row items-center gap-2 w-full">
        <button 
          onClick={() => router.push("/super-admin/agencies/new")} 
          className="flex-1 w-full h-9 px-4 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-all shadow-sm cursor-pointer touch-manipulation active:scale-[0.98] flex items-center justify-center gap-1.5"
        >
          <Plus size={14} /> Onboard New
        </button>

        {/* Export - Compact on mobile */}
        {onExport && (
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-9 px-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm flex-shrink-0 cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown size={12} className="hidden sm:inline" />
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

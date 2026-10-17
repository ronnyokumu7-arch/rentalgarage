// src/components/search/MobileSearchModal.tsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Users,
  CalendarDays,
  Car,
  ArrowUpRight,
} from "lucide-react";
import { useGlobalSearch, type SearchScope } from "@/hooks/useGlobalSearch";

/* ──────────────────────────────────────────────────────────────────────
   Config
────────────────────────────────────────────────────────────────────── */

interface SearchScopeDef {
  id: string;
  label: string;
  placeholder: string;
  icon?: React.ElementType;
  isBrand?: boolean;
}

const SEARCH_SCOPES: SearchScopeDef[] = [
  { id: "all", label: "All", placeholder: "Search anything...", isBrand: true },
  { id: "clients", label: "Clients", placeholder: "Search clients...", icon: Users },
  { id: "bookings", label: "Bookings", placeholder: "Search bookings...", icon: CalendarDays },
  { id: "fleet", label: "Fleet", placeholder: "Search fleet...", icon: Car },
];

const PER_CATEGORY_PREVIEW = 5;
const DEBOUNCE_MS = 300;

/* ──────────────────────────────────────────────────────────────────────
   Status pill colors
────────────────────────────────────────────────────────────────────── */

const CLIENT_STATUS: Record<string, string> = {
  active: "text-emerald-500",
  pending: "text-amber-500",
  suspended: "text-rose-500",
  inactive: "text-gray-500",
};

const BOOKING_STATUS: Record<string, string> = {
  pending: "text-amber-500",
  confirmed: "text-blue-500",
  active: "text-emerald-500",
  completed: "text-gray-500",
  cancelled: "text-rose-500",
};

const VEHICLE_STATUS: Record<string, string> = {
  available: "text-emerald-500",
  rented: "text-blue-500",
  maintenance: "text-amber-500",
  pending_activation: "text-amber-500",
  retired: "text-gray-500",
};

/* ──────────────────────────────────────────────────────────────────────
   Formatters
────────────────────────────────────────────────────────────────────── */

const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ──────────────────────────────────────────────────────────────────────
   Props
────────────────────────────────────────────────────────────────────── */

interface MobileSearchModalProps {
  open: boolean;
  onClose: () => void;
}

/* ──────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────── */

export default function MobileSearchModal({ open, onClose }: MobileSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeScope, setActiveScope] = useState<SearchScopeDef>(SEARCH_SCOPES[0]);
  const [showScopeMenu, setShowScopeMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);

  const { loading, results } = useGlobalSearch(debouncedQuery);

  // Debounce query
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(searchQuery), DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  // Focus input on open
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setDebouncedQuery("");
      setShowScopeMenu(false);
      setActiveScope(SEARCH_SCOPES[0]);
    }
  }, [open]);

  // Close scope menu on outside click
  useEffect(() => {
    if (!showScopeMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (scopeRef.current && !scopeRef.current.contains(e.target as Node)) {
        setShowScopeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showScopeMenu]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Submit → results page
  const handleSubmit = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    const scope = activeScope.id === "all" ? "" : `&scope=${activeScope.id}`;
    router.push(`/dashboard/search?q=${encodeURIComponent(q)}${scope}`);
    onClose();
  }, [searchQuery, activeScope.id, router, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Scope mark renderer
  const renderScopeMark = (scope: SearchScopeDef, size: number = 12) => {
    if (scope.isBrand) {
      return (
        <span
          className="text-primary font-black flex items-center justify-center flex-shrink-0"
          style={{
            fontSize: `${size + 1}px`,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          RG
        </span>
      );
    }
    if (scope.icon) {
      const Icon = scope.icon;
      return <Icon size={size} strokeWidth={2.25} className="flex-shrink-0 text-primary" />;
    }
    return <Sparkles size={size} strokeWidth={2.25} className="flex-shrink-0 text-primary" />;
  };

  // Preview slices
  const preview = useMemo(() => ({
    pages: results.pages.slice(0, PER_CATEGORY_PREVIEW),
    bookings: results.bookings.slice(0, PER_CATEGORY_PREVIEW),
    clients: results.clients.slice(0, PER_CATEGORY_PREVIEW),
    vehicles: results.vehicles.slice(0, PER_CATEGORY_PREVIEW),
  }), [results]);

  const hasQuery = debouncedQuery.trim().length > 0;
  const hasAnyResults =
    results.pages.length +
    results.bookings.length +
    results.clients.length +
    results.vehicles.length > 0;

  if (!open) return null;

  const goToCategory = (scope: SearchScope) => {
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/dashboard/search?q=${encodeURIComponent(q)}&scope=${scope}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-bg flex flex-col sm:hidden animate-in fade-in duration-200">
      {/* ── Header: input + cancel ──────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex-1 flex items-center gap-1.5 h-11 pl-1.5 pr-3 rounded-full bg-surface-hover transition-colors">

          {/* Scope picker */}
          <div ref={scopeRef} className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowScopeMenu(!showScopeMenu)}
              className={`flex items-center gap-1 h-8 pl-2 pr-1.5 rounded-full transition-colors ${
                showScopeMenu ? "bg-primary/15" : "bg-primary/8 hover:bg-primary/12"
              }`}
              aria-label={`Search scope: ${activeScope.label}`}
              aria-haspopup="true"
              aria-expanded={showScopeMenu}
            >
              {renderScopeMark(activeScope, 12)}
              <ChevronDown size={12} strokeWidth={2.5} className="text-ink-muted flex-shrink-0" />
            </button>

            {showScopeMenu && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-surface border border-surface-border rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-surface-border">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Search in</p>
                </div>
                <div className="py-1">
                  {SEARCH_SCOPES.map((scope) => {
                    const isActive = activeScope.id === scope.id;
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => {
                          setActiveScope(scope);
                          setShowScopeMenu(false);
                          inputRef.current?.focus();
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-ink hover:bg-surface-hover"
                        }`}
                      >
                        <span className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                          {renderScopeMark(scope, 12)}
                        </span>
                        <span className="flex-1 text-left">{scope.label}</span>
                        {isActive && <ChevronRight size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-surface-border flex-shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeScope.placeholder}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-subtle outline-none min-w-0"
          />

          {loading && hasQuery && (
            <Loader2 size={14} className="animate-spin text-primary flex-shrink-0" />
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors flex-shrink-0 active:scale-95"
          aria-label="Cancel search"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      {/* ── Results — flat list, dividers only ──────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        {!hasQuery && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mb-3">
              <SearchIcon size={22} className="text-ink-subtle" />
            </div>
            <p className="text-sm font-bold text-ink mb-1">Search anything</p>
            <p className="text-xs text-ink-muted max-w-xs">
              Pages, clients, bookings, and fleet — all in one place.
            </p>
          </div>
        )}

        {hasQuery && !hasAnyResults && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mb-3">
              <SearchIcon size={22} className="text-ink-subtle" />
            </div>
            <p className="text-sm font-bold text-ink mb-1">
              No matches for "{debouncedQuery}"
            </p>
            <p className="text-xs text-ink-muted max-w-xs">
              Try a different keyword or check the spelling.
            </p>
          </div>
        )}

        {hasQuery && hasAnyResults && (
          <div>
            {preview.pages.length > 0 && (
              <ResultSection label="Pages" count={results.pages.length}>
                {preview.pages.map((p) => (
                  <FlatRow
                    key={`page-${p.href}`}
                    icon={p.icon}
                    iconColor="text-ink-muted"
                    primary={p.label}
                    secondary={p.description}
                    onClick={() => {
                      router.push(p.href);
                      onClose();
                    }}
                  />
                ))}
              </ResultSection>
            )}

            {preview.bookings.length > 0 && (
              <ResultSection
                label="Bookings"
                count={results.bookings.length}
                onSeeAll={
                  results.bookings.length > PER_CATEGORY_PREVIEW
                    ? () => goToCategory("bookings")
                    : undefined
                }
              >
                {preview.bookings.map((b) => (
                  <FlatRow
                    key={`booking-${b.id}`}
                    icon={CalendarDays}
                    iconColor="text-blue-500"
                    primary={b.booking_number ?? `BK-${b.id}`}
                    secondary={[
                      b.client_name,
                      b.vehicle_plate,
                      b.vehicle_name,
                      `${formatDateShort(b.start_date)} → ${formatDateShort(b.end_date)}`,
                    ].filter(Boolean).join(" · ")}
                    status={b.status}
                    statusColor={BOOKING_STATUS[b.status] ?? "text-gray-500"}
                    onClick={() => {
                      router.push(`/dashboard/bookings/${b.id}`);
                      onClose();
                    }}
                  />
                ))}
              </ResultSection>
            )}

            {preview.clients.length > 0 && (
              <ResultSection
                label="Clients"
                count={results.clients.length}
                onSeeAll={
                  results.clients.length > PER_CATEGORY_PREVIEW
                    ? () => goToCategory("clients")
                    : undefined
                }
              >
                {preview.clients.map((c) => (
                  <FlatRow
                    key={`client-${c.id}`}
                    icon={Users}
                    iconColor="text-primary"
                    primary={c.full_name}
                    secondary={[c.phone, c.email, c.id_number ? `ID ${c.id_number}` : null]
                      .filter(Boolean).join(" · ")}
                    status={c.status}
                    statusColor={CLIENT_STATUS[c.status] ?? "text-gray-500"}
                    onClick={() => {
                      router.push(`/dashboard/clients/${c.id}`);
                      onClose();
                    }}
                  />
                ))}
              </ResultSection>
            )}

            {preview.vehicles.length > 0 && (
              <ResultSection
                label="Fleet"
                count={results.vehicles.length}
                onSeeAll={
                  results.vehicles.length > PER_CATEGORY_PREVIEW
                    ? () => goToCategory("fleet")
                    : undefined
                }
              >
                {preview.vehicles.map((v) => (
                  <FlatRow
                    key={`vehicle-${v.id}`}
                    icon={Car}
                    iconColor="text-purple-500"
                    primary={`${v.make} ${v.model}`}
                    secondary={`${v.plate_number} · ${v.current_mileage.toLocaleString()} km`}
                    status={v.status}
                    statusColor={VEHICLE_STATUS[v.status] ?? "text-gray-500"}
                    onClick={() => {
                      router.push(`/dashboard/fleet/${v.id}`);
                      onClose();
                    }}
                  />
                ))}
              </ResultSection>
            )}

            {/* Submit — footer row, flat style */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-surface-hover active:bg-surface-hover/80 transition-colors border-t border-surface-border/40"
            >
              <SearchIcon size={16} className="text-ink-muted flex-shrink-0" />
              <span className="flex-1 text-sm font-semibold text-ink truncate">
                See all results for "{debouncedQuery}"
              </span>
              <ArrowUpRight size={16} className="text-ink-subtle flex-shrink-0" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Result section — flat header + rows with hairline dividers
────────────────────────────────────────────────────────────────────── */

function ResultSection({
  label,
  count,
  onSeeAll,
  children,
}: {
  label: string;
  count: number;
  onSeeAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          {label} · {count}
        </span>
        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-[10px] font-bold text-primary hover:opacity-80 transition-opacity"
          >
            See all →
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Flat row — matches Firefox / native list pattern
────────────────────────────────────────────────────────────────────── */

function FlatRow({
  icon: Icon,
  iconColor,
  primary,
  secondary,
  status,
  statusColor,
  onClick,
}: {
  icon: React.ElementType;
  iconColor: string;
  primary: string;
  secondary?: string;
  status?: string;
  statusColor?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover active:bg-surface-hover/80 transition-colors border-b border-surface-border/40"
    >
      <Icon size={18} strokeWidth={1.8} className={`${iconColor} flex-shrink-0`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-ink truncate">
            {primary}
          </span>
          {status && statusColor && (
            <span className={`text-[9px] font-bold uppercase tracking-wide ${statusColor}`}>
              {status}
            </span>
          )}
        </div>
        {secondary && (
          <p className="text-xs text-ink-muted truncate mt-0.5">
            {secondary}
          </p>
        )}
      </div>
      <ChevronRight size={16} className="text-ink-subtle flex-shrink-0" />
    </button>
  );
}

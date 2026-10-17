// src/app/dashboard/search/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Search as SearchIcon,
  User,
  CalendarDays,
  Car,
  ArrowLeft,
} from "lucide-react";
import { useGlobalSearch, type SearchScope } from "@/hooks/useGlobalSearch";
import {
  ClientResultRow,
  BookingResultRow,
  VehicleResultRow,
  PageResultRow,
} from "@/components/search/SearchResultRow";

const CATEGORIES: { id: SearchScope; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: SearchIcon },
  { id: "clients", label: "Clients", icon: User },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "fleet", label: "Fleet", icon: Car },
];

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";
  const scopeParam = (searchParams.get("scope") ?? "all") as SearchScope;

  const { loading, error, results } = useGlobalSearch(query);

  const showPages = scopeParam === "all";
  const showClients = scopeParam === "all" || scopeParam === "clients";
  const showBookings = scopeParam === "all" || scopeParam === "bookings";
  const showFleet = scopeParam === "all" || scopeParam === "fleet";

  const visibleTotal =
    (showPages ? results.pages.length : 0) +
    (showClients ? results.clients.length : 0) +
    (showBookings ? results.bookings.length : 0) +
    (showFleet ? results.vehicles.length : 0);

  const handleChipClick = (scope: SearchScope) => {
    if (scope === scopeParam) return;
    const q = query.trim();
    if (!q) return;
    router.push(
      scope === "all"
        ? `/dashboard/search?q=${encodeURIComponent(q)}`
        : `/dashboard/search?q=${encodeURIComponent(q)}&scope=${scope}`
    );
  };

  if (!query.trim()) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <EmptyState
          title="Start typing to search"
          description="Search across pages, clients, bookings, and fleet from the topbar."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader query={query} />
        <div className="flex items-center justify-center min-h-[40vh] text-[var(--color-ink-muted)]">
          <Loader2 className="w-5 h-5 animate-spin mr-3 text-[var(--color-primary)]" />
          <span className="text-sm font-medium">Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader query={query} />
        <EmptyState title="Something went wrong" description={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader query={query} count={visibleTotal} />

      <FilterChips
        activeScope={scopeParam}
        counts={{
          all: results.total,
          clients: results.clients.length,
          bookings: results.bookings.length,
          fleet: results.vehicles.length,
        }}
        onChange={handleChipClick}
      />

      {visibleTotal === 0 ? (
        <EmptyState
          title={`No matches for "${query}"${scopeParam !== "all" ? ` in ${scopeParam}` : ""}`}
          description="Try a different keyword, or search by booking number, client name, phone, plate, or a page name."
        />
      ) : (
        <div className="space-y-4">
          {showPages && results.pages.length > 0 && (
            <Section title="Pages" count={results.pages.length}>
              {results.pages.map((p) => (
                <PageResultRow key={`page-${p.href}`} result={p} />
              ))}
            </Section>
          )}

          {showBookings && results.bookings.length > 0 && (
            <Section title="Bookings" count={results.bookings.length} href="/dashboard/bookings">
              {results.bookings.map((b) => (
                <BookingResultRow key={`booking-${b.id}`} result={b} />
              ))}
            </Section>
          )}

          {showClients && results.clients.length > 0 && (
            <Section title="Clients" count={results.clients.length} href="/dashboard/clients">
              {results.clients.map((c) => (
                <ClientResultRow key={`client-${c.id}`} result={c} />
              ))}
            </Section>
          )}

          {showFleet && results.vehicles.length > 0 && (
            <Section title="Fleet" count={results.vehicles.length} href="/dashboard/fleet">
              {results.vehicles.map((v) => (
                <VehicleResultRow key={`vehicle-${v.id}`} result={v} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Empty state
────────────────────────────────────────────────────────────────────── */

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
        <SearchIcon size={20} className="text-[var(--color-ink-subtle)]" />
      </div>
      <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--color-ink-muted)] max-w-md">{description}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Filter chips
────────────────────────────────────────────────────────────────────── */

function FilterChips({
  activeScope,
  counts,
  onChange,
}: {
  activeScope: SearchScope;
  counts: Record<SearchScope, number>;
  onChange: (scope: SearchScope) => void;
}) {
  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = cat.id === activeScope;
        const count = counts[cat.id] ?? 0;
        if (cat.id !== "all" && count === 0) return null;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              isActive
                ? "bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/20"
                : "bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] border border-[var(--color-surface-border)]"
            }`}
            aria-pressed={isActive}
          >
            <Icon size={12} strokeWidth={2.5} />
            <span>{cat.label}</span>
            <span
              className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded-full ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Page header
────────────────────────────────────────────────────────────────────── */

function PageHeader({ query, count }: { query?: string; count?: number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex">
            <SearchIcon size={24} strokeWidth={1.5} className="text-[var(--color-primary)]" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight truncate">
            {query ? `Results for "${query}"` : "Search"}
          </h1>
        </div>
        {query && count !== undefined && (
          <p className="text-xs text-[var(--color-ink-muted)] mt-1">
            {count === 0 ? "No matches found" : `${count} match${count === 1 ? "" : "es"} found`}
          </p>
        )}
      </div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors self-start sm:self-auto"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Section — flat container, subtle header, hairline dividers between rows.
   Matches the desktop dropdown panel aesthetics.
────────────────────────────────────────────────────────────────────── */

function Section({
  title,
  count,
  href,
  children,
}: {
  title: string;
  count: number;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
          {title}
          <span className="ml-1.5 text-[var(--color-ink-faint)] normal-case tracking-normal font-medium">
            · {count} match{count === 1 ? "" : "es"}
          </span>
        </span>
        {href && (
          <Link
            href={href}
            className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:opacity-80 transition-opacity flex-shrink-0"
          >
            View all →
          </Link>
        )}
      </div>
      <div className="divide-y divide-[var(--color-surface-border)]/40">
        {children}
      </div>
    </div>
  );
}

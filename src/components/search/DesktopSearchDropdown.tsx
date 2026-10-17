// src/components/search/DesktopSearchDropdown.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  Loader2,
  Users,
  CalendarDays,
  Car,
  ChevronRight,
} from "lucide-react";
import { useGlobalSearch, type SearchScope } from "@/hooks/useGlobalSearch";
import type {
  PageResult,
  ClientResult,
  BookingResult,
  VehicleResult,
} from "@/hooks/useGlobalSearch";

/* ──────────────────────────────────────────────────────────────────────
   Status colors
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

const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDateRange = (start: string, end: string): string => {
  const s = formatDateShort(start);
  const e = formatDateShort(end);
  if (!s && !e) return "";
  if (!s) return `→ ${e}`;
  if (!e) return `${s} →`;
  return `${s} → ${e}`;
};

const PER_CATEGORY_PREVIEW = 5;

/* ──────────────────────────────────────────────────────────────────────
   Props
────────────────────────────────────────────────────────────────────── */

interface DesktopSearchDropdownProps {
  query: string;
  scope: SearchScope;
  onSubmit: () => void;
  onResultClick: () => void;
}

/* ──────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────── */

export default function DesktopSearchDropdown({
  query,
  scope,
  onSubmit,
  onResultClick,
}: DesktopSearchDropdownProps) {
  const router = useRouter();
  const { loading, results } = useGlobalSearch(query);

  const hasQuery = query.trim().length > 0;
  if (!hasQuery) return null;

  const showPages = scope === "all";
  const showClients = scope === "all" || scope === "clients";
  const showBookings = scope === "all" || scope === "bookings";
  const showFleet = scope === "all" || scope === "fleet";

  const previewPages = showPages ? results.pages.slice(0, PER_CATEGORY_PREVIEW) : [];
  const previewClients = showClients ? results.clients.slice(0, PER_CATEGORY_PREVIEW) : [];
  const previewBookings = showBookings ? results.bookings.slice(0, PER_CATEGORY_PREVIEW) : [];
  const previewVehicles = showFleet ? results.vehicles.slice(0, PER_CATEGORY_PREVIEW) : [];

  const hasAnyResults =
    previewPages.length +
      previewClients.length +
      previewBookings.length +
      previewVehicles.length >
    0;

  const go = (href: string) => {
    router.push(href);
    onResultClick();
  };

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-surface border border-surface-border rounded-2xl shadow-[var(--shadow-lg)] z-[9998] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* ── Primary action row — "Search everywhere" ────────────── */}
      <button
        type="button"
        onClick={onSubmit}
        aria-label={`Search everywhere for "${query}"`}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-primary-subtle)] hover:bg-[var(--color-primary-muted)] active:bg-[var(--color-primary-muted)] transition-colors border-b border-surface-border"
      >
        <SearchIcon size={16} className="text-primary flex-shrink-0" strokeWidth={2.25} />
        <span className="text-sm font-semibold text-ink truncate">{query}</span>
        <span className="text-xs text-ink-muted flex-shrink-0">
          · Search everywhere
        </span>
        {loading ? (
          <Loader2 size={14} className="animate-spin text-primary flex-shrink-0 ml-auto" />
        ) : (
          <span className="ml-auto text-[10px] font-bold text-ink-subtle flex-shrink-0">
            ↵
          </span>
        )}
      </button>

      {/* ── Results ──────────────────────────────────────────────── */}
      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        {!hasAnyResults && !loading && (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-bold text-ink mb-1">
              No matches for &ldquo;{query}&rdquo;
            </p>
            <p className="text-xs text-ink-muted">
              Try a different keyword or press Enter to search everywhere.
            </p>
          </div>
        )}

        {previewPages.length > 0 && (
          <Section label="Pages">
            {previewPages.map((p) => (
              <PageRow
                key={`page-${p.href}`}
                result={p}
                onClick={() => go(p.href)}
              />
            ))}
          </Section>
        )}

        {previewBookings.length > 0 && (
          <Section label="Bookings">
            {previewBookings.map((b) => (
              <BookingRow
                key={`booking-${b.id}`}
                result={b}
                onClick={() => go(`/dashboard/bookings/${b.id}`)}
              />
            ))}
          </Section>
        )}

        {previewClients.length > 0 && (
          <Section label="Clients">
            {previewClients.map((c) => (
              <ClientRow
                key={`client-${c.id}`}
                result={c}
                onClick={() => go(`/dashboard/clients/${c.id}`)}
              />
            ))}
          </Section>
        )}

        {previewVehicles.length > 0 && (
          <Section label="Fleet">
            {previewVehicles.map((v) => (
              <VehicleRow
                key={`vehicle-${v.id}`}
                result={v}
                onClick={() => go(`/dashboard/fleet/${v.id}`)}
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Section
────────────────────────────────────────────────────────────────────── */

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-surface-border/40 last:border-b-0">
      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
          {label}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Shared row shell — uses arbitrary values for hover so it works
   out-of-the-box without needing @theme registration.
────────────────────────────────────────────────────────────────────── */

const ROW_CLASS =
  "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors " +
  "hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-active)] " +
  "border-b border-surface-border/30 last:border-b-0";

/* ──────────────────────────────────────────────────────────────────────
   Rows
────────────────────────────────────────────────────────────────────── */

function PageRow({ result, onClick }: { result: PageResult; onClick: () => void }) {
  const Icon = result.icon;
  return (
    <button type="button" onClick={onClick} className={ROW_CLASS}>
      <Icon size={16} strokeWidth={1.8} className="text-ink-muted flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink truncate">{result.label}</p>
        {result.description && (
          <p className="text-xs text-ink-muted truncate mt-0.5">
            {result.description}
          </p>
        )}
      </div>
      <ChevronRight size={14} className="text-ink-subtle flex-shrink-0" />
    </button>
  );
}

function BookingRow({ result, onClick }: { result: BookingResult; onClick: () => void }) {
  const statusColor = BOOKING_STATUS[result.status] ?? "text-gray-500";
  const meta = [
    result.client_name,
    result.vehicle_plate,
    result.vehicle_name,
    formatDateRange(result.start_date, result.end_date),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button type="button" onClick={onClick} className={ROW_CLASS}>
      <CalendarDays size={16} strokeWidth={1.8} className="text-blue-500 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-ink truncate">
            {result.booking_number ?? `BK-${result.id}`}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wide ${statusColor} flex-shrink-0`}
          >
            {result.status}
          </span>
        </div>
        {meta && <p className="text-xs text-ink-muted truncate mt-0.5">{meta}</p>}
      </div>
      <ChevronRight size={14} className="text-ink-subtle flex-shrink-0" />
    </button>
  );
}

function ClientRow({ result, onClick }: { result: ClientResult; onClick: () => void }) {
  const statusColor = CLIENT_STATUS[result.status] ?? "text-gray-500";
  const meta = [result.phone, result.email, result.id_number ? `ID ${result.id_number}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <button type="button" onClick={onClick} className={ROW_CLASS}>
      <Users size={16} strokeWidth={1.8} className="text-primary flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-ink truncate">
            {result.full_name}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wide ${statusColor} flex-shrink-0`}
          >
            {result.status}
          </span>
        </div>
        {meta && <p className="text-xs text-ink-muted truncate mt-0.5">{meta}</p>}
      </div>
      <ChevronRight size={14} className="text-ink-subtle flex-shrink-0" />
    </button>
  );
}

function VehicleRow({ result, onClick }: { result: VehicleResult; onClick: () => void }) {
  const statusColor = VEHICLE_STATUS[result.status] ?? "text-gray-500";
  return (
    <button type="button" onClick={onClick} className={ROW_CLASS}>
      <Car size={16} strokeWidth={1.8} className="text-purple-500 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-ink truncate">
            {result.make} {result.model}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wide ${statusColor} flex-shrink-0`}
          >
            {result.status}
          </span>
        </div>
        <p className="text-xs text-ink-muted truncate mt-0.5">
          {result.plate_number} · {result.current_mileage.toLocaleString()} km
        </p>
      </div>
      <ChevronRight size={14} className="text-ink-subtle flex-shrink-0" />
    </button>
  );
}

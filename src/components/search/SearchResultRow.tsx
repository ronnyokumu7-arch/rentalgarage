// src/components/search/SearchResultRow.tsx
"use client";

import Link from "next/link";
import {
  User as UserIcon,
  CalendarDays,
  Car,
  Phone,
  Mail,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import type {
  ClientResult,
  BookingResult,
  VehicleResult,
  PageResult,
} from "@/hooks/useGlobalSearch";

/* ──────────────────────────────────────────────────────────────────────
   Status pill colors
────────────────────────────────────────────────────────────────────── */

const CLIENT_STATUS: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  suspended: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  inactive: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
};

const BOOKING_STATUS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  confirmed: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  active: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  completed: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
  cancelled: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
};

const VEHICLE_STATUS: Record<string, { bg: string; text: string }> = {
  available: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  rented: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  maintenance: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  pending_activation: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  retired: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
};

const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/* ──────────────────────────────────────────────────────────────────────
   Shared flat-row shell — matches the dropdown rows exactly.
   No card chrome; relies on parent Section for border-radius.
────────────────────────────────────────────────────────────────────── */

const ROW_CLASS =
  "group flex items-center gap-3 px-4 py-3 transition-colors " +
  "hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-active)] " +
  "focus-visible:outline-none focus-visible:bg-[var(--color-surface-hover)]";

const ICON_TILE_CLASS =
  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-colors";

const CHEVRON_CLASS =
  "text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] group-hover:translate-x-0.5 transition-all flex-shrink-0";

/* ──────────────────────────────────────────────────────────────────────
   Page row
────────────────────────────────────────────────────────────────────── */

export function PageResultRow({ result }: { result: PageResult }) {
  const Icon = result.icon;
  return (
    <Link href={result.href} className={ROW_CLASS}>
      <div
        className={`${ICON_TILE_CLASS} bg-[var(--color-primary-subtle)] border-[var(--color-primary-muted)]`}
      >
        <Icon size={14} className="text-[var(--color-primary)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--color-ink)] truncate">
          {result.label}
        </p>
        {result.description && (
          <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">
            {result.description}
          </p>
        )}
      </div>
      <ArrowRight size={14} className={CHEVRON_CLASS} />
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Client row
────────────────────────────────────────────────────────────────────── */

export function ClientResultRow({ result }: { result: ClientResult }) {
  const style = CLIENT_STATUS[result.status] ?? CLIENT_STATUS.inactive;
  return (
    <Link href={`/dashboard/clients/${result.id}`} className={ROW_CLASS}>
      <div
        className={`${ICON_TILE_CLASS} bg-[var(--color-primary-subtle)] border-[var(--color-primary-muted)]`}
      >
        <UserIcon size={14} className="text-[var(--color-primary)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-[var(--color-ink)] truncate">
            {result.full_name}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}
          >
            {result.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-[var(--color-ink-muted)]">
          {result.phone && (
            <span className="flex items-center gap-1">
              <Phone size={10} />
              <span className="truncate">{result.phone}</span>
            </span>
          )}
          {result.email && (
            <span className="flex items-center gap-1">
              <Mail size={10} />
              <span className="truncate">{result.email}</span>
            </span>
          )}
          {result.id_number && (
            <span className="font-mono">ID {result.id_number}</span>
          )}
        </div>
      </div>
      <ChevronRight size={14} className={CHEVRON_CLASS} />
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Booking row
────────────────────────────────────────────────────────────────────── */

export function BookingResultRow({ result }: { result: BookingResult }) {
  const style = BOOKING_STATUS[result.status] ?? BOOKING_STATUS.pending;
  return (
    <Link href={`/dashboard/bookings/${result.id}`} className={ROW_CLASS}>
      <div className={`${ICON_TILE_CLASS} bg-blue-500/10 border-blue-500/20`}>
        <CalendarDays size={14} className="text-blue-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-[var(--color-ink)] truncate">
            {result.booking_number ?? `BK-${result.id}`}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}
          >
            {result.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-[var(--color-ink-muted)]">
          {result.client_name && (
            <span className="truncate font-semibold text-[var(--color-ink)]">
              {result.client_name}
            </span>
          )}
          {result.vehicle_plate && (
            <span className="font-mono truncate">{result.vehicle_plate}</span>
          )}
          {result.vehicle_name && (
            <span className="truncate">{result.vehicle_name}</span>
          )}
          <span>
            {formatDateShort(result.start_date)} → {formatDateShort(result.end_date)}
          </span>
        </div>
      </div>
      <ChevronRight size={14} className={CHEVRON_CLASS} />
    </Link>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Vehicle row
────────────────────────────────────────────────────────────────────── */

export function VehicleResultRow({ result }: { result: VehicleResult }) {
  const style = VEHICLE_STATUS[result.status] ?? VEHICLE_STATUS.retired;
  return (
    <Link href={`/dashboard/fleet/${result.id}`} className={ROW_CLASS}>
      <div className={`${ICON_TILE_CLASS} bg-purple-500/10 border-purple-500/20`}>
        <Car size={14} className="text-purple-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-[var(--color-ink)] truncate">
            {result.make} {result.model}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${style.bg} ${style.text}`}
          >
            {result.status}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-[var(--color-ink-muted)]">
          <span className="font-mono font-semibold text-[var(--color-ink)]">
            {result.plate_number}
          </span>
          <span className="tabular-nums">
            {result.current_mileage.toLocaleString()} km
          </span>
        </div>
      </div>
      <ChevronRight size={14} className={CHEVRON_CLASS} />
    </Link>
  );
}

// src/components/dashboard/DesktopSidePanels.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench, Clock, CheckCircle2, Car, Gauge, ChevronRight,
  ShieldCheck, Contact, AlertTriangle,
} from "lucide-react";
import type {
  NeedsAttentionData,
  ServiceDueAlert,
  OverdueReturnAlert,
  ExpiringDocAlert,
} from "@/hooks/dashboard/useNeedsAttention";

/* ──────────────────────────────────────────────────────────────────────
   Fleet Status — unchanged
────────────────────────────────────────────────────────────────────── */

export function DesktopFleetStatus({ vehicles }: { vehicles: any[] }) {
  const stats = [
    { label: "Available", count: vehicles.filter((v) => v.status === "available").length, color: "bg-success", bg: "bg-success/10" },
    { label: "Rented", count: vehicles.filter((v) => v.status === "rented").length, color: "bg-primary", bg: "bg-primary/10" },
    { label: "Maintenance", count: vehicles.filter((v) => v.status === "maintenance").length, color: "bg-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="bg-surface border border-surface-border shadow-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Fleet Status</p>
          <p className="text-xs text-ink-subtle mt-0.5">{vehicles.filter((v) => v.status !== "maintenance").length}/{vehicles.length} operational</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[10px] font-bold text-success-text">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className={`p-3 rounded-xl ${stat.bg} border border-surface-border`}>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${stat.color}`} />
              <span className="text-[10px] font-medium text-ink-muted">{stat.label}</span>
            </div>
            <p className="text-lg font-bold text-ink mt-1">{stat.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Alerts — tabbed structure, amber-dominant, rose badges only
────────────────────────────────────────────────────────────────────── */

type AlertTab = "overdue" | "service" | "dls" | "insurance";

interface TabDef {
  id: AlertTab;
  label: string;
  icon: React.ElementType;
}

const TAB_DEFS: TabDef[] = [
  { id: "overdue", label: "Late", icon: Clock },
  { id: "service", label: "Service", icon: Wrench },
  { id: "dls", label: "DLs", icon: Contact },
  { id: "insurance", label: "Insurance", icon: ShieldCheck },
];

export function DesktopAlerts({ alerts }: { alerts: NeedsAttentionData }) {
  const hasAny = alerts.totalCount > 0;

  // Build the list of tabs that actually have items
  const activeTabs: (TabDef & { count: number })[] = TAB_DEFS.map((def) => {
    const count =
      def.id === "overdue"
        ? alerts.overdueReturns.length
        : def.id === "service"
        ? alerts.serviceDue.length
        : def.id === "dls"
        ? alerts.expiringClientDls.length
        : alerts.expiringVehicleInsurance.length;
    return { ...def, count };
  }).filter((t) => t.count > 0);

  const [activeTab, setActiveTab] = useState<AlertTab | null>(
    activeTabs[0]?.id ?? null
  );

  // ✅ Snap active tab if it empties out or if the initial default hasn't resolved
  useEffect(() => {
    if (!hasAny) return;
    if (!activeTab || !activeTabs.some((t) => t.id === activeTab)) {
      setActiveTab(activeTabs[0]?.id ?? null);
    }
  }, [hasAny, activeTab, activeTabs]);

  return (
    <div className="bg-surface border border-surface-border shadow-card rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">
          Needs Attention
        </p>
        {hasAny && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/25 tabular-nums">
            {alerts.totalCount} {alerts.totalCount === 1 ? "Alert" : "Alerts"}
          </span>
        )}
      </div>

      {!hasAny ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
            <CheckCircle2 size={24} className="text-success" />
          </div>
          <p className="text-sm font-medium text-ink-muted">All caught up!</p>
          <p className="text-xs text-ink-subtle">No pending alerts</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <TabRow
            tabs={activeTabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id)}
          />

          {/* Active tab content */}
          <div className="mt-3">
            {activeTab === "overdue" && alerts.overdueReturns.length > 0 && (
              <OverdueList items={alerts.overdueReturns} />
            )}
            {activeTab === "service" && alerts.serviceDue.length > 0 && (
              <ServiceList items={alerts.serviceDue} />
            )}
            {activeTab === "dls" && alerts.expiringClientDls.length > 0 && (
              <DocsList
                items={alerts.expiringClientDls}
                viewAllHref="/dashboard/clients?filter=dl-expiring"
                itemHref={(id) => `/dashboard/clients/${id}`}
              />
            )}
            {activeTab === "insurance" &&
              alerts.expiringVehicleInsurance.length > 0 && (
                <DocsList
                  items={alerts.expiringVehicleInsurance}
                  viewAllHref="/dashboard/fleet?filter=insurance-expiring"
                  itemHref={(id) => `/dashboard/fleet/${id}`}
                />
              )}
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Tab row — compact, amber active state, sliding indicator
────────────────────────────────────────────────────────────────────── */

function TabRow({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: (TabDef & { count: number })[];
  activeTab: AlertTab | null;
  onChange: (id: AlertTab) => void;
}) {
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  // Track active button's geometry for the sliding indicator
  useEffect(() => {
    if (!activeTab) {
      setIndicator(null);
      return;
    }
    const el = document.querySelector(
      `[data-alert-tab="${activeTab}"]`
    ) as HTMLElement | null;
    if (!el || !el.parentElement) return;
    const rect = el.getBoundingClientRect();
    const containerRect = el.parentElement.getBoundingClientRect();
    setIndicator({
      left: rect.left - containerRect.left,
      width: rect.width,
    });
  }, [activeTab, tabs.length]);

  return (
    <div className="relative">
      {indicator && (
        <div
          className="absolute top-0 h-full rounded-md bg-amber-500/15 border border-amber-500/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      <div className="relative flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-hover/50 border border-surface-border/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              data-alert-tab={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md text-[10px] font-bold transition-colors whitespace-nowrap touch-manipulation ${
                isActive
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <Icon size={11} strokeWidth={2.5} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="tabular-nums opacity-70">{tab.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Lists
────────────────────────────────────────────────────────────────────── */

function OverdueList({ items }: { items: OverdueReturnAlert[] }) {
  return (
    <div className="space-y-1.5">
      {items.slice(0, 3).map((b) => {
        const hours = Math.floor(b.overdue_minutes / 60);
        const label =
          hours >= 24
            ? `${Math.floor(hours / 24)}d ${hours % 24}h`
            : hours > 0
            ? `${hours}h ${b.overdue_minutes % 60}m`
            : `${b.overdue_minutes}m`;

        return (
          <Link
            key={b.id}
            href={`/dashboard/bookings/${b.id}`}
            className="group flex items-center gap-2.5 p-2 rounded-lg bg-amber-500/5 border border-amber-500/15 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Clock size={12} className="text-amber-700 dark:text-amber-400" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink truncate">
                {b.client_name ?? "Unknown"}
              </p>
              <p className="text-[10px] font-mono text-ink-muted truncate">
                {b.vehicle_plate ?? "—"}
              </p>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-[9px] font-extrabold uppercase tracking-wider flex-shrink-0">
              Late
            </span>
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 tabular-nums flex-shrink-0">
              {label}
            </span>
            <ChevronRight
              size={12}
              className="text-amber-500/60 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
            />
          </Link>
        );
      })}
      {items.length > 3 && (
        <Link
          href="/dashboard/bookings?filter=overdue"
          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:opacity-80 transition-opacity pt-0.5"
        >
          View all {items.length}
          <ChevronRight size={11} />
        </Link>
      )}
    </div>
  );
}

function ServiceList({ items }: { items: ServiceDueAlert[] }) {
  return (
    <div className="space-y-1.5">
      {items.slice(0, 3).map((v) => {
        const isOver = v.delta_km > 0;
        return (
          <Link
            key={v.id}
            href={`/dashboard/fleet/${v.id}`}
            className="group flex items-center gap-2.5 p-2 rounded-lg bg-amber-500/5 border border-amber-500/15 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <Car size={12} className="text-amber-700 dark:text-amber-400" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink truncate font-mono">
                {v.plate_number}
              </p>
              <p className="text-[10px] text-ink-muted truncate">
                {v.make} {v.model}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Gauge size={10} className="text-amber-600 dark:text-amber-400" />
              <span
                className={`text-[10px] font-bold tabular-nums ${
                  isOver
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {v.next_service_km !== null
                  ? isOver
                    ? `-${Math.abs(v.delta_km).toLocaleString()} km`
                    : `+${Math.abs(v.delta_km).toLocaleString()} km`
                  : "Due"}
              </span>
            </div>
            <ChevronRight
              size={12}
              className="text-amber-500/60 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
            />
          </Link>
        );
      })}
      {items.length > 3 && (
        <Link
          href="/dashboard/fleet?filter=service-due"
          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:opacity-80 transition-opacity pt-0.5"
        >
          View all {items.length}
          <ChevronRight size={11} />
        </Link>
      )}
    </div>
  );
}

function DocsList({
  items,
  viewAllHref,
  itemHref,
}: {
  items: ExpiringDocAlert[];
  viewAllHref: string;
  itemHref: (id: number) => string;
}) {
  return (
    <div className="space-y-1.5">
      {items.slice(0, 3).map((item) => {
        const isExpired = item.is_expired;
        const absDays = Math.abs(item.days_until_expiry);
        const deltaLabel = isExpired
          ? `${absDays}d ago`
          : item.days_until_expiry === 0
          ? "Today"
          : `in ${absDays}d`;

        return (
          <Link
            key={item.id}
            href={itemHref(item.id)}
            className="group flex items-center gap-2.5 p-2 rounded-lg bg-amber-500/5 border border-amber-500/15 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all"
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              {isExpired ? (
                <AlertTriangle
                  size={12}
                  className="text-amber-700 dark:text-amber-400"
                  strokeWidth={2.5}
                />
              ) : (
                <Contact
                  size={12}
                  className="text-amber-700 dark:text-amber-400"
                  strokeWidth={2.5}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-ink truncate">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="text-[10px] font-mono text-ink-muted truncate">
                  {item.subtitle}
                </p>
              )}
            </div>
            {isExpired && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-[9px] font-extrabold uppercase tracking-wider flex-shrink-0">
                Expired
              </span>
            )}
            <span
              className={`text-[10px] font-bold tabular-nums flex-shrink-0 ${
                isExpired
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {deltaLabel}
            </span>
            <ChevronRight
              size={12}
              className="text-amber-500/60 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
            />
          </Link>
        );
      })}
      {items.length > 3 && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:opacity-80 transition-opacity pt-0.5"
        >
          View all {items.length}
          <ChevronRight size={11} />
        </Link>
      )}
    </div>
  );
}

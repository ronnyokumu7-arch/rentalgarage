// src/components/dashboard/mobile-carousel/MobileAlertsSlide.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Wrench, Clock, Car, ChevronRight, Gauge, AlertTriangle,
  ShieldCheck, Contact,
} from "lucide-react";
import type {
  NeedsAttentionData,
  ServiceDueAlert,
  OverdueReturnAlert,
  ExpiringDocAlert,
} from "@/hooks/dashboard/useNeedsAttention";

/* ──────────────────────────────────────────────────────────────────────
   Constants
────────────────────────────────────────────────────────────────────── */

const INNER_CAROUSEL_CAP = 8;

/* ──────────────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────────────── */

type AlertTab = "overdue" | "service" | "dls" | "insurance";

interface TabDef {
  id: AlertTab;
  label: string;
  icon: React.ElementType;
  count: number;
}

interface MobileAlertsSlideProps {
  alerts: NeedsAttentionData;
}

/* ──────────────────────────────────────────────────────────────────────
   Slide
────────────────────────────────────────────────────────────────────── */

export default function MobileAlertsSlide({ alerts }: MobileAlertsSlideProps) {
  const allTabs: TabDef[] = [
    { id: "overdue", label: "Late", icon: Clock, count: alerts.overdueReturns.length },
    { id: "service", label: "Service", icon: Wrench, count: alerts.serviceDue.length },
    { id: "dls", label: "DLs", icon: Contact, count: alerts.expiringClientDls.length },
    { id: "insurance", label: "Insurance", icon: ShieldCheck, count: alerts.expiringVehicleInsurance.length },
  ];

  const tabs = allTabs.filter((t) => t.count > 0);

  const [activeTab, setActiveTab] = useState<AlertTab>(tabs[0]?.id ?? "overdue");

  useEffect(() => {
    if (!tabs.some((t) => t.id === activeTab) && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pr-16">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Needs Attention
          </p>
          <p className="text-xs text-ink-subtle mt-0.5">
            {alerts.totalCount} {alerts.totalCount === 1 ? "item" : "items"} require action
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-[10px] font-extrabold text-amber-700 dark:text-amber-400 border border-amber-500/25 tabular-nums">
          {alerts.totalCount}
        </span>
      </div>

      {/* Standardized sliding-indicator tabs */}
      {tabs.length > 0 && (
        <AlertTabSwitcher
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      )}

      {/* Active list */}
      <div>
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
        {activeTab === "insurance" && alerts.expiringVehicleInsurance.length > 0 && (
          <DocsList
            items={alerts.expiringVehicleInsurance}
            viewAllHref="/dashboard/fleet?filter=insurance-expiring"
            itemHref={(id) => `/dashboard/fleet/${id}`}
          />
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Alert tab switcher — matching the Recent Activity pattern
   (outer rounded-lg, inner rounded-md, p-0.5 → geometrically perfect)
────────────────────────────────────────────────────────────────────── */

function AlertTabSwitcher({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: TabDef[];
  activeTab: AlertTab;
  onChange: (id: AlertTab) => void;
}) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (!activeEl) return;
      const rect = activeEl.getBoundingClientRect();
      const containerRect = activeEl.parentElement?.getBoundingClientRect();
      if (containerRect) {
        setIndicatorStyle({
          left: rect.left - containerRect.left,
          width: rect.width,
          top: rect.top - containerRect.top,
          height: rect.height,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab, tabs.length]);

  return (
    <div className="relative w-full">
      {indicatorStyle && (
        <div
          // ✅ Active indicator matches the inner button radius
          className="absolute z-0 rounded-md bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 shadow-lg shadow-amber-500/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

      {/* ✅ Outer container: rounded-lg, p-0.5, overflow-hidden */}
      <div className="relative z-10 flex items-center gap-1 p-0.5 bg-[var(--color-surface-hover)]/50 rounded-lg border border-[var(--color-surface-border)]/50 w-full overflow-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              onClick={() => onChange(tab.id)}
              // ✅ Inner button: rounded-md (6px = 8px outer - 2px padding)
              className={`relative flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md text-[10px] font-bold transition-colors whitespace-nowrap touch-manipulation cursor-pointer ${
                isActive
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              <Icon size={11} strokeWidth={2.5} />
              <span className="truncate">{tab.label}</span>
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
  const visible = items.slice(0, INNER_CAROUSEL_CAP);
  const hasMore = items.length > INNER_CAROUSEL_CAP;
  const cardWidthClass = visible.length === 1 ? "w-full" : "w-[80%]";

  return (
    <>
      <InnerCarousel>
        {visible.map((b) => {
          const hours = Math.floor(b.overdue_minutes / 60);
          const minutes = b.overdue_minutes % 60;
          const label =
            hours >= 24
              ? `${Math.floor(hours / 24)}d ${hours % 24}h`
              : hours > 0
              ? `${hours}h ${minutes}m`
              : `${minutes}m`;

          return (
            <Link
              key={b.id}
              href={`/dashboard/bookings/${b.id}`}
              className={`snap-start flex-shrink-0 ${cardWidthClass} rounded-xl border border-amber-500/25 hover:border-amber-500/50 bg-surface transition-all relative overflow-hidden p-3 space-y-2`}
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 rounded-r" />
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-ink truncate">
                  {b.client_name ?? "Unknown client"}
                </p>
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-[9px] font-extrabold uppercase tracking-wider flex-shrink-0">
                  Late
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <Car size={11} className="flex-shrink-0 text-ink-subtle" />
                <span className="font-mono font-semibold text-ink truncate">
                  {b.vehicle_plate ?? "—"}
                </span>
                {b.vehicle_name && (
                  <span className="truncate">· {b.vehicle_name}</span>
                )}
              </div>
              <div className="pt-1 border-t border-surface-border/50 flex items-center gap-1.5">
                <Clock size={11} className="text-rose-500 flex-shrink-0" />
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                  {label} overdue
                </span>
              </div>
            </Link>
          );
        })}
      </InnerCarousel>
      {hasMore && (
        <ViewAllLink count={items.length} href="/dashboard/bookings?filter=overdue" />
      )}
    </>
  );
}

function ServiceList({ items }: { items: ServiceDueAlert[] }) {
  const visible = items.slice(0, INNER_CAROUSEL_CAP);
  const hasMore = items.length > INNER_CAROUSEL_CAP;
  const cardWidthClass = visible.length === 1 ? "w-full" : "w-[80%]";

  return (
    <>
      <InnerCarousel>
        {visible.map((v) => {
          const isOver = v.delta_km > 0;
          return (
            <Link
              key={v.id}
              href={`/dashboard/fleet/${v.id}`}
              className={`snap-start flex-shrink-0 ${cardWidthClass} rounded-xl border border-amber-500/25 hover:border-amber-500/50 bg-surface transition-all relative overflow-hidden p-3 space-y-2`}
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 rounded-r" />
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-ink tracking-tight">
                  {v.plate_number}
                </span>
                {isOver ? (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-[9px] font-extrabold uppercase tracking-wider">
                    <AlertTriangle size={9} />
                    Over
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[9px] font-extrabold uppercase tracking-wider">
                    Due
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-ink leading-tight truncate">
                {v.make} {v.model}
              </p>
              <div className="pt-1 border-t border-surface-border/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Gauge size={11} className="text-ink-subtle flex-shrink-0" />
                  <span className="text-[11px] font-medium text-ink-muted tabular-nums truncate">
                    {v.current_mileage.toLocaleString()} km
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold tabular-nums flex-shrink-0 ${
                    isOver
                      ? "text-rose-700 dark:text-rose-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {v.next_service_km !== null
                    ? isOver
                      ? `-${Math.abs(v.delta_km).toLocaleString()} km`
                      : `+${Math.abs(v.delta_km).toLocaleString()} km`
                    : "Due now"}
                </span>
              </div>
            </Link>
          );
        })}
      </InnerCarousel>
      {hasMore && (
        <ViewAllLink count={items.length} href="/dashboard/fleet?filter=service-due" />
      )}
    </>
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
  const visible = items.slice(0, INNER_CAROUSEL_CAP);
  const hasMore = items.length > INNER_CAROUSEL_CAP;
  const cardWidthClass = visible.length === 1 ? "w-full" : "w-[80%]";

  return (
    <>
      <InnerCarousel>
        {visible.map((item) => {
          const isExpired = item.is_expired;
          const absDays = Math.abs(item.days_until_expiry);
          const deltaLabel = isExpired
            ? `Expired ${absDays}d ago`
            : item.days_until_expiry === 0
            ? "Expires today"
            : `Expires in ${absDays}d`;

          return (
            <Link
              key={item.id}
              href={itemHref(item.id)}
              className={`snap-start flex-shrink-0 ${cardWidthClass} rounded-xl border border-amber-500/25 hover:border-amber-500/50 bg-surface transition-all relative overflow-hidden p-3 space-y-2`}
            >
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-amber-500 rounded-r" />
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-ink truncate">
                  {item.title}
                </p>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex-shrink-0 ${
                    isExpired
                      ? "bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400"
                      : "bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {isExpired ? "Expired" : "Expiring"}
                </span>
              </div>
              {item.subtitle && (
                <p className="text-[11px] font-medium text-ink-muted truncate font-mono">
                  {item.subtitle}
                </p>
              )}
              <div className="pt-1 border-t border-surface-border/50 flex items-center gap-1.5">
                <Clock
                  size={11}
                  className={`flex-shrink-0 ${
                    isExpired ? "text-rose-500" : "text-amber-500"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold tabular-nums ${
                    isExpired
                      ? "text-rose-700 dark:text-rose-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {deltaLabel}
                </span>
              </div>
            </Link>
          );
        })}
      </InnerCarousel>
      {hasMore && <ViewAllLink count={items.length} href={viewAllHref} />}
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Shared bits
────────────────────────────────────────────────────────────────────── */

function InnerCarousel({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mr-4">
      <div
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pr-4 pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  );
}

function ViewAllLink({ count, href }: { count: number; href: string }) {
  return (
    <Link
      href={href}
      className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:opacity-80 transition-opacity"
    >
      View all {count}
      <ChevronRight size={11} />
    </Link>
  );
}

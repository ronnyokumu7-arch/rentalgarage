// src/components/dashboard/MobileCarouselCard.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench, Clock, Car, ArrowUpRight, Sparkles, X, TrendingUp, Pin,
  ChevronRight, Gauge, AlertTriangle, ShieldCheck, Contact,
} from "lucide-react";
import type {
  NeedsAttentionData,
  ServiceDueAlert,
  OverdueReturnAlert,
  ExpiringDocAlert,
} from "@/hooks/dashboard/useNeedsAttention";

/* ──────────────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────────────── */

interface CarouselVehicle {
  id: number;
  status: string;
  make: string;
  model: string;
  plate_number: string;
  current_mileage: number;
  next_service_km: number | null;
  mileage_due: boolean;
}

interface Promo {
  id: string;
  eyebrow: string;
  headline: string;
  subline: string;
  ctaLabel: string;
  ctaHref: string;
}

interface MobileCarouselCardProps {
  vehicles: CarouselVehicle[];
  alerts: NeedsAttentionData;
}

/* ──────────────────────────────────────────────────────────────────────
   Promo config
────────────────────────────────────────────────────────────────────── */

const PROMOS: Promo[] = [
  {
    id: "pro-plan",
    eyebrow: "Upgrade",
    headline: "Unlock Pro features",
    subline: "Advanced analytics, priority support, unlimited fleet.",
    ctaLabel: "Explore Pro",
    ctaHref: "/settings/billing",
  },
  {
    id: "airport-transfer",
    eyebrow: "New feature",
    headline: "Airport transfers are live",
    subline: "Book premium airport runs with dedicated pricing.",
    ctaLabel: "Try it",
    ctaHref: "/dashboard/bookings/new",
  },
];

const PROMO_DISMISS_KEY_PREFIX = "carousel_promo_dismissed_";
const ROTATION_INTERVAL_MS = 4000;
const INNER_CAROUSEL_CAP = 8;

type SlideKey = "alerts" | "fleet" | "promo";

/* ──────────────────────────────────────────────────────────────────────
   Root carousel
────────────────────────────────────────────────────────────────────── */

export default function MobileCarouselCard({
  vehicles,
  alerts,
}: MobileCarouselCardProps) {
  const hasAlerts = alerts.totalCount > 0;

  const [dismissedPromoIds, setDismissedPromoIds] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = PROMOS.filter(
      (p) => sessionStorage.getItem(PROMO_DISMISS_KEY_PREFIX + p.id) === "1"
    ).map((p) => p.id);
    setDismissedPromoIds(dismissed);
  }, []);

  const activePromos = PROMOS.filter((p) => !dismissedPromoIds.includes(p.id));

  const slides: SlideKey[] = [];
  if (hasAlerts) slides.push("alerts");
  slides.push("fleet");
  if (activePromos.length > 0) slides.push("promo");

  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [touched, setTouched] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pinned, setPinned] = useState(hasAlerts);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const alertsWerePresent = useRef(hasAlerts);
  useEffect(() => {
    if (hasAlerts && !alertsWerePresent.current) {
      setIndex(0);
      setPinned(true);
    }
    alertsWerePresent.current = hasAlerts;
  }, [hasAlerts]);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (pinned) return;
    if (hovered) return;
    if (touched) return;
    if (reducedMotion) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(t);
  }, [slides.length, pinned, hovered, touched, reducedMotion]);

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= slides.length) return;
      setIndex(i);
    },
    [slides.length]
  );

  const activeSlide = slides[index];

  const handleDismissPromo = (promoId: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(PROMO_DISMISS_KEY_PREFIX + promoId, "1");
    }
    setDismissedPromoIds((ids) => [...ids, promoId]);
    setIndex((i) => (i > 0 ? i - 1 : 0));
  };

  const togglePin = () => setPinned((p) => !p);

  if (slides.length === 1 && activeSlide === "fleet") {
    return (
      <div className="bg-surface rounded-2xl border border-surface-border shadow-card overflow-hidden">
        <FleetStatusSlide vehicles={vehicles} />
      </div>
    );
  }

  const showPromoX = activeSlide === "promo" && activePromos[0];

  return (
    <div
      className="bg-surface rounded-2xl border border-surface-border shadow-card overflow-hidden flex flex-col relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => window.setTimeout(() => setTouched(false), 3000)}
    >
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
        {showPromoX && (
          <button
            onClick={() => handleDismissPromo(activePromos[0].id)}
            aria-label="Dismiss promo"
            className="p-1.5 rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
          >
            <X size={14} />
          </button>
        )}
        <button
          onClick={togglePin}
          aria-label={pinned ? "Unpin slide" : "Pin this slide"}
          className={`p-1.5 rounded-lg transition-all ${
            pinned
              ? "text-primary bg-primary/10 hover:bg-primary/15"
              : "text-ink-muted hover:bg-surface-hover hover:text-ink"
          }`}
        >
          <Pin
            size={14}
            strokeWidth={2}
            className={pinned ? "fill-primary/30 rotate-45" : "rotate-45"}
          />
        </button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSlide}
            initial={reducedMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) goTo(index + 1);
              else if (info.offset.x > 60) goTo(index - 1);
            }}
          >
            {activeSlide === "fleet" && <FleetStatusSlide vehicles={vehicles} />}
            {activeSlide === "alerts" && <AlertsSlide alerts={alerts} />}
            {activeSlide === "promo" && activePromos[0] && (
              <PromoSlide promo={activePromos[0]} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3 pt-1">
          {slides.map((key, i) => (
            <button
              key={key}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === index
                  ? "w-5 h-1.5 bg-primary"
                  : "w-1.5 h-1.5 bg-ink-faint/40 hover:bg-ink-muted"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Slide 1 — Fleet Status
────────────────────────────────────────────────────────────────────── */

function FleetStatusSlide({ vehicles }: { vehicles: CarouselVehicle[] }) {
  const available = vehicles.filter((v) => v.status === "available").length;
  const rented = vehicles.filter((v) => v.status === "rented").length;
  const maintenance = vehicles.filter((v) => v.status === "maintenance").length;
  const total = vehicles.length;
  const operational = available + rented;
  const utilizationPct = total > 0 ? Math.round((rented / total) * 100) : 0;

  const tiles = [
    {
      label: "Available",
      count: available,
      gradient: "from-emerald-500 to-teal-600",
      tint: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: Car,
    },
    {
      label: "Rented",
      count: rented,
      gradient: "from-blue-500 to-indigo-600",
      tint: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: TrendingUp,
    },
    {
      label: "Service",
      count: maintenance,
      gradient: "from-amber-500 to-orange-600",
      tint: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: Wrench,
    },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between pr-16">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
            Fleet Status
          </p>
          <p className="text-xs text-ink-subtle mt-0.5 truncate">
            {operational}/{total} operational
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[9px] font-bold text-success-text uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[10px] font-semibold text-ink-muted mb-1">
          <span>Utilization</span>
          <span className="tabular-nums">{utilizationPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-hover overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${utilizationPct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              className={`flex items-center gap-2.5 rounded-xl ${tile.tint} border ${tile.border} p-2.5 overflow-hidden`}
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tile.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
              >
                <Icon size={14} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-ink tracking-tight font-display tabular-nums leading-none">
                  {tile.count}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted mt-0.5 truncate">
                  {tile.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Slide 2 — Needs Attention (tabbed sections)
────────────────────────────────────────────────────────────────────── */

type AlertTab = "overdue" | "service" | "dls" | "insurance";

interface TabDef {
  id: AlertTab;
  label: string;
  icon: React.ElementType;
  count: number;
}

function AlertsSlide({ alerts }: { alerts: NeedsAttentionData }) {
  // ✅ Build candidate tabs with literal-typed ids so `.filter()` doesn't widen to `string`
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
   Alert tab switcher — matches Recent Activity / Action Center pattern
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
          className="absolute z-0 rounded-md bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 shadow-lg shadow-amber-500/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

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
   Lists — amber-dominant, rose badge for urgency
────────────────────────────────────────────────────────────────────── */

function OverdueList({ items }: { items: OverdueReturnAlert[] }) {
  const visible = items.slice(0, INNER_CAROUSEL_CAP);
  const hasMore = items.length > INNER_CAROUSEL_CAP;

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
              className="snap-start flex-shrink-0 w-[80%] rounded-xl border border-amber-500/25 hover:border-amber-500/50 bg-surface transition-all relative overflow-hidden p-3 space-y-2"
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

  return (
    <>
      <InnerCarousel>
        {visible.map((v) => {
          const isOver = v.delta_km > 0;
          return (
            <Link
              key={v.id}
              href={`/dashboard/fleet/${v.id}`}
              className="snap-start flex-shrink-0 w-[80%] rounded-xl border border-amber-500/25 hover:border-amber-500/50 bg-surface transition-all relative overflow-hidden p-3 space-y-2"
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
              className="snap-start flex-shrink-0 w-[80%] rounded-xl border border-amber-500/25 hover:border-amber-500/50 bg-surface transition-all relative overflow-hidden p-3 space-y-2"
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
   Shared
────────────────────────────────────────────────────────────────────── */

function InnerCarousel({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4">
      <div
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 pb-1"
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

/* ──────────────────────────────────────────────────────────────────────
   Slide 3 — Promo
────────────────────────────────────────────────────────────────────── */

function PromoSlide({ promo }: { promo: Promo }) {
  return (
    <div className="p-4">
      <div className="space-y-2 pr-16">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            {promo.eyebrow}
          </span>
        </div>

        <p className="text-sm font-bold text-ink font-display tracking-tight leading-snug">
          {promo.headline}
        </p>
        <p className="text-xs text-ink-muted leading-relaxed">
          {promo.subline}
        </p>
      </div>

      <Link
        href={promo.ctaHref}
        className="mt-3 inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-opacity"
      >
        {promo.ctaLabel}
        <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}

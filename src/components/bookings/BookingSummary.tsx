"use client";

import { User, UserCircle, Car, CalendarDays, DollarSign, Phone, Loader2, ShieldCheck, CreditCard, Clock, MapPin, Route } from 'lucide-react';
import type { Client, Vehicle, DriverListItem, ServiceType, PricingResult } from '@/lib/types';

interface BookingSummaryProps {
  client: Client | undefined;
  vehicle: Vehicle | undefined;
  driver?: DriverListItem | undefined; // ✅ MILESTONE 2: optional driver
  startDate: string;
  endDate: string;
  totalAmount: number;
  // ✅ MILESTONE 1 & 3: Updated for new pricing engines
  serviceType?: ServiceType;
  quote?: PricingResult | null;
  quoteLoading?: boolean;
}

// ✅ UPDATED: Aligned with new backend ServiceType constants
const SERVICE_LABELS: Record<ServiceType, string> = {
  selfdrive: "Self Drive",
  airport_transfer: "Airport Transfer",
  wedding: "Wedding Car Hire",
  pro_driver: "Chauffeur",
  chauffeur_hourly: "Chauffeur · Hourly",
  corporate: "Corporate Transport",
  city_excursion: "City Excursion",
  chauffeur_taxi: "Taxi",
  route_stops_service: "Places-Visited Tour",
};

// ✅ Billing-model icons for the Period header (visual cue per service type)
const BILLING_ICONS: Record<string, typeof CalendarDays> = {
  rolling_24h: CalendarDays,
  event_base: CalendarDays,
  hourly: Clock,
  package: Clock,
  fixed_route: MapPin,
  distance_time: Route,
  route_stops: MapPin,
};

// ✅ Period labels — match what the engine actually computes
const PERIOD_LABELS: Record<string, { startLabel: string; endLabel: string }> = {
  rolling_24h: { startLabel: "Pickup", endLabel: "Return" },
  event_base: { startLabel: "Event starts", endLabel: "Event ends" },
  hourly: { startLabel: "Start", endLabel: "End" },
  package: { startLabel: "Start", endLabel: "End" },
  fixed_route: { startLabel: "Pickup", endLabel: "Drop-off" },
  distance_time: { startLabel: "Pickup", endLabel: "Drop-off" },
  route_stops: { startLabel: "Pickup", endLabel: "Drop-off" },
};

const fmtMoney = (v: number | string) => Number(v).toLocaleString();

const fmtDateTime = (v: string) => {
  const d = new Date(v);
  return d.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
};

// ✅ DL health indicator for the summary (matches DriverSearch pattern)
const dlHealth = (expiry?: string | null) => {
  if (!expiry) return null;
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "DL EXPIRED", cls: "text-[var(--color-danger)] font-bold" };
  if (days <= 30) return { label: `${days}d left`, cls: "text-[var(--color-warning-text)] font-bold" };
  return { label: "DL valid", cls: "text-[var(--color-success-text)]" };
};

const DRIVER_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  available: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  on_trip: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
};

const DRIVER_STATUS_LABELS: Record<string, string> = {
  available: "Available",
  on_trip: "On Trip",
};

// ✅ UPDATED: Resilient duration renderer for new pure pricing engines
const renderDuration = (quote: PricingResult | null, fallbackDays: number) => {
  if (!quote) {
    if (fallbackDays <= 0) return null;
    return (
      <span className="font-semibold text-[var(--color-ink)]">
        {fallbackDays} day{fallbackDays !== 1 ? "s" : ""} × 24h
      </span>
    );
  }

  // New pure engines return extra_hours, base_rate, etc.
  const { billing_model, included_days, extra_hours, day_hours } = quote as any; // Cast to any to safely access legacy fields if they exist

  if (billing_model) {
    switch (billing_model) {
      case "event_base":
        return (
          <span className="font-semibold text-[var(--color-ink)]">
            1 event × {day_hours || 12}h base
            {extra_hours > 0 && ` + ${extra_hours}h add-on`}
          </span>
        );
      case "hourly":
      case "package":
        return (
          <span className="font-semibold text-[var(--color-ink)]">
            {included_days || 1} block{(included_days || 1) !== 1 ? "s" : ""} × {day_hours || 12}h
            {extra_hours > 0 && ` + ${extra_hours}h extra`}
          </span>
        );
      case "fixed_route":
      case "distance_time":
      case "route_stops":
        return <span className="font-semibold text-[var(--color-ink)]">Flat rate</span>;
      case "rolling_24h":
      default:
        return (
          <span className="font-semibold text-[var(--color-ink)]">
            {included_days || 1} day{(included_days || 1) !== 1 ? "s" : ""} × {day_hours || 24}h
            {extra_hours > 0 && ` + ${extra_hours}h OT`}
          </span>
        );
    }
  }

  // Fallback for new pure engines (Airport, Wedding, Pro Driver)
  return (
    <span className="font-semibold text-[var(--color-ink)]">
      1 package
      {extra_hours && extra_hours > 0 ? ` + ${extra_hours}h extra` : ""}
    </span>
  );
};

// ✅ UPDATED: Resilient footer line for new pure pricing engines
const renderFooter = (quote: PricingResult | null, serviceType: ServiceType, fallbackDays: number, vehicle?: Vehicle) => {
  const label = (quote as any)?.service_label || SERVICE_LABELS[serviceType];

  if (quote) {
    const bits: string[] = [label];
    const { billing_model, included_days, day_hours, driver_subtotal } = quote as any;

    if (billing_model) {
      switch (billing_model) {
        case "event_base":
          bits.push(`1 event × ${day_hours || 12}h`);
          break;
        case "hourly":
        case "package":
          bits.push(`${included_days || 1} block${(included_days || 1) !== 1 ? "s" : ""} × ${day_hours || 12}h`);
          break;
        case "fixed_route":
        case "distance_time":
        case "route_stops":
          bits.push("flat/metered");
          break;
        case "rolling_24h":
        default:
          bits.push(`${included_days || 1} day(s) × ${day_hours || 24}h`);
          break;
      }
    } else {
      bits.push("Package rate");
    }

    if (driver_subtotal && Number(driver_subtotal) > 0) bits.push("includes driver fees");
    return <div className="text-[10px] text-[var(--color-ink-muted)] mt-1">{bits.join(" · ")}</div>;
  }

  // No quote — legacy fallback
  if (fallbackDays > 0 && vehicle) {
    return (
      <div className="text-[10px] text-[var(--color-ink-muted)] mt-1">
        {fallbackDays} days × KES {Number(vehicle.daily_rate).toLocaleString()}/day
      </div>
    );
  }
  return null;
};

export default function BookingSummary({
  client,
  vehicle,
  driver,
  startDate,
  endDate,
  totalAmount,
  serviceType = "selfdrive",
  quote = null,
  quoteLoading = false,
}: BookingSummaryProps) {
  const getDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const days = quote ? (quote as any).included_days || 1 : getDays();
  const driverStatusStyle = driver ? (DRIVER_STATUS_STYLES[driver.status] || DRIVER_STATUS_STYLES.available) : null;

  const billingModel = (quote as any)?.billing_model || "rolling_24h";
  const PeriodIcon = BILLING_ICONS[billingModel] || CalendarDays;
  const periodLabels = PERIOD_LABELS[billingModel] || PERIOD_LABELS.rolling_24h;

  const serviceBadgeLabel = (quote as any)?.service_label || SERVICE_LABELS[serviceType];

  return (
    <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)] p-4">
      
      {/* Header + Service Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
          Booking Summary
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[9px] font-bold uppercase tracking-wide">
          {serviceBadgeLabel}
        </span>
      </div>
      
      {/* Client Info */}
      <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2 mb-2">
          <User size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-ink)]">Client</span>
        </div>
        {client ? (
          <div>
            <div className="text-sm font-medium text-[var(--color-ink)] mb-1">{client.full_name}</div>
            <div className="flex items-center gap-1 text-xs text-[var(--color-ink-muted)]">
              <Phone size={10} />
              <span>{client.phone}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-ink-muted)]">No client selected</div>
        )}
      </div>

      {/* Vehicle Info */}
      <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2 mb-2">
          <Car size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-ink)]">Vehicle</span>
        </div>
        {vehicle ? (
          <div>
            <div className="text-sm font-medium text-[var(--color-ink)]">{vehicle.make} {vehicle.model}</div>
            <div className="text-xs text-[var(--color-ink-muted)] font-mono">{vehicle.plate_number}</div>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-ink-muted)]">No vehicle selected</div>
        )}
      </div>

      {/* ✅ MILESTONE 2: Driver Info — only renders when a driver is selected */}
      {driver && (
        <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UserCircle size={14} className="text-[var(--color-primary)]" />
              <span className="text-xs font-semibold text-[var(--color-ink)]">Driver</span>
            </div>
            {driverStatusStyle && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${driverStatusStyle.bg} ${driverStatusStyle.text}`}>
                {DRIVER_STATUS_LABELS[driver.status] || driver.status}
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-[var(--color-ink)] mb-1">{driver.full_name}</div>
          <div className="flex items-center gap-3 text-xs text-[var(--color-ink-muted)] flex-wrap">
            <div className="flex items-center gap-1">
              <Phone size={10} />
              <span>{driver.phone}</span>
            </div>
            {driver.id_number_masked && (
              <div className="flex items-center gap-1">
                <CreditCard size={10} />
                <span className="font-mono">{driver.id_number_masked}</span>
              </div>
            )}
            {(() => {
              const health = dlHealth(driver.dl_expiry);
              return health ? (
                <span className={`text-[10px] ${health.cls}`}>{health.label}</span>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Dates + Times — ✅ now billing-model-aware */}
      <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2 mb-2">
          <PeriodIcon size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-ink)]">
            {billingModel === "event_base" ? "Event Schedule" : 
             billingModel === "fixed_route" || billingModel === "distance_time" ? "Trip Schedule" : "Period"}
          </span>
        </div>
        {startDate && endDate ? (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">{periodLabels.startLabel}</span>
              <span className="font-medium text-[var(--color-ink)]">{fmtDateTime(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">{periodLabels.endLabel}</span>
              <span className="font-medium text-[var(--color-ink)]">{fmtDateTime(endDate)}</span>
            </div>
            <div className="pt-1 border-t border-[var(--color-surface-border)] flex justify-between items-center">
              <span className="text-[var(--color-ink-muted)]">Duration</span>
              {renderDuration(quote, days)}
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-ink-muted)]">No dates selected</div>
        )}
      </div>

      {/* ✅ MILESTONE 1 & 3: Live Pricing Breakdown (works perfectly with new pure engines) */}
      {quote && (
        <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-[var(--color-primary)]" />
            <span className="text-xs font-semibold text-[var(--color-ink)]">Pricing Breakdown</span>
            {quoteLoading && <Loader2 size={10} className="animate-spin text-[var(--color-ink-muted)]" />}
          </div>
          <div className="space-y-1.5">
            {quote.lines.map((line, i) => (
              <div key={i} className="flex justify-between gap-2 text-xs">
                <span className="text-[var(--color-ink-muted)]">
                  {line.description} <span className="opacity-70">· {line.quantity}</span>
                </span>
                <span className="font-medium text-[var(--color-ink)] whitespace-nowrap">
                  KES {fmtMoney(line.amount)}
                </span>
              </div>
            ))}
            {/* Legacy grace/overtime warnings (safe optional checks) */}
            {(quote as any).grace_used_minutes > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                <ShieldCheck size={10} />
                {(quote as any).grace_used_minutes} min grace applied (free)
              </div>
            )}
            {(quote as any).extra_hours > 0 && (quote as any).overtime_waivable && (
              <div className="text-[10px] text-[var(--color-ink-muted)]">
                Extra hours may be forgiven as a discount at invoice time.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--color-ink-muted)]">Total Amount</span>
          {quoteLoading && !quote && <Loader2 size={12} className="animate-spin text-[var(--color-ink-muted)]" />}
        </div>
        <div className="text-2xl font-bold text-[var(--color-ink)]">
          KES {totalAmount.toLocaleString()}
        </div>
        {renderFooter(quote, serviceType, days, vehicle)}
      </div>
    </div>
  );
}

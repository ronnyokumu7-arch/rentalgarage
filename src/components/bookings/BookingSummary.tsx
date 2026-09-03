"use client";

import { User, UserCircle, Car, CalendarDays, DollarSign, Phone, Loader2, CreditCard } from 'lucide-react';
import type { Client, Vehicle, DriverListItem, ServiceType, PricingResult } from '@/lib/types';

interface BookingSummaryProps {
  client: Client | undefined;
  vehicle: Vehicle | undefined;
  driver?: DriverListItem | undefined;
  startDate: string;
  endDate: string;
  totalAmount: number;
  serviceType?: ServiceType;
  quote?: PricingResult | null;
  quoteLoading?: boolean;
  quoteError?: string | null;  // ✅ NEW: show error if quote failed
}

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

const fmtMoney = (v: number | string) => Number(v).toLocaleString();

const fmtDateTime = (v: string) => {
  const d = new Date(v);
  return d.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
};

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
  quoteError = null,
}: BookingSummaryProps) {
  const getDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const days = quote?.billable_days || getDays();
  const driverStatusStyle = driver ? (DRIVER_STATUS_STYLES[driver.status] || DRIVER_STATUS_STYLES.available) : null;
  const serviceBadgeLabel = SERVICE_LABELS[serviceType];

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

      {/* Driver Info */}
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

      {/* Dates + Times */}
      <div className="mb-3 pb-3 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays size={14} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-ink)]">Period</span>
        </div>
        {startDate && endDate ? (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">Pickup</span>
              <span className="font-medium text-[var(--color-ink)]">{fmtDateTime(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">Return</span>
              <span className="font-medium text-[var(--color-ink)]">{fmtDateTime(endDate)}</span>
            </div>
            <div className="pt-1 border-t border-[var(--color-surface-border)] flex justify-between items-center">
              <span className="text-[var(--color-ink-muted)]">Duration</span>
              <span className="font-semibold text-[var(--color-ink)]">
                {days} day{days !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-ink-muted)]">No dates selected</div>
        )}
      </div>

      {/* ✅ Live Pricing Breakdown */}
      {quote && quote.lines.length > 0 && (
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
          </div>
        </div>
      )}

      {/* ✅ Quote Error */}
      {quoteError && !quoteLoading && (
        <div className="mb-3 p-2 rounded-lg bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20">
          <div className="text-[10px] text-[var(--color-danger)] font-semibold">
            {quoteError}
          </div>
        </div>
      )}

      {/* Total */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--color-ink-muted)]">Total Amount</span>
          {quoteLoading && <Loader2 size={12} className="animate-spin text-[var(--color-ink-muted)]" />}
        </div>
        <div className="text-2xl font-bold text-[var(--color-ink)]">
          KES {totalAmount.toLocaleString()}
        </div>
        {quote && (
          <div className="text-[10px] text-[var(--color-ink-muted)] mt-1">
            {days} days × KES {fmtMoney(quote.daily_rate)}/day
          </div>
        )}
      </div>
    </div>
  );
}

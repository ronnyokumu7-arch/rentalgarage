"use client";

import { UserCircle, Phone, CreditCard, Car, CheckCircle, WarningCircle as AlertCircle } from "@phosphor-icons/react/ssr";
import type { Booking } from "@/lib/types";

interface DriverProfileWidgetProps {
  booking: Booking;
}

const DRIVER_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]", label: "Available" },
  on_trip: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]", label: "On Trip" },
  on_leave: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]", label: "On Leave" },
  suspended: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]", label: "Suspended" },
};

const dlHealth = (expiry?: string | null) => {
  if (!expiry) return null;
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "EXPIRED", cls: "text-[var(--color-danger)] font-bold", icon: AlertCircle };
  if (days <= 30) return { label: `${days}d left`, cls: "text-[var(--color-warning-text)] font-bold", icon: AlertCircle };
  return { label: "Valid", cls: "text-[var(--color-success-text)]", icon: CheckCircle };
};

export default function DriverProfileWidget({ booking }: DriverProfileWidgetProps) {
  // ✅ If no driver assigned (self-drive), show a compact "Self-drive" indicator
  if (!booking.driver_id || !booking.driver) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)]">
              <UserCircle size={20} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">Driver</h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">Self-drive rental</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] text-[10px] font-bold uppercase">
            No Driver
          </span>
        </div>
      </div>
    );
  }

  // ✅ Driver assigned — full profile from nested object
  const driver = booking.driver;
  const statusStyle = DRIVER_STATUS_STYLES[driver.status] || DRIVER_STATUS_STYLES.available;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <UserCircle size={14} aria-hidden="true" />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Assigned Driver</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.text}`}>
          {statusStyle.label}
        </span>
      </div>

      {/* Driver Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name + Phone */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">Name</p>
          <p className="text-sm font-semibold text-[var(--color-ink)]">{driver.full_name}</p>
          {driver.phone && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] mt-1">
              <Phone size={11} className="text-[var(--color-ink-subtle)]" aria-hidden="true" />
              <span>{driver.phone}</span>
            </div>
          )}
        </div>

        {/* ID + DL */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">Documents</p>
          <div className="space-y-1">
            {driver.id_number && (
              <div className="flex items-center gap-1.5 text-xs">
                <CreditCard size={11} className="text-[var(--color-ink-subtle)]" aria-hidden="true" />
                <span className="font-mono text-[var(--color-ink)]">ID {driver.id_number}</span>
              </div>
            )}
            {driver.dl_number && (
              <div className="flex items-center gap-1.5 text-xs">
                <Car size={11} className="text-[var(--color-ink-subtle)]" aria-hidden="true" />
                <span className="font-mono text-[var(--color-ink)]">DL {driver.dl_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DL Health Badge */}
      {(() => {
        const health = dlHealth(driver.dl_expiry);
        if (!health) return null;
        const Icon = health.icon;
        return (
          <div className={`flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--color-surface-border)] ${health.cls}`}>
            <Icon size={12} aria-hidden="true" />
            <span className="text-[11px] font-semibold">License {health.label}</span>
          </div>
        );
      })()}

      {/* Delivery Commission (if set) */}
      {driver.delivery_commission && Number(driver.delivery_commission) > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)] flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Delivery Commission</span>
          <span className="text-sm font-bold text-[var(--color-primary)]">
            KES {Number(driver.delivery_commission).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

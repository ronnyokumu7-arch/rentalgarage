// src/components/fleet/VehicleSpecsPanel.tsx
"use client";

import { useState } from "react";
import {
  Calendar, Wrench, ShieldCheck, AlertCircle, Activity, TrendingUp, Banknote,
  CheckCircle2, Clock, Gauge,
} from "lucide-react";
import type { Vehicle } from "@/lib/types";
import type { VehicleDerivedStats } from "@/hooks/fleet/useVehicleDetail";
import { formatMoney } from "@/lib/fleet/constants";

interface VehicleSpecsPanelProps {
  vehicle: Vehicle;
  stats: VehicleDerivedStats;
  onOpenDocument: (kind: "insurance" | "registration" | "inspection") => void;
  onEditLease: () => void;
}

type Tab = "activity" | "documents" | "service" | "lease";

const SPEC_ROWS = (v: Vehicle) => [
  { label: "Make", value: v.make },
  { label: "Model", value: v.model },
  { label: "Year", value: String(v.year) },
  { label: "Plate", value: v.plate_number, mono: true },
  { label: "VIN", value: v.vin || "—", mono: true },
  { label: "Daily Rate", value: formatMoney(v.daily_rate) },
  { label: "Current Mileage", value: `${v.current_mileage.toLocaleString()} km` },
  { label: "Next Service", value: v.next_service_km ? `${v.next_service_km.toLocaleString()} km` : "Not set" },
];

export default function VehicleSpecsPanel({
  vehicle,
  stats,
  onOpenDocument,
  onEditLease,
}: VehicleSpecsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const isInvestorOwned = !!vehicle.owner_id;

  const tabs: { id: Tab; label: string }[] = [
    { id: "activity", label: "Activity" },
    { id: "documents", label: "Documents" },
    { id: "service", label: "Service" },
    ...(isInvestorOwned ? [{ id: "lease" as Tab, label: "Lease" }] : []),
  ];

  const docs = [
    {
      kind: "insurance" as const,
      label: "Insurance",
      hasFile: !!vehicle.insurance_doc,
      meta: vehicle.insurance_number ? `Policy ${vehicle.insurance_number}` : "No policy number",
      expiry: vehicle.insurance_expiry,
    },
    {
      kind: "registration" as const,
      label: "Registration",
      hasFile: !!vehicle.registration_doc,
      meta: "Registration certificate",
      expiry: null,
    },
    {
      kind: "inspection" as const,
      label: "Inspection",
      hasFile: !!vehicle.inspection_doc,
      meta: "Inspection report",
      expiry: null,
    },
  ];

  // Service tab derived values
  const kmRemaining = stats.kmToService;
  const serviceState: "due" | "soon" | "ok" | "unset" =
    vehicle.next_service_km === null
      ? "unset"
      : stats.isDueForService
        ? "due"
        : kmRemaining !== null && kmRemaining <= 1000
          ? "soon"
          : "ok";

  const serviceBadge =
    serviceState === "due"
      ? { label: "Service Due", tone: "rose" as const }
      : serviceState === "soon"
        ? { label: "Approaching", tone: "amber" as const }
        : serviceState === "ok"
          ? { label: "On Schedule", tone: "emerald" as const }
          : { label: "Not Set", tone: "muted" as const };

  const badgeClasses = {
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    muted: "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border-[var(--color-surface-border)]",
  };

  return (
    <div className="space-y-3">
      {/* Specs card — always visible above the tabbed content */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-[var(--color-primary)]" />
          <h2 className="text-sm font-bold text-[var(--color-ink)] tracking-tight">Vehicle Specs</h2>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SPEC_ROWS(vehicle).map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                {row.label}
              </dt>
              <dd
                className={`text-xs sm:text-sm font-semibold text-[var(--color-ink)] mt-0.5 truncate ${
                  row.mono ? "font-mono" : ""
                }`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ✅ PREMIUM TABBED CONTENT — fixed-height panel, unified across tabs */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] overflow-hidden">
        {/* Tab bar — equal-width tabs, no awkward stretch */}
        <div className="flex items-center border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 relative h-10 text-[11px] font-bold tracking-wide transition-colors ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                {t.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-[var(--color-primary)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content — fixed min-height so switching tabs never causes layout jump */}
        <div className="p-4 sm:p-5 min-h-[180px]">
          {/* ── ACTIVITY ──────────────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="space-y-2.5">
              <ActivityRow
                icon={<TrendingUp size={12} />}
                label="Trips in last 30d"
                value={String(stats.last30dBookings)}
                tone="emerald"
              />
              <ActivityRow
                icon={<Activity size={12} />}
                label="Total trips"
                value={String(stats.totalBookings)}
                tone="blue"
              />
              <ActivityRow
                icon={<TrendingUp size={12} />}
                label="Utilization"
                value={`${stats.utilizationPct}%`}
                tone="purple"
              />
              {stats.activeTrip && (
                <ActivityRow
                  icon={<Clock size={12} />}
                  label="Active Trip"
                  value={stats.activeTrip.booking_number || `#${stats.activeTrip.id}`}
                  tone="amber"
                />
              )}
            </div>
          )}

          {/* ── DOCUMENTS ──────────────────────────────────────── */}
          {activeTab === "documents" && (
            <div className="space-y-2">
              {docs.map((doc) => (
                <button
                  key={doc.kind}
                  onClick={() => onOpenDocument(doc.kind)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    doc.hasFile
                      ? "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 hover:border-[var(--color-primary)]/40"
                      : "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      doc.hasFile
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    {doc.hasFile ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--color-ink)]">{doc.label}</p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] truncate">
                      {doc.hasFile ? doc.meta : "Missing — tap to upload"}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-primary)] flex-shrink-0">
                    {doc.hasFile ? "View" : "Upload"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── SERVICE — richer content ──────────────────────── */}
          {activeTab === "service" && (
            <div className="space-y-3">
              {/* Header with status badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      serviceState === "due"
                        ? "bg-rose-500/10 text-rose-500"
                        : serviceState === "soon"
                          ? "bg-amber-500/10 text-amber-500"
                          : serviceState === "ok"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                    }`}
                  >
                    <Wrench size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-ink)]">
                      {serviceState === "unset"
                        ? "No service threshold set"
                        : vehicle.next_service_km
                          ? `Next service at ${vehicle.next_service_km.toLocaleString()} km`
                          : "—"}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)]">
                      {serviceState === "unset"
                        ? "Set a threshold from the actions menu"
                        : kmRemaining !== null
                          ? kmRemaining < 0
                            ? `${Math.abs(kmRemaining).toLocaleString()} km overdue`
                            : `${kmRemaining.toLocaleString()} km remaining`
                          : "—"}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${badgeClasses[serviceBadge.tone]}`}
                >
                  {serviceBadge.label}
                </span>
              </div>

              {/* Progress bar */}
              {serviceState !== "unset" && vehicle.next_service_km && (
                <div>
                  <div className="flex items-center justify-between text-[9px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5">
                    <span>{vehicle.current_mileage.toLocaleString()} km</span>
                    <span>{vehicle.next_service_km.toLocaleString()} km</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-border)]/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        serviceState === "due"
                          ? "bg-gradient-to-r from-rose-400 to-rose-600"
                          : serviceState === "soon"
                            ? "bg-gradient-to-r from-amber-400 to-amber-600"
                            : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (vehicle.current_mileage / vehicle.next_service_km) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata rows */}
              <div className="pt-2 border-t border-[var(--color-surface-border)]/50 space-y-2">
                <ServiceMetaRow
                  icon={<Gauge size={11} />}
                  label="Current odometer"
                  value={`${vehicle.current_mileage.toLocaleString()} km`}
                />
                <ServiceMetaRow
                  icon={<CheckCircle2 size={11} />}
                  label="Last updated"
                  value={new Date(vehicle.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                />
                {vehicle.mileage_due && (
                  <ServiceMetaRow
                    icon={<AlertCircle size={11} />}
                    label="Mileage status"
                    value="Awaiting return log"
                    tone="amber"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── LEASE (investor only) ──────────────────────── */}
          {activeTab === "lease" && isInvestorOwned && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Investor
                </span>
                {vehicle.lease_rate_locked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                    Locked
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-ink-muted)]">Lease Rate</span>
                <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">
                  {vehicle.investor_lease_rate ? formatMoney(vehicle.investor_lease_rate) : "—"}
                  {vehicle.lease_rate_type && (
                    <span className="text-[10px] font-medium text-[var(--color-ink-muted)] ml-1">
                      /{vehicle.lease_rate_type}
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={onEditLease}
                className="w-full h-8 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[11px] font-bold text-[var(--color-ink)] transition-colors flex items-center justify-center gap-1.5"
              >
                <Banknote size={11} /> Edit Lease Agreement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "emerald" | "blue" | "purple" | "amber";
}) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  } as const;

  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[tone]}`}>
        {icon}
      </div>
      <span className="text-xs text-[var(--color-ink-muted)] flex-1">{label}</span>
      <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{value}</span>
    </div>
  );
}

function ServiceMetaRow({
  icon,
  label,
  value,
  tone = "muted",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "muted" | "amber";
}) {
  const iconColor =
    tone === "amber"
      ? "text-amber-500"
      : "text-[var(--color-ink-subtle)]";
  const valueColor =
    tone === "amber"
      ? "text-amber-600 dark:text-amber-400"
      : "text-[var(--color-ink)]";

  return (
    <div className="flex items-center gap-3">
      <span className={`w-4 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        {icon}
      </span>
      <span className="text-[11px] text-[var(--color-ink-muted)] flex-1">{label}</span>
      <span className={`text-[11px] font-semibold tabular-nums ${valueColor}`}>
        {value}
      </span>
    </div>
  );
}

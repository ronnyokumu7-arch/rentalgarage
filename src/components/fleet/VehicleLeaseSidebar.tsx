// src/components/fleet/VehicleLeaseSidebar.tsx
"use client";

import { User, Banknote, Activity, TrendingUp } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import type { VehicleDerivedStats as Stats } from "@/hooks/fleet/useVehicleDetail";
import { formatMoney } from "@/lib/fleet/constants";

interface VehicleLeaseSidebarProps {
  vehicle: Vehicle;
  stats: Stats;
  onEditLease: () => void;
}

export default function VehicleLeaseSidebar({ vehicle, stats, onEditLease }: VehicleLeaseSidebarProps) {
  const isInvestorOwned = !!vehicle.owner_id;

  return (
    <div className="space-y-4">
      {/* ✅ Ownership / Lease block — only renders for investor-owned vehicles.
          Agency vehicles skip this entirely (ownership is implied). */}
      {isInvestorOwned && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-purple-500" />
            <h2 className="text-sm font-bold text-[var(--color-ink)] tracking-tight">
              Lease Agreement
            </h2>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <User size={9} /> Investor
            </span>
            {vehicle.lease_rate_locked && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                Locked
              </span>
            )}
          </div>

          <dl className="space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <dt className="text-[11px] text-[var(--color-ink-muted)]">Lease Rate</dt>
              <dd className="text-xs font-bold text-[var(--color-ink)] tabular-nums">
                {vehicle.investor_lease_rate ? formatMoney(vehicle.investor_lease_rate) : "—"}
                {vehicle.lease_rate_type && (
                  <span className="text-[10px] font-medium text-[var(--color-ink-muted)] ml-1">
                    /{vehicle.lease_rate_type}
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <button
            onClick={onEditLease}
            className="w-full h-8 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[11px] font-bold text-[var(--color-ink)] transition-colors flex items-center justify-center gap-1.5"
          >
            <Banknote size={11} /> Edit Lease Agreement
          </button>
        </div>
      )}

      {/* Activity — always shown for all vehicles */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-[var(--color-primary)]" />
          <h2 className="text-sm font-bold text-[var(--color-ink)] tracking-tight">Activity</h2>
        </div>
        <div className="space-y-2.5">
          <ActivityRow
            icon={<TrendingUp size={11} />}
            label="Trips in last 30d"
            value={String(stats.last30dBookings)}
            tone="emerald"
          />
          <ActivityRow
            icon={<Activity size={11} />}
            label="Total trips"
            value={String(stats.totalBookings)}
            tone="blue"
          />
          <ActivityRow
            icon={<TrendingUp size={11} />}
            label="Utilization"
            value={`${stats.utilizationPct}%`}
            tone="purple"
          />
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
  tone: "emerald" | "blue" | "purple";
}) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
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

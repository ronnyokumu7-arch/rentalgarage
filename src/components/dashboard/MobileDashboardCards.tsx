// src/components/dashboard/MobileDashboardCards.tsx
"use client";

import { motion } from "framer-motion";
import {
  Wrench, Clock, CheckCircle2, ArrowUpRight, Landmark,
} from "lucide-react";

// src/components/dashboard/MobileDashboardCards.tsx (ONLY UPDATE MobileHeroEarnings)

export function MobileHeroEarnings({ value, change }: { value: string; change?: { value: string; positive: boolean } }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="pt-1 pb-3">
      <div className="flex items-center gap-2 mb-0.5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Landmark size={13} className="text-white" />
        </div>
        <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wider">Total Revenue</p>
      </div>
      
      {/* ✅ PREMIUM GRADIENT TEXT */}
      <p className="text-3xl font-bold tracking-tight font-display mt-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 bg-clip-text text-transparent">
        {value}
      </p>

      <div className="flex items-center gap-3 mt-0.5">
        <p className="text-[11px] text-ink-subtle">Lifetime earnings</p>
        {change && (
          <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${change.positive ? 'text-success' : 'text-danger'}`}>
            {change.positive ? <ArrowUpRight size={12} /> : <ArrowUpRight size={12} />}{change.value}
            <span className="text-ink-muted font-normal">vs last month</span>
          </div>
        )}
      </div>
      <div className="mt-2.5 h-px bg-surface-border/60" />
    </motion.div>
  );
}

export function MobileAlerts({ alerts }: { alerts: { vehiclesDueService: number; overdueReturns: number } }) {
  const hasAlerts = alerts.vehiclesDueService > 0 || alerts.overdueReturns > 0;

  if (!hasAlerts) {
    return (
      <div className="bg-surface rounded-xl border border-surface-border shadow-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-success" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink">All caught up</p>
            <p className="text-[9px] text-ink-muted">No pending alerts</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-surface-border shadow-card p-4">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wider">Alerts</p>
        <span className="px-2.5 py-0.5 rounded-full bg-danger/10 text-[9px] font-semibold text-danger-text border border-danger/20">
          {alerts.vehiclesDueService + alerts.overdueReturns}
        </span>
      </div>
      <div className="space-y-2">
        {alerts.vehiclesDueService > 0 && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-warning/5 border border-warning/10">
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center shrink-0"><Wrench size={14} className="text-warning-text" /></div>
            <div>
              <p className="text-xs font-medium text-warning-text">{alerts.vehiclesDueService} due service</p>
              <p className="text-[8px] text-ink-muted">Within 1,000 km</p>
            </div>
          </div>
        )}
        {alerts.overdueReturns > 0 && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-danger/5 border border-danger/10">
            <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center shrink-0"><Clock size={14} className="text-danger-text" /></div>
            <div>
              <p className="text-xs font-medium text-danger-text">{alerts.overdueReturns} overdue</p>
              <p className="text-[8px] text-ink-muted">Past end date</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MobileFleetStatus({ vehicles }: { vehicles: any[] }) {
  const available = vehicles.filter(v => v.status === 'available').length;
  const rented = vehicles.filter(v => v.status === 'rented').length;
  const maintenance = vehicles.filter(v => v.status === 'maintenance').length;

  return (
    <div className="bg-surface rounded-xl border border-surface-border shadow-card p-4">
      {/* ✅ Live updates moved to the top right */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-medium text-ink-muted uppercase tracking-wider">Fleet Status</p>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
          </span>
          <span className="text-[9px] font-medium text-success-text">Live updates</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2.5 rounded-lg bg-success/5 border border-success/10">
          <p className="text-lg font-bold text-ink">{available}</p>
          <p className="text-[8px] text-ink-muted uppercase tracking-wider">Available</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-lg font-bold text-ink">{rented}</p>
          <p className="text-[8px] text-ink-muted uppercase tracking-wider">Rented</p>
        </div>
        <div className="text-center p-2.5 rounded-lg bg-warning/5 border border-warning/10">
          <p className="text-lg font-bold text-ink">{maintenance}</p>
          <p className="text-[8px] text-ink-muted uppercase tracking-wider">Service</p>
        </div>
      </div>
    </div>
  );
}

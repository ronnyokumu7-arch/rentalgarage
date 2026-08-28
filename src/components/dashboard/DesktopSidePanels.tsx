// src/components/dashboard/DesktopSidePanels.tsx
"use client";

import { Wrench, Clock, CheckCircle2 } from "lucide-react";

export function DesktopFleetStatus({ vehicles }: { vehicles: any[] }) {
  const stats = [
    { label: 'Available', count: vehicles.filter(v => v.status === 'available').length, color: 'bg-success', bg: 'bg-success/10' },
    { label: 'Rented', count: vehicles.filter(v => v.status === 'rented').length, color: 'bg-primary', bg: 'bg-primary/10' },
    { label: 'Maintenance', count: vehicles.filter(v => v.status === 'maintenance').length, color: 'bg-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div className="bg-surface border border-surface-border shadow-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Fleet Status</p>
          <p className="text-xs text-ink-subtle mt-0.5">{vehicles.filter(v => v.status !== 'maintenance').length}/{vehicles.length} operational</p>
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
            <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${stat.color}`} /><span className="text-[10px] font-medium text-ink-muted">{stat.label}</span></div>
            <p className="text-lg font-bold text-ink mt-1">{stat.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DesktopAlerts({ alerts }: { alerts: { vehiclesDueService: number; overdueReturns: number } }) {
  const hasAlerts = alerts.vehiclesDueService > 0 || alerts.overdueReturns > 0;
  const totalAlerts = alerts.vehiclesDueService + alerts.overdueReturns;

  return (
    <div className="bg-surface border border-surface-border shadow-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Needs Attention</p>
        {hasAlerts && <span className="px-2 py-0.5 rounded-full bg-danger/10 text-[10px] font-bold text-danger-text border border-danger/20">{totalAlerts} Alerts</span>}
      </div>
      <div className="space-y-2.5">
        {alerts.vehiclesDueService > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center shrink-0"><Wrench size={14} className="text-warning-text" /></div>
            <div><p className="text-xs font-semibold text-warning-text">{alerts.vehiclesDueService} due service</p><p className="text-[10px] text-ink-muted">Within 1,000 km</p></div>
          </div>
        )}
        {alerts.overdueReturns > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-danger/10 border border-danger/20">
            <div className="w-8 h-8 rounded-lg bg-danger/20 flex items-center justify-center shrink-0"><Clock size={14} className="text-danger-text" /></div>
            <div><p className="text-xs font-semibold text-danger-text">{alerts.overdueReturns} overdue</p><p className="text-[10px] text-ink-muted">Past end date</p></div>
          </div>
        )}
        {!hasAlerts && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3"><CheckCircle2 size={24} className="text-success" /></div>
            <p className="text-sm font-medium text-ink-muted">All caught up!</p><p className="text-xs text-ink-subtle">No pending alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}

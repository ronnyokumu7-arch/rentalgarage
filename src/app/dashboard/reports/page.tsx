// src/app/dashboard/reports/page.tsx
"use client";

import { LineChart } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          {/* ✅ Bare Icon - No container */}
          <LineChart size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />
          
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
            Reports
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
          Business intelligence, revenue analytics, and operational insights.
        </p>
      </div>

      <div className="p-12 text-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] animate-in fade-in duration-300">
        <LineChart size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Reports & Analytics Hub</h3>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
          Revenue dashboards, vehicle utilization reports, client retention metrics, and operational KPIs coming soon.
        </p>
      </div>
    </div>
  );
}

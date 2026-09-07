// src/app/super-admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { tenantsApi } from "@/lib/api/tenants";
import type { Tenant } from "@/lib/types";

export default function SuperAdminPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all tenants (up to 500 for dashboard stats)
        const data = await tenantsApi.list({ page: 1, page_size: 500 });
        setTenants(data);
      } catch (_error) {
        console.error("Failed to load dashboard stats:", _error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate real stats from denormalized tenant data
  const totalAgencies = tenants.length;
  const activeCount = tenants.filter((t) => t.is_active && !t.is_archived).length;
  const trialCount = tenants.filter(
    (t) => t.subscription_status === "trial" || t.subscription_status === "starter_trial"
  ).length;
  const suspendedCount = tenants.filter((t) => !t.is_active && !t.is_archived).length;

  // Get tenants needing attention (past_due or suspended)
  const attentionTenants = tenants
    .filter(
      (t) =>
        !t.is_archived &&
        (t.subscription_status === "past_due" || t.subscription_status === "suspended")
    )
    .slice(0, 4);

  const stats = [
    {
      label: "Total Agencies",
      value: totalAgencies,
      icon: Building2,
      color: "text-[var(--color-primary)]",
      bg: "bg-[var(--color-primary)]/10",
    },
    {
      label: "Active",
      value: activeCount,
      icon: CheckCircle2,
      color: "text-[var(--color-success-text)]",
      bg: "bg-[var(--color-success-bg)]",
    },
    {
      label: "On Trial",
      value: trialCount,
      icon: Clock,
      color: "text-[var(--color-warning-text)]",
      bg: "bg-[var(--color-warning-bg)]",
    },
    {
      label: "Suspended",
      value: suspendedCount,
      icon: XCircle,
      color: "text-[var(--color-danger-text)]",
      bg: "bg-[var(--color-danger-bg)]",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <TrendingUp size={20} />
            </div>
            System Overview
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Monitor platform health, agency activity, and subscription status
          </p>
        </div>
        <button
          onClick={() => router.push("/super-admin/agencies")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-all"
        >
          View All Agencies <ArrowRight size={16} />
        </button>
      </div>

      {/* Real Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                  {stat.label}
                </p>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--color-ink)]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Attention + System Health */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subscriptions Needing Attention */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-5 border-b border-[var(--color-surface-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--color-warning-text)]" />
              <h3 className="text-sm font-bold text-[var(--color-ink)]">Subscriptions Needing Attention</h3>
            </div>
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
              {attentionTenants.length} agencies
            </span>
          </div>
          <div className="divide-y divide-[var(--color-surface-border)]">
            {attentionTenants.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--color-ink-muted)]">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-[var(--color-success-text)] opacity-50" />
                All subscriptions are healthy!
              </div>
            ) : (
              attentionTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-hover)]/50 transition-colors cursor-pointer"
                  onClick={() => router.push("/super-admin/agencies")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] flex-shrink-0">
                      <Building2 size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--color-ink)] truncate">{tenant.name}</p>
                      <p className="text-xs text-[var(--color-ink-muted)] truncate">
                        {tenant.admin_email || tenant.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                      tenant.subscription_status === "past_due"
                        ? "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]"
                        : "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]"
                    }`}
                  >
                    {tenant.subscription_status.replace("_", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Jobs Status (Static for now - can be wired to backend later) */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-5 border-b border-[var(--color-surface-border)]">
            <h3 className="text-sm font-bold text-[var(--color-ink)]">System Jobs Status</h3>
          </div>
          <div className="divide-y divide-[var(--color-surface-border)]">
            {[
              { name: "Invoice Generation", status: "Healthy", time: "2 min ago", ok: true },
              { name: "Contract Expiry Alerts", status: "Healthy", time: "15 min ago", ok: true },
              { name: "Payment Reconciliation", status: "Running", time: "Just now", ok: true },
            ].map((job) => (
              <div key={job.name} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-success-bg)] flex items-center justify-center text-[var(--color-success-text)]">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-ink)]">{job.name}</p>
                    <p className="text-xs text-[var(--color-ink-muted)]">{job.time}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--color-success-bg)] text-[var(--color-success-text)]">
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

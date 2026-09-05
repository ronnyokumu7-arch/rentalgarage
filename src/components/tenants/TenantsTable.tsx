// src/components/tenants/TenantsTable.tsx
"use client";

import { useRouter } from "next/navigation";
import { Building2, Mail, User, Phone, Search, Filter, Archive, Plus, CreditCard } from "lucide-react";
import type { Tenant } from "@/lib/types";
import CardGrid from "@/components/ui/CardGrid";
import DataTable, { RowAction } from "@/components/ui/DataTable";

export function TenantsTable({ 
  filteredTenants, loading:_loading, actionLoadingId:_actionLoadingId, 
  handleToggleSubscription, handleArchive,
  searchQuery, setSearchQuery, statusFilter, setStatusFilter, 
  subFilter:_subFilter, setSubFilter:_setSubFilter, showArchived, setShowArchived 
}: any) {
  const router = useRouter();

  // ✅ Reusable actions for both CardGrid and DataTable
  const getActions = (tenant: Tenant): RowAction<Tenant>[] => [
    {
      label: "Manage Subscription",
      icon: CreditCard,
      variant: "primary",
      onClick: () => handleToggleSubscription(tenant),
    },
    {
      label: "Archive Agency",
      icon: Archive,
      variant: "danger",
      separator: true,
      onClick: () => handleArchive(tenant.id),
    },
  ];

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-sm overflow-hidden">
      
      {/* Integrated Hero Action Row */}
      <div className="p-4 border-b border-[var(--color-surface-border)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" size={16} />
            <input
              placeholder="Search by name, email or KRA PIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 text-sm focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
            />
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${showArchived ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"}`}
          >
            <Archive size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Restored Filter Icons */}
          <div className="flex items-center gap-2 text-[var(--color-ink-muted)] flex-1 md:flex-initial">
            <Filter size={16} className="flex-shrink-0" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="w-full md:w-auto px-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs focus:outline-none"
            >
              <option value="ALL">All Accounts</option>
              <option value="ACTIVE">Active</option>
            </select>
          </div>
          
          <button 
            onClick={() => router.push("/super-admin/agencies/new")} 
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Plus size={14} /> Onboard New
          </button>
        </div>
      </div>

      {/* ✅ MOBILE: Premium CardGrid with Bottom Sheet Actions */}
      <div className="block md:hidden">
        <CardGrid
          data={filteredTenants}
          getCardId={(tenant) => tenant.id}
          compact={true}
          showGlassEffect={true}
          containerClassName="px-4 py-4"
          maxHeight="calc(100vh - 200px)"
          rowActions={getActions}
          renderCardHeader={({ item }) => (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0 mt-0.5">
                  <Building2 size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[var(--color-ink)] truncate">{item.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] mt-0.5 truncate">
                    <Mail size={12} className="flex-shrink-0" />
                    <span className="truncate">{item.email}</span>
                  </div>
                  {item.profile?.tax_number && (
                    <div className="text-[10px] text-[var(--color-ink-subtle)] font-mono mt-0.5">
                      PIN: {item.profile.tax_number}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {item.is_trial ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> TRIAL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                  </span>
                )}
              </div>
            </div>
          )}
          renderCardBody={({ item }) => (
            <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60 flex items-center justify-between gap-2 text-xs text-[var(--color-ink-muted)]">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <User size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <span className="truncate">{item.admin_name || "Not Set"}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                  <span className="truncate">{item.admin_phone || "—"}</span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                  <CreditCard size={12} />
                  {item.plan || "Starter"}
                </span>
              </div>
            </div>
          )}
        />
      </div>

      {/* ✅ DESKTOP: Reusable DataTable */}
      <div className="hidden md:block">
        <DataTable
          data={filteredTenants}
          columns={[
            {
              header: "Organization",
              accessorKey: "name",
              cell: ({ row }) => {
                const tenant = row.original;
                return (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0 mt-0.5">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-primary)] transition-colors">{tenant.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] mt-0.5">
                        <Mail size={12} /> {tenant.email}
                      </div>
                      {tenant.profile?.tax_number && (
                        <div className="text-[10px] text-[var(--color-ink-subtle)] font-mono mt-0.5">PIN: {tenant.profile.tax_number}</div>
                      )}
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Admin Contact",
              accessorKey: "admin_name",
              cell: ({ row }) => (
                <div className="space-y-1.5 text-xs text-[var(--color-ink-muted)]">
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-[var(--color-ink-subtle)]" />
                    <span>{row.original.admin_name || "Not Set"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-[var(--color-ink-subtle)]" />
                    <span>{row.original.admin_phone || "—"}</span>
                  </div>
                </div>
              ),
            },
            {
              header: "Plan",
              accessorKey: "plan",
              cell: ({ row }) => (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                  <CreditCard size={12} />
                  {row.original.plan || "Starter"}
                </span>
              ),
            },
            {
              header: "Status",
              accessorKey: "is_trial",
              cell: ({ row }) => (
                row.original.is_trial ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> TRIAL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
                  </span>
                )
              ),
            },
          ]}
          rowActions={getActions}
          getRowId={(tenant) => tenant.id}
          emptyMessage="No agencies found"
        />
      </div>

    </div>
  );
}

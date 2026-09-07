// src/components/super-admin/tenants/TenantsTable.tsx
"use client";

import { useRouter } from "next/navigation";
import { Building2, Mail, User, Phone, CreditCard, Archive, RotateCcw, ShieldAlert, Eye } from "lucide-react";
import type { Tenant } from "@/lib/types";
import TenantCardGrid from "@/components/tenants/TenantCardGrid";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import { TenantsToolbar } from "@/components/tenants/TenantsToolbar";

interface TenantsTableProps {
  filteredTenants: Tenant[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string | null) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  handleToggleSubscription: (tenant: Tenant) => void;
  handleArchive: (id: number | string) => void;
  handleRestore: (id: number | string) => void;
  handleSuspend: (id: number | string) => void;
  handleUnsuspend: (id: number | string) => void;
  onExport?: (format: "csv" | "excel") => void;
}

export function TenantsTable({
  filteredTenants,
  loading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  showArchived,
  setShowArchived,
  handleToggleSubscription,
  handleArchive,
  handleRestore,
  handleSuspend,
  handleUnsuspend,
  onExport,
}: TenantsTableProps) {
  const router = useRouter();

  // ✅ Reusable actions for both TenantCardGrid and DataTable
  const getActions = (tenant: Tenant): RowAction<Tenant>[] => {
    const actions: RowAction<Tenant>[] = [
      {
        label: "View Details",
        icon: Eye,
        variant: "default",
        onClick: () => router.push(`/super-admin/agencies/${tenant.id}`),
      },
      {
        label: "Manage Subscription",
        icon: CreditCard,
        variant: "primary",
        onClick: () => handleToggleSubscription(tenant),
      },
    ];

    if (tenant.effective_status === "vaulted" || tenant.is_archived) {
      actions.push({
        label: "Restore Agency",
        icon: RotateCcw,
        variant: "default",
        separator: true,
        onClick: () => handleRestore(tenant.id),
      });
    } else if (tenant.effective_status === "suspended" || tenant.suspended_at || tenant.subscription_status === "suspended") {
      actions.push({
        label: "Unsuspend Agency",
        icon: RotateCcw,
        variant: "default",
        separator: true,
        onClick: () => handleUnsuspend(tenant.id),
      });
      actions.push({
        label: "Archive Agency",
        icon: Archive,
        variant: "danger",
        onClick: () => handleArchive(tenant.id),
      });
    } else {
      actions.push({
        label: "Suspend Agency",
        icon: ShieldAlert,
        variant: "default",
        separator: true,
        onClick: () => handleSuspend(tenant.id),
      });
      actions.push({
        label: "Archive Agency",
        icon: Archive,
        variant: "danger",
        onClick: () => handleArchive(tenant.id),
      });
    }

    return actions;
  };

  const getStatusBadge = (tenant: Tenant) => {
    const status = tenant.effective_status;
    
    if (status === "vaulted" || tenant.is_archived) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ink-subtle)]" /> VAULTED
        </span>
      );
    }
    if (status === "suspended" || tenant.suspended_at || tenant.subscription_status === "suspended") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] border border-[var(--color-danger-border)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)]" /> SUSPENDED
        </span>
      );
    }
    if (status === "trial" || tenant.is_trial) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> TRIAL
        </span>
      );
    }
    if (status === "attention") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border border-[var(--color-warning-border)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)]" /> ATTENTION
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE
      </span>
    );
  };

  const isVaultView = showArchived === true;
  const isEmptyVault = isVaultView && filteredTenants.length === 0;

  return (
    <div className="space-y-4">
      {/* ✅ Premium TenantsToolbar */}
      <TenantsToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        onExport={onExport}
      />

      {/* ✅ MOBILE: TenantCardGrid with Sharp Edges */}
      <div className="block md:hidden">
        {isEmptyVault ? (
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mb-4">
              <Archive size={32} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Vault is Empty</h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              No agencies have been archived. Archived agencies will appear here and can be restored at any time.
            </p>
          </div>
        ) : (
          <TenantCardGrid
            data={filteredTenants}
            getCardId={(tenant) => tenant.id}
            compact={true}
            showGlassEffect={true}
            containerClassName="px-0 py-0"
            maxHeight="calc(100vh - 200px)"
            rowActions={getActions}
            renderCardHeader={({ item }) => (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
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
                <div className="flex-shrink-0">{getStatusBadge(item)}</div>
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
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                    <CreditCard size={12} />
                    {item.plan || "Starter"}
                  </span>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* ✅ DESKTOP: DataTable */}
      <div className="hidden md:block">
        <DataTable
          data={filteredTenants}
          loading={loading}
          emptyMessage={loading ? "Loading agencies..." : "No agencies found"}
          columns={[
            {
              header: "Organization",
              accessorKey: "name",
              cell: ({ row }) => {
                const tenant = row.original;
                return (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0 mt-0.5">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--color-ink)]">{tenant.name}</div>
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
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
                  <CreditCard size={12} />
                  {row.original.plan || "Starter"}
                </span>
              ),
            },
            {
              header: "Status",
              accessorKey: "effective_status",
              cell: ({ row }) => getStatusBadge(row.original),
            },
          ]}
          rowActions={getActions}
          getRowId={(tenant) => tenant.id}
          onRowClick={(tenant) => router.push(`/super-admin/agencies/${tenant.id}`)}
        />
      </div>
    </div>
  );
}

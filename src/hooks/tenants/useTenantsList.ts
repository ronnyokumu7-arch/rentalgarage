// src/hooks/tenants/useTenantsList.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { tenantsApi } from "@/lib/api/tenants";
import type { Tenant } from "@/lib/types";

// ✅ All 4 lifecycle actions flow through the same confirmation modal pipeline.
// No more window.confirm() (which violates no-alert ESLint rule).
export interface PendingDestructiveAction {
  type: "suspend" | "archive" | "unsuspend" | "restore";
  tenant: Tenant;
}

export const useTenantsList = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);

  // Modal state for all lifecycle actions (routed to ConfirmDestructiveModal)
  const [pending, setPending] = useState<PendingDestructiveAction | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);

  // ✅ Fetch with proper params (backend does the scoping)
  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tenantsApi.list({
        page: 1,
        page_size: 200,
        search: searchQuery || undefined,
        status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
        show_archived: showArchived,
      });
      setTenants(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || error?.message || "Failed to load tenant directory");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, showArchived]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // ✅ Client-side filtering is now minimal (backend does the heavy lifting)
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const kraPin = tenant.profile?.tax_number || "";
      const matchesSearch =
        tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kraPin.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [tenants, searchQuery]);

  // ── SUBSCRIPTION TOGGLE ─────────────────────────────────────────────────
  const handleToggleSubscription = async (tenant: Tenant) => {
    setActionLoadingId(tenant.id);
    try {
      const isCurrentlyActive = tenant.subscription_status === "active";
      if (isCurrentlyActive) {
        await tenantsApi.update(tenant.id, { subscription_status: "past_due" });
        toast.success("Subscription deactivated");
      } else {
        await tenantsApi.update(tenant.id, { subscription_status: "active" });
        toast.success("Subscription activated");
      }
      await fetchTenants();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || error?.message || "Subscription toggle failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── SUSPEND (routes through confirmation modal) ─────────────────────────
  const handleSuspend = (tenantId: number | string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) return;
    setPending({ type: "suspend", tenant });
  };

  // ── UNSUSPEND (routes through confirmation modal — no more window.confirm)
  const handleUnsuspend = (tenantId: number | string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) return;
    setPending({ type: "unsuspend", tenant });
  };

  // ── ARCHIVE / VAULT (routes through confirmation modal) ─────────────────
  const handleArchive = (tenantId: number | string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) return;
    setPending({ type: "archive", tenant });
  };

  // ── RESTORE FROM VAULT (routes through confirmation modal — no more window.confirm)
  const handleRestore = (tenantId: number | string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) return;
    setPending({ type: "restore", tenant });
  };

  // ── EXECUTE PENDING ACTION (after confirmation modal confirmation) ──────
  const executePending = async () => {
    if (!pending) return;
    const { type, tenant } = pending;
    setActionLoadingId(tenant.id);
    try {
      if (type === "suspend") {
        await tenantsApi.suspend(tenant.id, { reason: "Suspended by super-admin" });
        toast.success(`${tenant.name} has been suspended. They can no longer access their dashboard.`);
      } else if (type === "archive") {
        await tenantsApi.archive(tenant.id, { reason: "Archived by super-admin" });
        toast.success(`${tenant.name} has been moved to the Vault.`);
      } else if (type === "unsuspend") {
        await tenantsApi.activate(tenant.id, { note: "Unsuspended by super-admin" });
        toast.success(`${tenant.name} has been unsuspended.`);
      } else if (type === "restore") {
        await tenantsApi.restore(tenant.id, { note: "Restored from vault by super-admin" });
        toast.success(`${tenant.name} has been restored.`);
      }
      setPending(null);
      await fetchTenants();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || error?.message || "Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    tenants,
    filteredTenants,
    loading,
    actionLoadingId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter: (value: string | null) => setStatusFilter(value || "ALL"),
    showArchived,
    setShowArchived,
    fetchTenants,
    handleToggleSubscription,
    handleSuspend,
    handleUnsuspend,
    handleArchive,
    handleRestore,
    // Modal control surface
    pending,
    setPending,
    executePending,
  };
};

// src/components/admin/TenantSubscriptionVerification.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Smartphone, 
  Building2, 
  Loader2, 
  RefreshCw, 
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

// ✅ Import the official type directly from the API client
import { subscriptionsApi, SubscriptionRequest } from "@/lib/api/subscriptions";
import CardGrid from "@/components/ui/CardGrid";
import DataTable, { RowAction } from "@/components/ui/DataTable";

export default function TenantSubscriptionVerification() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch pending requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await subscriptionsApi.getPendingRequests();
      
      // ✅ FIXED: Added safe fallback to guarantee 'requests' state is always an array
      setRequests(data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load subscription requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (req: SubscriptionRequest) => {
    setProcessingId(req.id);
    try {
      // ✅ Calls the real backend endpoint which automatically activates the tenant & subscription
      await subscriptionsApi.approveRequest(req.id);
      toast.success(`Payment verified. ${req.tenant_name || 'Tenant'} workspace activated successfully.`);
      fetchRequests(); // Refresh the list
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Approval failed. Check server logs.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    
    setProcessingId(id);
    try {
      await subscriptionsApi.rejectRequest(id, rejectionReason.trim());
      toast.success("Payment request rejected.");
      setRejectingId(null);
      setRejectionReason("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Rejection failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Date formatting error:", e, dateStr);
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  // ✅ Reusable actions for both CardGrid and DataTable
  const getActions = (req: SubscriptionRequest): RowAction<SubscriptionRequest>[] => [
    {
      label: "Approve Subscription",
      icon: CheckCircle,
      variant: "primary",
      onClick: () => handleApprove(req),
      disabled: processingId === req.id,
    },
    {
      label: "Reject Subscription",
      icon: XCircle,
      variant: "danger",
      separator: true,
      onClick: () => setRejectingId(req.id),
      disabled: processingId === req.id,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Subscription Approvals</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Live verification queue for incoming tenant payments.</p>
          </div>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl overflow-hidden shadow-sm">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">All Caught Up!</h3>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-[240px]">
              No pending payment verifications in the queue right now.
            </p>
          </div>
        ) : (
          <>
            {/* ✅ MOBILE: Reusable CardGrid with Premium Bottom Sheet */}
            <div className="block md:hidden">
              <CardGrid
                data={requests}
                getCardId={(req) => req.id}
                compact={true}
                showGlassEffect={true}
                containerClassName="px-4 py-4"
                maxHeight="calc(100vh - 200px)"
                rowActions={getActions}
                renderCardHeader={({ item }) => (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--color-ink)] truncate">
                          {item.tenant_name || `Tenant #${item.tenant_id}`}
                        </p>
                        <p className="text-[10px] text-[var(--color-ink-muted)] font-mono">
                          ID: {item.tenant_id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                renderCardBody={({ item }) => (
                  <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                        Plan
                      </span>
                      <span className="text-sm font-extrabold text-[var(--color-ink)] capitalize">
                        {item.target_plan === 'pro' ? 'Pro Fleet' : item.target_plan}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                        Cycle
                      </span>
                      <span className="text-xs text-[var(--color-ink-muted)] capitalize">
                        {item.target_billing_cycle}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                        Reference
                      </span>
                      <span className="flex items-center gap-1.5 font-mono font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] px-2 py-1 rounded border border-[var(--color-surface-border)]">
                        <Smartphone size={12} className="text-emerald-500" />
                        {item.reference_code}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                        Submitted
                      </span>
                      <span className="text-xs text-[var(--color-ink-muted)]">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    {item.notes && (
                      <div className="text-[10px] text-[var(--color-ink-subtle)] italic truncate max-w-[200px]" title={item.notes}>
                        "{item.notes}"
                      </div>
                    )}
                    {rejectingId === item.id && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200 pt-2">
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          className="flex-1 px-2 py-1.5 rounded-lg border border-rose-500/30 bg-[var(--color-surface)] text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={processingId === item.id}
                          className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-all"
                        >
                          {processingId === item.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectionReason("");
                          }}
                          className="p-2 rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            {/* ✅ DESKTOP: Reusable DataTable */}
            <div className="hidden md:block">
              <DataTable
                data={requests}
                columns={[
                  {
                    header: "Tenant",
                    accessorKey: "tenant_name",
                    cell: ({ row }) => (
                      <div>
                        <div className="font-semibold text-[var(--color-ink)]">
                          {row.original.tenant_name || `Tenant #${row.original.tenant_id}`}
                        </div>
                        <div className="text-[10px] text-[var(--color-ink-subtle)] font-mono">
                          ID: {row.original.tenant_id}
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "Plan & Cycle",
                    accessorKey: "target_plan",
                    cell: ({ row }) => (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[var(--color-ink)] capitalize">
                          {row.original.target_plan === 'pro' ? 'Pro Fleet' : row.original.target_plan}
                        </span>
                        <span className="text-[10px] text-[var(--color-ink-muted)] capitalize bg-[var(--color-surface-hover)] px-1.5 py-0.5 rounded w-fit">
                          {row.original.target_billing_cycle}
                        </span>
                      </div>
                    ),
                  },
                  {
                    header: "Payment Reference",
                    accessorKey: "reference_code",
                    cell: ({ row }) => (
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          row.original.payment_method === "mpesa" 
                            ? "bg-emerald-500/10 text-emerald-600" 
                            : "bg-blue-500/10 text-blue-600"
                        }`}>
                          {row.original.payment_method === "mpesa" ? <Smartphone size={14} /> : <Building2 size={14} />}
                        </div>
                        <span className="font-mono font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] px-2 py-1 rounded border border-[var(--color-surface-border)]">
                          {row.original.reference_code}
                        </span>
                      </div>
                    ),
                  },
                  {
                    header: "Submitted",
                    accessorKey: "created_at",
                    cell: ({ row }) => (
                      <span className="text-[var(--color-ink-muted)]">
                        {formatDate(row.original.created_at)}
                      </span>
                    ),
                  },
                  {
                    header: "Actions",
                    accessorKey: "actions",
                    cell: ({ row }) => {
                      const req = row.original;
                      return (
                        <div className="flex items-center justify-end gap-2">
                          {rejectingId === req.id ? (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                              <input
                                type="text"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Reason..."
                                className="px-2 py-1.5 rounded-lg border border-rose-500/30 bg-[var(--color-surface)] text-xs text-[var(--color-ink)] focus:outline-none focus:ring-1 focus:ring-rose-500 w-40"
                                autoFocus
                              />
                              <button
                                onClick={() => handleReject(req.id)}
                                disabled={processingId === req.id}
                                className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-all"
                              >
                                {processingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                              </button>
                              <button
                                onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                                className="p-2 rounded-xl bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApprove(req)}
                                disabled={processingId === req.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50 transition-all font-bold text-[11px]"
                              >
                                {processingId === req.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectingId(req.id)}
                                disabled={processingId === req.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 disabled:opacity-50 transition-all font-bold text-[11px]"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      );
                    },
                  },
                ]}
                rowActions={getActions}
                getRowId={(req) => req.id}
                loading={loading}
                emptyMessage="No subscription requests found"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

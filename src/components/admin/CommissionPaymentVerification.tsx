// src/components/admin/CommissionPaymentVerification.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Smartphone,
  Wallet,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { commissionAdminApi, CommissionPayment } from "@/lib/api/commission";
import { tenantsApi } from "@/lib/api/tenants";
import CardGrid from "@/components/ui/CardGrid";
import DataTable, { RowAction } from "@/components/ui/DataTable";

type QueueStatus = "pending" | "verified" | "rejected";

const STATUS_STYLES: Record<QueueStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  verified: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export default function CommissionPaymentVerification() {
  const [payments, setPayments] = useState<CommissionPayment[]>([]);
  const [tenantNames, setTenantNames] = useState<Record<number, string>>({});
  const [statusFilter, setStatusFilter] = useState<QueueStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // ✅ Tenant id → name map (queue shows names, not raw ids)
  useEffect(() => {
    tenantsApi
      .list(0, 500)
      .then((tenants) => {
        const map: Record<number, string> = {};
        tenants.forEach((t) => (map[t.id] = t.name));
        setTenantNames(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await commissionAdminApi.listPayments(statusFilter);
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load commission payments.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (p: CommissionPayment) => {
    setProcessingId(p.id);
    try {
      const res = await commissionAdminApi.verify(p.id);
      toast.success(
        `Payment verified — ${res.data.events_marked_paid} trip(s) marked paid. Tenant unlocked.`
      );
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Verification failed.");
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
      await commissionAdminApi.reject(id, rejectionReason.trim());
      toast.success("Payment rejected.");
      setRejectingId(null);
      setRejectionReason("");
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Rejection failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
      </div>
    );
  }

  // ✅ Reusable actions for both CardGrid and DataTable
  const getActions = (p: CommissionPayment): RowAction<CommissionPayment>[] => {
    if (statusFilter !== "pending") return [];
    return [
      {
        label: "Verify Payment",
        icon: CheckCircle,
        variant: "primary",
        onClick: () => handleVerify(p),
        disabled: processingId === p.id,
      },
      {
        label: "Reject Payment",
        icon: XCircle,
        variant: "danger",
        separator: true,
        onClick: () => setRejectingId(p.id),
        disabled: processingId === p.id,
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
            <Wallet size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-ink)]">Commission Approvals</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Verify tenant M-Pesa payments against your Paybill statement.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as QueueStatus)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl overflow-hidden shadow-sm">
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)] mb-1">All Caught Up!</h3>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-[240px]">
              No {statusFilter} commission payments in the queue right now.
            </p>
          </div>
        ) : (
          <>
            {/* ✅ MOBILE: Reusable CardGrid with Premium Bottom Sheet */}
            <div className="block md:hidden">
              <CardGrid
                data={payments}
                getCardId={(p) => p.id}
                compact={true}
                showGlassEffect={true}
                containerClassName="px-4 py-4"
                maxHeight="calc(100vh - 200px)"
                rowActions={getActions}
                renderCardHeader={({ item }) => (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Wallet size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--color-ink)] truncate">
                          {tenantNames[item.tenant_id] || `Tenant #${item.tenant_id}`}
                        </p>
                        <p className="text-[10px] text-[var(--color-ink-muted)] font-mono">
                          ID: {item.tenant_id}
                        </p>
                      </div>
                    </div>
                    {statusFilter !== "pending" && (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                )}
                renderCardBody={({ item }) => (
                  <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                        Amount
                      </span>
                      <span className="text-sm font-extrabold text-[var(--color-ink)] tabular-nums">
                        KES {parseFloat(item.amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                        M-Pesa Code
                      </span>
                      <span className="flex items-center gap-1.5 font-mono font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] px-2 py-1 rounded border border-[var(--color-surface-border)]">
                        <Smartphone size={12} className="text-emerald-500" />
                        {item.reference}
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
                        &quot;{item.notes}&quot;
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
                data={payments}
                columns={[
                  {
                    header: "Tenant",
                    accessorKey: "tenant_id",
                    cell: ({ row }) => (
                      <div>
                        <div className="font-semibold text-[var(--color-ink)]">
                          {tenantNames[row.original.tenant_id] || `Tenant #${row.original.tenant_id}`}
                        </div>
                        <div className="text-[10px] text-[var(--color-ink-subtle)] font-mono">
                          ID: {row.original.tenant_id}
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "Amount",
                    accessorKey: "amount",
                    cell: ({ row }) => (
                      <span className="font-bold text-[var(--color-ink)] tabular-nums">
                        KES {parseFloat(row.original.amount).toLocaleString()}
                      </span>
                    ),
                  },
                  {
                    header: "M-Pesa Code",
                    accessorKey: "reference",
                    cell: ({ row }) => (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                          <Smartphone size={14} />
                        </div>
                        <span className="font-mono font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] px-2 py-1 rounded border border-[var(--color-surface-border)]">
                          {row.original.reference}
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
                    header: "Status / Actions",
                    accessorKey: "status",
                    cell: ({ row }) => {
                      const p = row.original;
                      if (statusFilter !== "pending") {
                        return (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${STATUS_STYLES[p.status]}`}>
                            {p.status}
                          </span>
                        );
                      }
                      return (
                        <div className="flex items-center justify-end gap-2">
                          {rejectingId === p.id ? (
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
                                onClick={() => handleReject(p.id)}
                                disabled={processingId === p.id}
                                className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-all"
                              >
                                {processingId === p.id ? (
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
                          ) : (
                            <>
                              <button
                                onClick={() => handleVerify(p)}
                                disabled={processingId === p.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50 transition-all font-bold text-[11px]"
                              >
                                {processingId === p.id ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <CheckCircle size={14} />
                                )}
                                Verify
                              </button>
                              <button
                                onClick={() => setRejectingId(p.id)}
                                disabled={processingId === p.id}
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
                getRowId={(p) => p.id}
                loading={loading}
                emptyMessage="No payments found"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

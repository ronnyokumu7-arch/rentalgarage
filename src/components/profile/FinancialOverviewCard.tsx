"use client";

import { useState } from "react";
import { FileText, Signature as FileSignature, Copy, Download } from "@phosphor-icons/react/ssr";
import SectionCard from "@/components/ui/SectionCard"; // ✅ Reverted to default import
import type { Invoice, Contract } from "@/lib/types";

interface FinancialOverviewCardProps {
  invoices: Invoice[];
  contracts: Contract[];
  onAction: (type: "invoice" | "contract", action: "copy" | "download", id: number) => void;
}

export default function FinancialOverviewCard({ 
  invoices, 
  contracts, 
  onAction 
}: FinancialOverviewCardProps) {
  const [activeTab, setActiveTab] = useState<"invoices" | "contracts">("invoices");

  const recentInvoices = invoices.slice(0, 3);
  const recentContracts = contracts.slice(0, 3);

  const formatStatus = (status: string) => status.replace(/_/g, " ");

  // Helper to get the correct badge class based on status
  const getInvoiceBadgeClass = (status: string) => {
    if (status === "paid") return "badge-success";
    if (status === "void") return "badge-danger";
    return "badge-warning"; // covers pending, partially_paid, overdue, etc.
  };

  const getContractBadgeClass = (status: string) => {
    if (status === "signed") return "badge-success";
    if (status === "sent") return "badge-primary";
    return "badge-neutral"; // covers draft, cancelled, etc.
  };

  return (
    <SectionCard className="card p-0 overflow-hidden">
      
      {/* Header Bar with Premium Colored Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="flex items-center gap-2.5">
          <FileText size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
          <h3 className="text-[var(--color-ink)] font-semibold text-base tracking-tight">Financials & Docs</h3>
        </div>

        {/* Premium Colored Toggle Switch */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-xs">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "invoices" 
                ? "bg-[var(--color-primary)] text-white shadow-sm" 
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            <FileText size={14} aria-hidden="true" />
            <span>Invoices</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
              activeTab === "invoices" ? "bg-white/20 text-white" : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
            }`}>
              {invoices.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "contracts" 
                ? "bg-[var(--color-primary)] text-white shadow-sm" 
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            <FileSignature size={14} aria-hidden="true" />
            <span>Contracts</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
              activeTab === "contracts" ? "bg-white/20 text-white" : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
            }`}>
              {contracts.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        
        {/* INVOICES LIST */}
        {activeTab === "invoices" && (
          recentInvoices.length > 0 ? (
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-3 py-2 border-b border-[var(--color-surface-border)]/50">
                <div className="col-span-3 label">Invoice Ref</div>
                <div className="col-span-2 label">Due Date</div>
                <div className="col-span-3 label">Amount</div>
                <div className="col-span-3 label">Status</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Rows */}
              {recentInvoices.map((inv) => (
                <div 
                  key={inv.id} 
                  className="grid grid-cols-12 gap-4 px-3 py-3 items-center rounded-xl bg-[var(--color-surface-hover)]/30 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all group"
                >
                  {/* Invoice Ref */}
                  <div className="col-span-3 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
                      <FileText size={14} aria-hidden="true" />
                    </div>
                    <span className="font-mono font-medium text-[var(--color-ink)] truncate">
                      {inv.invoice_number}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div className="col-span-2 text-[var(--color-ink)] text-sm">
                    {new Date(inv.due_date).toLocaleDateString()}
                  </div>

                  {/* Amount */}
                  <div className="col-span-3 text-[var(--color-ink)] text-sm font-medium">
                    <span className="text-[var(--color-ink-muted)] text-xs mr-1">{inv.currency_code}</span>
                    {Number(inv.amount_due).toLocaleString()}
                  </div>

                  {/* Status Pill */}
                  <div className="col-span-3">
                    <span className={`badge before:content-none ${getInvoiceBadgeClass(inv.status)}`}>
                      <span className="capitalize">{formatStatus(inv.status)}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onAction("invoice", "copy", inv.id)}
                      className="btn btn-sm btn-ghost text-[var(--color-ink-muted)] hover:text-[var(--color-primary)]"
                      title="Copy Share Link"
                    >
                      <Copy size={14} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => onAction("invoice", "download", inv.id)}
                      className="btn btn-sm btn-ghost text-[var(--color-ink-muted)] hover:text-emerald-500"
                      title="Download PDF"
                    >
                      <Download size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[var(--color-ink)] font-semibold text-base mb-1">No Invoices Found</p>
              <p className="text-[var(--color-ink-muted)] text-sm">
                Invoices for this client will appear here.
              </p>
            </div>
          )
        )}

        {/* CONTRACTS LIST */}
        {activeTab === "contracts" && (
          recentContracts.length > 0 ? (
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-3 py-2 border-b border-[var(--color-surface-border)]/50">
                <div className="col-span-4 label">Booking Ref</div>
                <div className="col-span-4 label">Start Date</div>
                <div className="col-span-3 label">Status</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Rows */}
              {recentContracts.map((contract) => (
                <div 
                  key={contract.id} 
                  className="grid grid-cols-12 gap-4 px-3 py-3 items-center rounded-xl bg-[var(--color-surface-hover)]/30 border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/30 transition-all group"
                >
                  {/* Booking Ref */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                      <FileSignature size={14} aria-hidden="true" />
                    </div>
                    <span className="font-mono font-medium text-[var(--color-ink)] truncate">
                      {contract.booking_number || `BK-${contract.booking_id}`}
                    </span>
                  </div>

                  {/* Start Date */}
                  <div className="col-span-4 text-[var(--color-ink)] text-sm">
                    {new Date(contract.start_date || contract.created_at).toLocaleDateString()}
                  </div>

                  {/* Status Pill */}
                  <div className="col-span-3">
                    <span className={`badge before:content-none ${getContractBadgeClass(contract.status)}`}>
                      <span className="capitalize">{formatStatus(contract.status)}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onAction("contract", "copy", contract.id)}
                      className="btn btn-sm btn-ghost text-[var(--color-ink-muted)] hover:text-[var(--color-primary)]"
                      title="Copy Share Link"
                    >
                      <Copy size={14} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => onAction("contract", "download", contract.id)}
                      className="btn btn-sm btn-ghost text-[var(--color-ink-muted)] hover:text-emerald-500"
                      title="Download PDF"
                    >
                      <Download size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-[var(--color-ink)] font-semibold text-base mb-1">No Contracts Found</p>
              <p className="text-[var(--color-ink-muted)] text-sm">
                Active agreements for this client will appear here.
              </p>
            </div>
          )
        )}

      </div>
    </SectionCard>
  );
}

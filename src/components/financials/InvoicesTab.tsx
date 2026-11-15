"use client";

import { useState, useEffect, useCallback } from "react";
import { MagnifyingGlass as Search, FileText, Funnel as Filter, Signature as FileSignature } from "@phosphor-icons/react/ssr";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { useInvoices } from "@/hooks/financials/useInvoices";
import InvoicesTable from "./invoices/InvoicesTable";
import RecordPaymentModal from "./invoices/RecordPaymentModal";
import CreateInvoiceModal from "./invoices/CreateInvoiceModal";
import type { Invoice, InvoiceStatus } from "@/lib/types";

export default function InvoicesTab() {
  const {
    filteredInvoices,    // ✅ Used for mobile and metrics
    paginatedInvoices,   // ✅ Used for desktop table
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    handleDownload,
    handleCopyLink,
    handleVoid,
    refetch
  } = useInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // ✅ FRESHNESS: refetch on window focus (cross-tab changes)
  useEffect(() => {
    const handleFocus = () => refetch();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetch]);

  // ✅ FRESHNESS: refetch when tab becomes visible (switching browser tabs)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refetch();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [refetch]);

  // ✅ FRESHNESS: wrap void to refetch after mutation
  const voidAndRefetch = useCallback(
    async (invoiceId: number) => {
      await handleVoid(invoiceId);
      await refetch();
    },
    [handleVoid, refetch]
  );

  // ✅ Metrics calculated from the fully filtered list (not paginated)
  const draftCount = filteredInvoices.filter(i => i.status === "draft").length;
  const sentCount = filteredInvoices.filter(i => i.status === "sent").length;
  const paidCount = filteredInvoices.filter(i => i.status === "paid").length;

  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Metrics Breakdown Panel */}
          <div className="hidden sm:flex lg:flex-shrink-0 items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Draft</span>
              <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{draftCount}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Sent</span>
              <span className="text-xs font-bold text-[var(--color-primary-text)] tabular-nums">{sentCount}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Paid</span>
              <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{paidCount}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 sm:w-80">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search invoice..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                />
              </div>

              <FilterDropdown
                filterId="invoice-status"
                label="Status"
                options={[
                  { label: "Draft", value: "draft", count: draftCount },
                  { label: "Sent", value: "sent", count: sentCount },
                  { label: "Partially Paid", value: "partially_paid" },
                  { label: "Paid", value: "paid", count: paidCount },
                  { label: "Overdue", value: "overdue" },
                  { label: "Void", value: "void" },
                ]}
                value={statusFilter === "all" ? null : statusFilter}
                onChange={(value) => setStatusFilter((value || "all") as InvoiceStatus | "all")}
                icon={Filter}
              />
            </div>

            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <FileSignature size={14} weight="bold" aria-hidden="true" />
              Generate Invoice
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-[var(--color-ink-subtle)]" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No invoices found</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || statusFilter !== "all"
                ? "Try adjusting your search query or status filter."
                : "Invoices are now created manually. Click 'Generate Invoice' to create one for an orphaned booking."}
            </p>
          </div>
        ) : (
          <>
            {/* ✅ FIXED: Removed 'allData' prop as it does not exist on InvoicesTableProps */}
            <InvoicesTable 
              data={paginatedInvoices}
              onDownload={handleDownload}
              onCopyLink={handleCopyLink}
              onVoid={voidAndRefetch}
              onRecordPayment={openPaymentModal}
              onCreate={() => setCreateModalOpen(true)} 
            />

            {/* ✅ DESKTOP PAGINATION: Only shows if totalItems > 10 */}
            {totalItems > 10 && (
              <div className="hidden md:flex p-4 border-t border-[var(--color-surface-border)] flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-[var(--color-ink-muted)] text-center sm:text-left">
                  Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} invoices
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-primary)] text-white">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 transition-all active:scale-95"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateInvoiceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refetch}
      />

      <RecordPaymentModal
        invoice={selectedInvoice}
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        onPaymentRecorded={refetch}
      />
    </>
  );
}

// src/app/dashboard/financials/PaymentsTab.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, FileText, Filter, Upload, Calendar } from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { usePayments } from "@/hooks/financials/usePayments";
import PaymentsTable from "./payments/PaymentsTable";
import type { PaymentStatus } from "@/lib/types"; // ✅ FIXED: Added PaymentStatus import

type DateRange = "all" | "today" | "yesterday" | "this_week" | "this_month" | "last_month" | "last_3_months" | "last_6_months" | "last_year";

export default function PaymentsTab() {
  const {
    payments, loading, search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
  } = usePayments();

  const [dateFilter, setDateFilter] = useState<DateRange>("all");

  const pageSize = 7;

  // Helper function to get date range boundaries
  const getDateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case "today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case "yesterday":
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: yesterday, end: today };
      case "this_week":
        const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) };
      case "this_month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      case "last_month":
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: lastMonthStart, end: lastMonthEnd };
      case "last_3_months":
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return { start: threeMonthsAgo, end: now };
      case "last_6_months":
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return { start: sixMonthsAgo, end: now };
      case "last_year":
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear(), 0, 1);
        return { start: lastYearStart, end: lastYearEnd };
      default:
        return null;
    }
  }, [dateFilter]);

  const displayedPayments = useMemo(() => {
    return payments.filter(payment => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        (payment.reference && payment.reference.toLowerCase().includes(searchLower)) ||
        payment.id.toString().includes(searchLower) ||
        payment.invoice_id.toString().includes(searchLower);
      
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      
      // Date filtering
      let matchesDate = true;
      if (dateFilter !== "all" && getDateRange) {
        const paymentDate = new Date(payment.paid_at || payment.created_at);
        matchesDate = paymentDate >= getDateRange.start && paymentDate < getDateRange.end;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, search, statusFilter, dateFilter, getDateRange]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedPayments.slice(start, start + pageSize);
  }, [displayedPayments, currentPage]);

  const totalPages = Math.ceil(displayedPayments.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter, setCurrentPage]);

  // --- Action Handlers ---
  const handleDownloadPdf = (id: number) => {
    console.log(`Download PDF for payment ${id}`);
  };

  const handleIssueRefund = (id: number) => {
    console.log(`Issue refund for payment ${id}`);
  };

  const handleExportSingleCsv = (id: number) => {
    console.log(`Export CSV/Receipt for payment ${id}`);
  };

  const handleExportAllCsv = () => {
    if (displayedPayments.length === 0) return;
    
    const headers = ["ID", "Invoice ID", "Amount", "Currency", "Method", "Reference", "Status", "Date"];
    const rows = displayedPayments.map(p => [
      p.id,
      p.invoice_id,
      p.amount,
      p.currency_code,
      p.method,
      p.reference || "N/A",
      p.status,
      new Date(p.paid_at || p.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        
        {/* Toolbar - DNA matched to Contracts/Clients/Invoices */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          
          {/* Metrics Breakdown Panel - Completed | Pending | Failed (Evenly Distributed) */}
          <div className="flex items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Completed</span>
              <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{payments.filter(p => p.status === "completed").length}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Pending</span>
              <span className="text-xs font-bold text-[var(--color-warning-text)] tabular-nums">{payments.filter(p => p.status === "pending").length}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Failed</span>
              <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{payments.filter(p => p.status === "failed").length}</span>
            </div>
          </div>

          {/* Controls: Search + Date Filter + Status Filter + Export Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 sm:w-80">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ref or invoice ID..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                />
              </div>

              {/* ✅ Reusable FilterDropdown for Date */}
              <FilterDropdown
                filterId="payment-date"
                label="Date"
                options={[
                  { label: "Today", value: "today" },
                  { label: "Yesterday", value: "yesterday" },
                  { label: "This Week", value: "this_week" },
                  { label: "This Month", value: "this_month" },
                  { label: "Last Month", value: "last_month" },
                  { label: "Last 3 Months", value: "last_3_months" },
                  { label: "Last 6 Months", value: "last_6_months" },
                  { label: "Last Year", value: "last_year" },
                ]}
                value={dateFilter === "all" ? null : dateFilter}
                onChange={(value) => setDateFilter((value || "all") as DateRange)}
                icon={Calendar}
              />

              {/* ✅ Reusable FilterDropdown for Status */}
              <FilterDropdown
                filterId="payment-status"
                label="Status"
                options={[
                  { label: "Completed", value: "completed" },
                  { label: "Pending", value: "pending" },
                  { label: "Failed", value: "failed" },
                ]}
                value={statusFilter === "all" ? null : statusFilter}
                onChange={(value) => setStatusFilter((value || "all") as PaymentStatus | "all")}
                icon={Filter}
              />
            </div>

            {/* Export CSV Button */}
            <button 
              onClick={handleExportAllCsv}
              disabled={displayedPayments.length === 0}
              className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer touch-manipulation active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export All to CSV"
            >
              <Upload size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Content Area - Edge-to-edge table */}
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
            Loading payments...
          </div>
        ) : displayedPayments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <FileText size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No payments found</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              {search || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters."
                : "Payment transactions will appear here once recorded."}
            </p>
          </div>
        ) : (
          <>
            {/* ✅ EDGE-TO-EDGE TABLE: No p-4 wrapper */}
            <PaymentsTable 
              data={paginatedPayments}
              onExportCsv={handleExportSingleCsv}
              onDownloadPdf={handleDownloadPdf}
              onIssueRefund={handleIssueRefund}
            />
            
            {/* Pagination Footer */}
            <div className="hidden md:flex p-4 border-t border-[var(--color-surface-border)] flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-[var(--color-ink-muted)] text-center sm:text-left">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, displayedPayments.length)} of {displayedPayments.length} payments
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
          </>
        )}
      </div>
    </>
  );
}
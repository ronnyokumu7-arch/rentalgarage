// src/components/financials/PaymentsTab.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search, FileText, Filter, Upload, Calendar, X, SlidersHorizontal,
} from "lucide-react";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { usePayments } from "@/hooks/financials/usePayments";
import PaymentsTable from "./payments/PaymentsTable";
import type { PaymentStatus } from "@/lib/types";

type DateRange =
  | "all" | "today" | "yesterday" | "this_week" | "this_month"
  | "last_month" | "last_3_months" | "last_6_months" | "last_year";

const DATE_OPTIONS: { label: string; value: string }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "Last 3 Months", value: "last_3_months" },
  { label: "Last 6 Months", value: "last_6_months" },
  { label: "Last Year", value: "last_year" },
];

/* ✅ Short labels for mobile pills */
const DATE_PILLS: { label: string; value: DateRange }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "3 Months", value: "last_3_months" },
  { label: "6 Months", value: "last_6_months" },
  { label: "Last Year", value: "last_year" },
];

/* ✅ Shared pill styling — identical DNA to Fleet/Bookings/Clients */
const pillClass = (isActive: boolean) =>
  `flex-shrink-0 h-8 px-4 rounded-full text-[11px] font-bold transition-colors border ${
    isActive
      ? "text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-primary)]/5"
      : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
  }`;

export default function PaymentsTab() {
  const {
    payments, loading, search, setSearch,
    statusFilter, setStatusFilter,
    currentPage, setCurrentPage,
  } = usePayments();

  const [dateFilter, setDateFilter] = useState<DateRange>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const pageSize = 7;

  const getDateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case "today":
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case "yesterday": {
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: yesterday, end: today };
      }
      case "this_week": {
        const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) };
      }
      case "this_month": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      }
      case "last_month": {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: lastMonthStart, end: lastMonthEnd };
      }
      case "last_3_months": {
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return { start: threeMonthsAgo, end: now };
      }
      case "last_6_months": {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        return { start: sixMonthsAgo, end: now };
      }
      case "last_year": {
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear(), 0, 1);
        return { start: lastYearStart, end: lastYearEnd };
      }
      default:
        return null;
    }
  }, [dateFilter]);

  const displayedPayments = useMemo(() => {
    return payments.filter((payment) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (payment.reference && payment.reference.toLowerCase().includes(searchLower)) ||
        payment.id.toString().includes(searchLower) ||
        payment.invoice_id.toString().includes(searchLower);

      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;

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

  const totalPages = Math.ceil(displayedPayments.length / pageSize) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter, setCurrentPage]);

  const hasActiveFilter = statusFilter !== "all" || dateFilter !== "all";

  const statusOptions = useMemo(
    () => [
      { label: "Completed", value: "completed", count: payments.filter((p) => p.status === "completed").length },
      { label: "Pending", value: "pending", count: payments.filter((p) => p.status === "pending").length },
      { label: "Failed", value: "failed", count: payments.filter((p) => p.status === "failed").length },
    ],
    [payments],
  );

  const clearAllFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
  };

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
    const rows = displayedPayments.map((p) => [
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
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payments_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* ────────────────────────────────────────────────────────────
          MOBILE — Seamless edge-to-edge (Fleet/Bookings DNA)
      ──────────────────────────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Sticky Toolbar — triple-sealed against the gap */}
        <div className="sticky top-0 z-30 bg-[var(--color-bg)] py-2 shadow-[0_-32px_0_0_var(--color-bg)]">
          <div
            className="absolute inset-x-0 -top-24 h-24 bg-[var(--color-bg)] pointer-events-none"
            aria-hidden="true"
          />

          <div className="px-0">
            <div className="space-y-2">
              {/* Search bar + single embedded filter toggle */}
              <div className="flex items-center h-11 rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] overflow-hidden transition-colors mx-0">
                <div className="relative flex-1 h-full">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ref or invoice ID..."
                    className="w-full h-full pl-10 pr-2 bg-transparent text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] outline-none"
                  />
                  {search && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center hover:bg-[var(--color-surface-border)] transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={12} className="text-[var(--color-ink-muted)]" />
                    </button>
                  )}
                </div>

                <div className="pr-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiltersOpen((v) => !v);
                    }}
                    aria-label={filtersOpen ? "Hide filters" : "Show filters"}
                    aria-expanded={filtersOpen}
                    className={`relative h-8 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 ${
                      filtersOpen
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : hasActiveFilter
                          ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15"
                          : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    {hasActiveFilter && !filtersOpen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                    )}
                  </button>
                </div>
              </div>

              {/* ✅ SINGLE MIXED PILL ROW — status + date in one scrollable line */}
              {filtersOpen && (
                <div className="relative animate-in slide-in-from-top-1 fade-in duration-200">
                  <div className="overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-2 py-1 px-3 pr-6">
                      {/* All — resets both dimensions */}
                      <button
                        onClick={clearAllFilters}
                        className={pillClass(!hasActiveFilter)}
                      >
                        All
                      </button>

                      {/* Status pills */}
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setStatusFilter(opt.value as PaymentStatus)}
                          className={pillClass(statusFilter === opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}

                      {/* Subtle group divider */}
                      <div
                        className="w-px h-4 bg-[var(--color-surface-border)] flex-shrink-0 mx-1"
                        aria-hidden="true"
                      />

                      {/* Date pills */}
                      {DATE_PILLS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setDateFilter(opt.value)}
                          className={pillClass(dateFilter === opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}

                      {/* Clear pill — appears only when a filter is active */}
                      {hasActiveFilter && (
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="flex-shrink-0 h-8 px-3 rounded-full text-[11px] font-bold flex items-center gap-1 text-[var(--color-primary)] border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/15 transition-colors active:scale-95"
                        >
                          <X size={11} strokeWidth={3} />
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Gradient fade at the right edge */}
                  <div
                    className="pointer-events-none absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent"
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Export CSV */}
              <button
                onClick={handleExportAllCsv}
                disabled={displayedPayments.length === 0}
                className="w-full h-10 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <Upload size={14} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Payments List — full filtered list on mobile */}
        <div className="pb-4">
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
                {search || hasActiveFilter
                  ? "Try adjusting your search or filters."
                  : "Payment transactions will appear here once recorded."}
              </p>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <PaymentsTable
              data={displayedPayments}
              onExportCsv={handleExportSingleCsv}
              onDownloadPdf={handleDownloadPdf}
              onIssueRefund={handleIssueRefund}
            />
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          DESKTOP — Original card chrome layout (dropdowns retained)
      ──────────────────────────────────────────────────────────── */}
      <div className="hidden md:block bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Desktop Toolbar */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="hidden sm:flex items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Completed</span>
              <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">
                {payments.filter((p) => p.status === "completed").length}
              </span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Pending</span>
              <span className="text-xs font-bold text-[var(--color-warning-text)] tabular-nums">
                {payments.filter((p) => p.status === "pending").length}
              </span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center gap-2 whitespace-nowrap flex-1 min-w-0">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Failed</span>
              <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">
                {payments.filter((p) => p.status === "failed").length}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 sm:w-80">
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

              <FilterDropdown
                filterId="payment-date"
                label="Date"
                options={DATE_OPTIONS}
                value={dateFilter === "all" ? null : dateFilter}
                onChange={(value) => setDateFilter((value || "all") as DateRange)}
                icon={Calendar}
              />

              <FilterDropdown
                filterId="payment-status"
                label="Status"
                options={statusOptions}
                value={statusFilter === "all" ? null : statusFilter}
                onChange={(value) => setStatusFilter((value || "all") as PaymentStatus | "all")}
                icon={Filter}
              />
            </div>

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

        {/* Desktop Content */}
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
              {search || hasActiveFilter
                ? "Try adjusting your search or filters."
                : "Payment transactions will appear here once recorded."}
            </p>
          </div>
        ) : (
          <>
            <PaymentsTable
              data={paginatedPayments}
              onExportCsv={handleExportSingleCsv}
              onDownloadPdf={handleDownloadPdf}
              onIssueRefund={handleIssueRefund}
            />

            {/* Pagination Footer */}
            <div className="flex p-4 border-t border-[var(--color-surface-border)] flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-[var(--color-ink-muted)] text-center sm:text-left">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, displayedPayments.length)} of{" "}
                {displayedPayments.length} payments
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

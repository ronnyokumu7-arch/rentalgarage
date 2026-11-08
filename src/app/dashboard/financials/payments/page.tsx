"use client";
import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DollarSign, CreditCard, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { paymentsApi } from "@/lib/api/payments";
import { invoicesApi } from "@/lib/api/invoices";
import type { Payment, Invoice } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import TableToolbar from "@/components/ui/TableToolbar";
import Badge from "@/components/ui/Badge";

const PAYMENT_FILTER_OPTIONS = [
  { value: "mpesa", label: "M-Pesa" },
  { value: "manual", label: "Manual / Cash" },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsData, invoicesData] = await Promise.all([
        paymentsApi.list(),
        invoicesApi.list(),
      ]);
      setPayments(paymentsData);
      setInvoices(invoicesData);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Map invoice_id to invoice_number for cleaner display
  const invoiceMap = useMemo(() => {
    const map = new Map<number, string>();
    invoices.forEach((inv) => map.set(inv.id, inv.invoice_number));
    return map;
  }, [invoices]);

  const filteredPayments = useMemo(() => {
    let result = payments;
    if (methodFilter) result = result.filter((p) => p.method === methodFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.reference?.toLowerCase().includes(q) || p.id.toString().includes(q));
    }
    return result;
  }, [payments, methodFilter, search]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, methodFilter]);

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "reference",
      header: "Payment Details",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            {row.original.method === "mpesa" ? <Smartphone size={16} className="text-emerald-600" /> : <CreditCard size={16} className="text-emerald-600" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate">{row.original.reference || `Payment #${row.original.id}`}</p>
            <p className="text-xs text-ink-muted">Invoice #{invoiceMap.get(row.original.invoice_id) || row.original.invoice_id}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-sm font-bold text-ink">
          {row.original.currency_code} {Number(row.original.amount).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => (
        <Badge variant={row.original.method === "mpesa" ? "success" : "neutral"} size="xs">
          {row.original.method.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "completed" ? "success" : status === "failed" ? "danger" : "warning";
        return <Badge variant={variant} size="xs">{status.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: "paid_at",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-ink-muted">
          {row.original.paid_at ? new Date(row.original.paid_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Record and manage payment transactions"
        icon={DollarSign}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Financials", href: "/dashboard/financials" }, { label: "Payments" }]}
      />
      <SectionCard padding={false}>
        <TableToolbar
          viewMode="active"
          onViewModeChange={() => {}}
          activeCount={payments.length}
          vaultCount={0}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search reference or ID..."
          filterValue={methodFilter}
          onFilterChange={setMethodFilter}
          filterOptions={PAYMENT_FILTER_OPTIONS}
          filterPlaceholder="All Methods"
        />

        {loading ? (
          <div className="p-12 text-center text-ink-muted">Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <EmptyState icon={DollarSign} title="No payments found" description="Payments will appear here once recorded against invoices." />
        ) : (
          <>
            <DataTable data={paginatedPayments} columns={columns} />
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredPayments.length} pageSize={pageSize} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </div>
  );
}

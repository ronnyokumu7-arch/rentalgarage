"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Eye, Send, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { invoicesApi } from "@/lib/api/invoices";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import TableToolbar from "@/components/ui/TableToolbar";
import Badge from "@/components/ui/Badge";

const INVOICE_FILTER_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "void", label: "Voided" },
];

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await invoicesApi.list();
      setInvoices(data);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleSendInvoice = async (id: number) => {
    try {
      await invoicesApi.update(id, { status: "sent" as InvoiceStatus });
      toast.success("Invoice marked as sent!");
      fetchInvoices();
    } catch {
      toast.error("Failed to update invoice");
    }
  };

  const filteredInvoices = useMemo(() => {
    let result = invoices;
    if (statusFilter) result = result.filter((i) => i.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.invoice_number.toLowerCase().includes(q) || i.id.toString().includes(q));
    }
    return result;
  }, [invoices, statusFilter, search]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoice_number",
      header: "Invoice",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate">#{row.original.invoice_number}</p>
            <p className="text-xs text-ink-muted">Due {new Date(row.original.due_date).toLocaleDateString()}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount_due",
      header: "Amount",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-ink">KES {Number(row.original.amount_due).toLocaleString()}</span>
          <span className="text-xs text-ink-muted">Paid: KES {Number(row.original.amount_paid).toLocaleString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "paid" ? "success" : status === "overdue" ? "danger" : status === "void" ? "neutral" : "warning";
        return <Badge variant={variant} size="xs">{status.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: "actions",
      header: " ",
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex items-center gap-1">
            {inv.status === "draft" && (
              <button onClick={() => handleSendInvoice(inv.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Send Invoice">
                <Send size={14} />
              </button>
            )}
            {inv.status !== "paid" && inv.status !== "void" && (
              <button onClick={() => router.push(`/dashboard/financials/payments?invoice_id=${inv.id}`)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Record Payment">
                <DollarSign size={14} />
              </button>
            )}
            <button onClick={() => router.push(`/dashboard/financials/invoices/${inv.id}`)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors" title="View Details">
              <Eye size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Manage billing, track payments, and update invoice status"
        icon={FileText}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Financials", href: "/dashboard/financials" }, { label: "Invoices" }]}
      />
      <SectionCard padding={false}>
        <TableToolbar
          viewMode="active"
          onViewModeChange={() => {}}
          activeCount={invoices.length}
          vaultCount={0}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search invoice #..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={INVOICE_FILTER_OPTIONS}
          filterPlaceholder="All Statuses"
        />

        {loading ? (
          <div className="p-12 text-center text-ink-muted">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState icon={FileText} title="No invoices found" description="Invoices are automatically generated when you create a booking." />
        ) : (
          <>
            <DataTable data={paginatedInvoices} columns={columns} />
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredInvoices.length} pageSize={pageSize} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </div>
  );
}

"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { FileText, Download, Send, Link, X, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { contractsApi } from "@/lib/api/contracts";
import type { Contract, ContractStatus } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import TableToolbar from "@/components/ui/TableToolbar";
import Badge from "@/components/ui/Badge";

const CONTRACT_FILTER_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "signed", label: "Signed" },
  { value: "void", label: "Voided" },
];

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const data = await contractsApi.list();
      setContracts(data);
    } catch {
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(); }, []);

  const handleSendToClient = async (id: number) => {
    try {
      await contractsApi.sendToClient(id);
      toast.success("Contract sent to client successfully!");
      fetchContracts();
    } catch {
      toast.error("Failed to send contract. Ensure client has an email.");
    }
  };

  const handleCopyLink = async (id: number) => {
    try {
      const { share_url } = await contractsApi.generateShareLink(id);
      navigator.clipboard.writeText(share_url);
      toast.success("Share link copied to clipboard!");
    } catch {
      toast.error("Failed to generate share link");
    }
  };

  const handleVoid = async (id: number) => {
    if (!confirm("Are you sure you want to void this contract?")) return;
    try {
      await contractsApi.void(id);
      toast.success("Contract voided successfully");
      fetchContracts();
    } catch {
      toast.error("Failed to void contract");
    }
  };

  const filteredContracts = useMemo(() => {
    let result = contracts;
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.contract_number.toLowerCase().includes(q) || c.id.toString().includes(q));
    }
    return result;
  }, [contracts, statusFilter, search]);

  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search, statusFilter]);

  const columns: ColumnDef<Contract>[] = [
    {
      accessorKey: "contract_number",
      header: "Contract",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate">#{row.original.contract_number}</p>
            <p className="text-xs text-ink-muted">Booking #{row.original.booking_id}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === "signed" ? "success" : status === "void" ? "danger" : status === "sent" ? "accent" : "warning";
        return <Badge variant={variant} size="xs">{status.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: "signed_at",
      header: "Signed Date",
      cell: ({ row }) => (
        <span className="text-sm text-ink-muted">
          {row.original.signed_at ? new Date(row.original.signed_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: " ",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-1">
            <button onClick={() => router.push(`/contracts/view/${c.share_token}`)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors" title="View Public Link">
              <Eye size={14} />
            </button>
            {c.status === "draft" && (
              <>
                <button onClick={() => handleSendToClient(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Send to Client">
                  <Send size={14} />
                </button>
                <button onClick={() => handleVoid(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors" title="Void Contract">
                  <X size={14} />
                </button>
              </>
            )}
            {(c.status === "sent" || c.status === "signed") && (
              <button onClick={() => handleCopyLink(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors" title="Copy Share Link">
                <Link size={14} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle="Manage rental agreements and digital signatures"
        icon={FileText}
        breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Financials", href: "/dashboard/financials" }, { label: "Contracts" }]}
      />
      <SectionCard padding={false}>
        <TableToolbar
          viewMode="active"
          onViewModeChange={() => {}}
          activeCount={contracts.length}
          vaultCount={0}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search contract #..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={CONTRACT_FILTER_OPTIONS}
          filterPlaceholder="All Statuses"
        />

        {loading ? (
          <div className="p-12 text-center text-ink-muted">Loading contracts...</div>
        ) : filteredContracts.length === 0 ? (
          <EmptyState icon={FileText} title="No contracts found" description="Contracts are automatically generated when you create a booking." />
        ) : (
          <>
            <DataTable data={paginatedContracts} columns={columns} />
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredContracts.length} pageSize={pageSize} onPageChange={setCurrentPage} />
          </>
        )}
      </SectionCard>
    </div>
  );
}

"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import {
  Users,
  Plus,
  Mail,
  Phone,
  User,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
// API & Types
import { clientsApi } from "@/lib/api/clients";
import type { Client } from "@/lib/types";
// UI Components
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { ClientStatusBadge } from "@/components/ui/Badge";
import TableToolbar from "@/components/ui/TableToolbar";
import ActionButtons from "@/components/ui/ActionButtons";

type ViewMode = "active" | "vault";

const CLIENT_FILTER_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

export default function ClientsPage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("active");

  // UI State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ── Data Fetching ──────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        view === "active"
          ? await clientsApi.list()
          : await clientsApi.listArchived();
      setClients(data);
    } catch (error) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // ── Client-side Filtering & Pagination ─────────────────────────────────
  const filteredClients = useMemo(() => {
    let result = clients;

    if (view === "active" && statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.id_number?.toLowerCase().includes(q) ||
          c.dl_number?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [clients, view, statusFilter, search]);

  const totalPages = Math.ceil(filteredClients.length / pageSize);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, view]);

  // ── Table Columns ──────────────────────────────────────────────────────
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "full_name",
      header: "Client",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Fallback */}
            {c.avatar_image ? (
              <Image
                src={c.avatar_image}
                alt={c.full_name}
                width={36}
                height={36}
                unoptimized
                className="w-9 h-9 rounded-full object-cover border border-surface-border shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-surface-hover border border-surface-border flex items-center justify-center text-ink-subtle">
                <User size={16} />
              </div>
            )}
            <div className="min-w-0">
              {/* Name */}
              <p className="text-sm font-semibold text-ink truncate">
                {c.full_name}
              </p>
              {/* Email with Icon (Moved to second row) */}
              {c.email ? (
                <a
                  href={`mailto:${c.email}`}
                  className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-dark transition-colors truncate"
                  title={`Email: ${c.email}`}
                >
                  <Mail size={12} className="text-ink-subtle flex-shrink-0" />
                  <span className="truncate">{c.email}</span>
                </a>
              ) : (
                <p className="text-xs text-ink-muted truncate">No email provided</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Contact",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-2 text-sm text-ink">
            <Phone size={12} className="text-ink-subtle" />
            <span className="font-medium">{c.phone}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "id_number",
      header: "National ID",
      cell: ({ row }) => {
        const c = row.original;
        if (!c.id_number) {
          return (
            <span className="text-sm text-ink-subtle italic">
              Not provided
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-hover border border-surface-border flex items-center justify-center text-ink-muted flex-shrink-0">
              <CreditCard size={14} />
            </div>
            <span className="text-sm font-semibold text-ink tracking-wide">
              {c.id_number}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "dl_number",
      header: "Driver's License",
      cell: ({ row }) => {
        const c = row.original;
        if (!c.dl_number) {
          return (
            <span className="text-sm text-ink-subtle italic">
              Not provided
            </span>
          );
        }

        // Calculate health status based on DL expiry
        let color = "bg-ink-subtle";
        let labelBg = "bg-surface-hover";
        let labelText = "text-ink-muted";
        let healthLabel = "No expiry set";

        if (c.dl_expiry) {
          const expiryDate = new Date(c.dl_expiry);
          const today = new Date();
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilExpiry < 0) {
            color = "bg-danger";
            labelBg = "bg-danger-bg";
            labelText = "text-danger-text";
            healthLabel = "Expired";
          } else if (daysUntilExpiry < 30) {
            color = "bg-danger";
            labelBg = "bg-danger-bg";
            labelText = "text-danger-text";
            healthLabel = `${daysUntilExpiry}d left`;
          } else if (daysUntilExpiry < 60) {
            color = "bg-warning";
            labelBg = "bg-warning-bg";
            labelText = "text-warning-text";
            healthLabel = `${daysUntilExpiry}d left`;
          } else {
            color = "bg-success";
            labelBg = "bg-success-bg";
            labelText = "text-success-text";
            healthLabel = `${daysUntilExpiry}d left`;
          }
        }

        return (
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">
                {c.dl_number}
              </p>
              <p className="text-xs text-ink-muted">
                {c.dl_expiry
                  ? new Date(c.dl_expiry).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "No expiry"}
              </p>
            </div>
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${labelBg} ${labelText} flex items-center gap-1.5`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
              {healthLabel}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const c = row.original;
        if (c.is_archived)
          return (
            <span className="text-xs text-ink-subtle italic">Archived</span>
          );
        return <ClientStatusBadge status={c.status} />;
      },
    },
    {
      id: "actions",
      header: "Manage",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/clients/${c.id}`);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="View Client"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Manage your client database and relationships"
        icon={Users}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Clients" },
        ]}
        actions={
          view === "active"
            ? [
                {
                  label: "New Client",
                  icon: Plus,
                  variant: "primary",
                  onClick: () => router.push("/dashboard/clients/new"),
                },
              ]
            : []
        }
      />
      <SectionCard padding={false}>
        {/* Unified Toolbar */}
        <TableToolbar
          viewMode={view}
          onViewModeChange={setView}
          activeCount={clients.filter((c) => !c.is_archived).length}
          vaultCount={clients.filter((c) => c.is_archived).length}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, email, phone, ID..."
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={CLIENT_FILTER_OPTIONS}
          filterPlaceholder="All Statuses"
        />

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-ink-muted">
            Loading clients...
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              view === "active" ? "No clients found" : "No archived clients"
            }
            description={
              search || statusFilter
                ? "Try adjusting your search or filters."
                : view === "active"
                ? "Get started by adding your first client."
                : "Archived clients will appear here."
            }
            action={
              view === "active" && !search && !statusFilter ? (
                <button
                  className="btn btn-primary"
                  onClick={() => router.push("/dashboard/clients/new")}
                >
                  <Plus size={16} /> Add Client
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <DataTable
              data={paginatedClients}
              columns={columns}
              onRowClick={(client) =>
                router.push(`/dashboard/clients/${client.id}`)
              }
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </SectionCard>
    </div>
  );
}

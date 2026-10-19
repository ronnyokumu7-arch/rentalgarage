// src/components/client/DesktopClientsList.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  Mail,
  Phone,
  User as UserIcon,
  Archive,
  Filter,
  Shield,
  ShieldAlert,
  Loader2,
  Search,
  ArrowRight,
  Car,
  Clock,
  MessageCircle,
  PhoneCall,
} from "lucide-react";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import FilterDropdown from "@/components/ui/FilterDropdown";
import AddClientButton from "@/components/client/AddClientButton";
import SecureImage from "@/components/ui/SecureImage";
import ReviewVerificationModal from "@/components/client/ReviewVerificationModal";
import { useState } from "react";

/* ──────────────────────────────────────────────────────────────────────
   Shared config
────────────────────────────────────────────────────────────────────── */

const CLIENT_STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:    { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", label: "Active" },
  pending:   { bg: "bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400",     dot: "bg-amber-500",   label: "Pending" },
  suspended: { bg: "bg-red-500/10",     text: "text-red-600 dark:text-red-400",         dot: "bg-red-500",     label: "Suspended" },
  inactive:  { bg: "bg-gray-500/10",    text: "text-gray-600 dark:text-gray-400",       dot: "bg-gray-500",    label: "Inactive" },
};

const ARRANGEMENT_LABELS: Record<string, string> = {
  self_drive: "Self Drive",
  own_driver: "Own Driver",
  chauffeur:  "Chauffeur",
};

const getWhatsAppNumber = (rawPhone?: string | null): string | null => {
  if (!rawPhone) return null;
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  return digits;
};

/* ──────────────────────────────────────────────────────────────────────
   Props
────────────────────────────────────────────────────────────────────── */

interface DesktopClientsListProps {
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  statusOptions: { label: string; value: string; count: number }[];
  filteredClients: any[];
  paginatedClients: any[];
  pendingClients: number;
  clientMetrics: { total: number; active: number; inactive: number };
  currentPage: number;
  setCurrentPage: (p: number) => void;
  totalPages: number;
  pageSize: number;
  handleVerify: (id: number) => void;
  handleReactivate: (id: number) => void;
  handleArchive: (id: number) => void;
  refetch: () => void;
  // ✅ NEW: caller provides the modal opener
  onAddClient: () => void;
}

export default function DesktopClientsList({
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
  filteredClients,
  paginatedClients,
  pendingClients,
  clientMetrics,
  currentPage,
  setCurrentPage,
  totalPages,
  pageSize,
  handleVerify,
  handleReactivate,
  handleArchive,
  refetch,
  onAddClient,
}: DesktopClientsListProps) {
  const router = useRouter();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewClientId, setReviewClientId] = useState<number | null>(null);

  const getClientActions = (client: any): RowAction<any>[] =>
    [
      {
        label: "View Full Profile",
        icon: UserIcon,
        onClick: () => router.push(`/dashboard/clients/${client.id}`),
      },
      {
        label: "Call Client",
        icon: PhoneCall,
        onClick: () => {
          const phone = client.phone || "";
          if (phone) window.location.href = `tel:${phone.replace(/\s/g, "")}`;
        },
        disabled: !client.phone,
      },
      {
        label: "WhatsApp Chat",
        icon: MessageCircle,
        onClick: () => {
          const wa = getWhatsAppNumber(client.phone);
          if (wa) window.open(`https://wa.me/${wa}`, "_blank", "noopener,noreferrer");
        },
        disabled: !getWhatsAppNumber(client.phone),
      },
      {
        label:
          client.verification_status === "under_review"
            ? "Review Verification"
            : client.verification_status === "rejected" || client.status === "pending"
              ? "Start Verification"
              : "Suspend Client",
        icon: client.verification_status === "under_review" ? Clock : Shield,
        variant:
          client.verification_status === "under_review" ||
          client.verification_status === "rejected" ||
          client.status === "pending"
            ? "primary"
            : "default",
        separator: true,
        onClick: () => {
          if (client.verification_status === "under_review") {
            setReviewClientId(client.id);
            setReviewModalOpen(true);
          } else {
            handleVerify(client.id);
          }
        },
        disabled:
          client.status !== "pending" &&
          client.status !== "active" &&
          client.verification_status !== "rejected" &&
          client.verification_status !== "under_review",
      },
      {
        label: client.status === "suspended" ? "Reactivate Client" : undefined,
        icon: Shield,
        variant: "primary",
        onClick: () => handleReactivate(client.id),
        disabled: client.status !== "suspended",
      },
      {
        label: "Archive Client",
        icon: Archive,
        variant: "danger",
        separator: true,
        onClick: () => handleArchive(client.id),
      },
    ].filter((action) => !!action.label) as RowAction<any>[];

  return (
    <>
      <div className="hidden md:block bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
        {/* Toolbar */}
        <div className="flex p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
          <div className="hidden sm:flex items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
            <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Clients</span>
              <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{clientMetrics.total}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Active</span>
              <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{clientMetrics.active}</span>
            </div>
            <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
            <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
              <span className="text-xs font-medium text-[var(--color-ink-muted)]">Inactive</span>
              <span className="text-xs font-bold text-[var(--color-danger-text)] tabular-nums">{clientMetrics.inactive}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
            <div className="flex items-center gap-2 flex-1 sm:w-80">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                />
              </div>
              <FilterDropdown
                filterId="client-status"
                label="Status"
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                icon={Filter}
              />
            </div>
            {/* ✅ Pass onClick through to the button */}
            <AddClientButton onClick={onAddClient} />
          </div>
        </div>

        {/* Pending banner */}
        {!loading && pendingClients > 0 && statusFilter !== "pending" && (
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 transition-colors text-sm font-semibold"
          >
            <ShieldAlert size={16} />
            {pendingClients} {pendingClients === 1 ? "client" : "clients"} awaiting your review
            <ArrowRight size={14} className="opacity-70" />
          </button>
        )}

        {!loading && statusFilter === "pending" && (
          <div className="w-full flex items-center justify-between px-4 py-3 bg-blue-500/10 border-b border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Filter size={14} />
              Viewing {filteredClients.length} pending {filteredClients.length === 1 ? "client" : "clients"}
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter(null)}
              className="text-xs font-bold px-2 py-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
            >
              Clear Filter
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading clients...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No clients found</h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <DataTable
            data={paginatedClients}
            columns={[
              {
                header: "Client",
                accessorKey: "full_name",
                cell: ({ row }) => {
                  const client = row.original as any;
                  return (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0 overflow-hidden">
                        <SecureImage
                          src={client.avatar_image}
                          alt={client.full_name}
                          className="w-full h-full object-cover"
                          fallback={<UserIcon size={16} />}
                        />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/clients/${client.id}`);
                            }}
                            className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
                          >
                            {client.full_name}
                          </button>
                        </div>
                        {client.email ? (
                          <a
                            href={`mailto:${client.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate mt-0.5"
                          >
                            <Mail size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </a>
                        ) : (
                          <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">No email</p>
                        )}
                      </div>
                    </div>
                  );
                },
              },
              {
                header: "Contact",
                accessorKey: "phone",
                cell: ({ row }) => (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                    <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                    <span className="font-medium">{row.original.phone}</span>
                  </div>
                ),
              },
              {
                header: "National ID",
                accessorKey: "id_number",
                cell: ({ row }) =>
                  row.original.id_number ? (
                    <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">
                      {row.original.id_number}
                    </span>
                  ) : (
                    <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>
                  ),
              },
              {
                header: "Arrangement",
                accessorKey: "driving_arrangement",
                cell: ({ row }) => {
                  const client = row.original as any;
                  const arr = client.driving_arrangement || "self_drive";
                  return (
                    <div className="flex items-center gap-1.5 text-sm text-[var(--color-ink)]">
                      <Car size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                      <span className="font-medium">{ARRANGEMENT_LABELS[arr] || arr}</span>
                    </div>
                  );
                },
              },
              {
                header: "Driving License",
                accessorKey: "dl_number",
                cell: ({ row }) =>
                  row.original.dl_number ? (
                    <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">
                      {row.original.dl_number}
                    </span>
                  ) : (
                    <span className="text-sm text-[var(--color-ink-subtle)] italic">Not provided</span>
                  ),
              },
              {
                header: "Status",
                accessorKey: "status",
                cell: ({ row }) => {
                  const client = row.original as any;
                  const style = CLIENT_STATUS_STYLES[client.status] || CLIENT_STATUS_STYLES.inactive;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                  );
                },
              },
            ]}
            rowActions={getClientActions}
            getRowId={(client: any) => client.id}
            onRowClick={(client: any) => router.push(`/dashboard/clients/${client.id}`)}
            loading={loading}
            emptyMessage="No clients found"
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredClients.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            viewMode="desktop"
          />
        )}
      </div>

      <ReviewVerificationModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewClientId(null);
        }}
        personId={reviewClientId || 0}
        personType="client"
        onSuccess={() => refetch()}
      />
    </>
  );
}

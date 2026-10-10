// src/app/dashboard/clients/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  Users,
  Building2,
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
  Link2,
  ChevronRight,
  ShieldCheck,
  UserRound,
  Building,
  UserPlus,
  Car,
  Clock,
} from "lucide-react";
import { useClientsList } from "@/hooks/clients/useClientsList";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import AddClientButton from "@/components/client/AddClientButton";
import ClientInvitesPanel from "@/components/client/ClientInvitesPanel";
import SecureImage from "@/components/ui/SecureImage";
import CardGrid from "@/components/ui/CardGrid";
import ReviewVerificationModal from "@/components/client/ReviewVerificationModal";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

type ClientSegment = "individual" | "corporate" | "invites";

const TABS = [
  { id: "individual", label: "Individual", icon: UserIcon },
  { id: "corporate", label: "Corporate", icon: Building2 },
  { id: "invites", label: "Invites", icon: Link2 },
];

// ✅ GLOBAL: Shared status styles for both mobile and desktop
const CLIENT_STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", label: "Active" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", label: "Pending" },
  suspended: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", dot: "bg-red-500", label: "Suspended" },
  inactive: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-500", label: "Inactive" },
};

// ✅ NEW: Vetting status styles
const VETTING_STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  unverified: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", label: "Unverified" },
  sent: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", label: "Link Sent" },
  under_review: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", label: "Under Review" },
  verified: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", label: "Verified" },
  rejected: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", label: "Rejected" },
};

// ✅ NEW: Driving arrangement labels
const ARRANGEMENT_LABELS: Record<string, string> = {
  self_drive: "Self Drive",
  own_driver: "Own Driver",
  chauffeur: "Chauffeur",
};

export default function ClientsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ClientSegment>("individual");
  
  // ✅ NEW: Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewClientId, setReviewClientId] = useState<number | null>(null);

  const {
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    filteredClients,
    paginatedClients,
    totalPages,
    pendingClients,
    handleVerify,
    handleReactivate,
    handleArchive,
    refetch,
  } = useClientsList();

  const clientMetrics = useMemo(() => {
    const total = filteredClients.length;
    const active = filteredClients.filter((client) =>
      client.status !== 'suspended' && (client as any).bookingsCount > 0
    ).length;
    const inactive = filteredClients.filter((client) =>
      client.status === 'suspended' || (client as any).bookingsCount === 0
    ).length;
    return { total, active, inactive };
  }, [filteredClients]);

  const currentTabInfo = useMemo(() => {
    if (activeTab === "individual") {
      return {
        title: "Individual Clients",
        description: "Manage individual customer accounts, personal verification steps, and driver records.",
        icon: <UserRound size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
      };
    }
    if (activeTab === "corporate") {
      return {
        title: "Corporate Clients",
        description: "Oversee commercial agency relationships, corporate profiles, and company contracts.",
        icon: <Building size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
      };
    }
    return {
      title: "Client Invites",
      description: "Generate single-use onboarding links and manage pending invitations.",
      icon: <UserPlus size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    };
  }, [activeTab]);

  const getClientActions = (client: any): RowAction<any>[] => [
    {
      label: "View Full Profile",
      icon: UserIcon,
      onClick: () => router.push(`/dashboard/clients/${client.id}`),
    },
    {
      label: client.verification_status === "under_review" 
        ? "Review Verification" 
        : client.verification_status === "rejected" || client.status === "pending" 
        ? "Start Verification" 
        : "Suspend Client",
      icon: client.verification_status === "under_review" ? Clock : Shield,
      variant: (client.verification_status === "under_review" || client.verification_status === "rejected" || client.status === "pending") ? "primary" : "default",
      onClick: () => {
        if (client.verification_status === "under_review") {
          setReviewClientId(client.id);
          setReviewModalOpen(true);
        } else {
          handleVerify(client.id);
        }
      },
      disabled: client.status !== "pending" && client.status !== "active" && client.verification_status !== "rejected" && client.verification_status !== "under_review",
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

  if (activeTab === "invites") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex">{currentTabInfo.icon}</span>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                {currentTabInfo.title}
              </h1>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
              {currentTabInfo.description}
            </p>
          </div>
          <div className="self-start sm:self-auto">
            <PremiumTabSwitcher
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as ClientSegment)}
            />
          </div>
        </div>
        <ClientInvitesPanel />
      </div>
    );
  }

  if (activeTab === "individual") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex">{currentTabInfo.icon}</span>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                {currentTabInfo.title}
              </h1>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
              {currentTabInfo.description}
            </p>
          </div>
          <div className="self-start sm:self-auto">
            <PremiumTabSwitcher
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as ClientSegment)}
            />
          </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
          <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
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
                  options={[
                    { label: "Active", value: "active", count: clientMetrics.active },
                    { label: "Pending", value: "pending", count: pendingClients },
                    { label: "Suspended", value: "suspended", count: clientMetrics.inactive },
                    { label: "Inactive", value: "inactive", count: clientMetrics.inactive },
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  icon={Filter}
                />
              </div>

              <AddClientButton />
            </div>
          </div>

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
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <>
              {/* ✅ MOBILE: Premium Client CardGrid */}
              <div className="block md:hidden">
                <CardGrid
                  data={paginatedClients}
                  getCardId={(client: any) => client.id}
                  compact={true}
                  showGlassEffect={true}
                  cardClassName="!p-3 hover:!border-[var(--color-primary)]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300"
                  containerClassName="px-2 pb-4"
                  maxHeight="calc(100vh - 160px)"
                  renderCardHeader={({ item }: { item: any }) => {
                    const style = CLIENT_STATUS_STYLES[item.status] || CLIENT_STATUS_STYLES.inactive;
                    const vetting = VETTING_STATUS_STYLES[item.verification_status || "unverified"];

                    return (
                      <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => router.push(`/dashboard/clients/${item.id}`)}>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center overflow-hidden shadow-md">
                              <SecureImage
                                src={item.avatar_image}
                                alt={item.full_name}
                                className="w-full h-full object-cover"
                                fallback={<UserIcon size={16} className="text-[var(--color-primary)]" />}
                              />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5">
                              <div className={`w-3 h-3 rounded-full ${style.dot} ring-2 ring-[var(--color-surface)] shadow-sm`} />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                                {item.full_name}
                              </span>
                              {item.verification_status === "verified" && (
                                <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                              )}
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${vetting.bg} ${vetting.text}`}>
                                {vetting.label}
                              </span>
                            </div>
                            {item.email ? (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Mail size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                                <span className="text-[10px] text-[var(--color-ink-muted)] truncate">{item.email}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[var(--color-ink-subtle)] italic">No email</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" />
                      </div>
                    );
                  }}
                  renderCardBody={({ item }: { item: any }) => {
                    const dlExpiryDate = item.dl_expiry;
                    const isDLValid = dlExpiryDate ? new Date(dlExpiryDate) > new Date() : false;
                    const style = CLIENT_STATUS_STYLES[item.status] || CLIENT_STATUS_STYLES.inactive;
                    const arrangement = ARRANGEMENT_LABELS[item.driving_arrangement || "self_drive"];

                    return (
                      <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)]/80 flex items-center justify-center flex-shrink-0">
                              <Phone size={12} className="text-[var(--color-ink-subtle)]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[var(--color-ink)] truncate leading-tight">{item.phone || "No phone"}</p>
                              <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">Contact</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                            <div className="min-w-0 text-right">
                              <p className="text-xs font-semibold text-[var(--color-ink)] truncate leading-tight font-mono">{item.id_number || "N/A"}</p>
                              <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">National ID</span>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)]/80 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-bold text-[var(--color-ink-subtle)]">ID</span>
                            </div>
                          </div>
                        </div>

                        <div className={`rounded-xl px-3 py-2.5 border ${
                          item.status === 'suspended' ? 'bg-red-500/10 border-red-500/20' :
                          item.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20' :
                          'bg-[var(--color-surface-hover)]/50 border-[var(--color-surface-border)]/50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Car size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                              <span className="text-[10px] font-semibold text-[var(--color-ink)] truncate">{arrangement}</span>
                              {item.dl_number && (
                                <>
                                  <span className="text-[9px] text-[var(--color-ink-subtle)]">·</span>
                                  <span className="text-[10px] font-mono text-[var(--color-ink)] truncate">{item.dl_number.replace(/^DL[-\s]?/i, '')}</span>
                                  {dlExpiryDate && (
                                    <span className={`text-[8px] font-bold ${isDLValid ? 'text-emerald-500' : 'text-red-500'}`}>
                                      {isDLValid ? 'VALID' : 'EXPIRED'}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                              <span className={`w-2 h-2 rounded-full ${style.dot} flex-shrink-0`} />
                              <span className={`text-[9px] font-bold uppercase tracking-wide ${style.text}`}>{style.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                  rowActions={getClientActions}
                />
              </div>

              {/* ✅ DESKTOP: DataTable */}
              <div className="hidden md:block">
                <DataTable
                  data={paginatedClients}
                  columns={[
                    {
                      header: "Client",
                      accessorKey: "full_name",
                      cell: ({ row }) => {
                        const client = row.original as any;
                        const vetting = VETTING_STATUS_STYLES[client.verification_status || "unverified"];
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
                                  onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/clients/${client.id}`); }}
                                  className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
                                >
                                  {client.full_name}
                                </button>
                                {client.verification_status === "verified" && (
                                  <span title="Verified Account"><ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" /></span>
                                )}
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${vetting.bg} ${vetting.text}`}>
                                  {vetting.label}
                                </span>
                              </div>
                              {client.email ? (
                                <a href={`mailto:${client.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate mt-0.5">
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
                          <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">{row.original.id_number}</span>
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
                          <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">{row.original.dl_number}</span>
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
              </div>
            </>
          )}
        </div>

        {/* ✅ REVIEW VERIFICATION MODAL */}
        <ReviewVerificationModal
          isOpen={reviewModalOpen}
          onClose={() => { setReviewModalOpen(false); setReviewClientId(null); }}
          personId={reviewClientId || 0}
          personType="client"
          onSuccess={() => {
            refetch(); // Refresh the list to reflect the new status
          }}
        />
      </div>
    );
  }

  // Corporate tab placeholder
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">{currentTabInfo.icon}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">{currentTabInfo.title}</h1>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">{currentTabInfo.description}</p>
        </div>
        <div className="self-start sm:self-auto">
          <PremiumTabSwitcher tabs={TABS} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as ClientSegment)} />
        </div>
      </div>
      <div className="p-12 text-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] animate-in fade-in duration-300">
        <Building2 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Corporate Client Hub</h3>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
          Commercial profiles, group company multi-driver billing, agency agreements, and decentralized corporate contract tracking systems coming soon.
        </p>
      </div>
    </div>
  );
}

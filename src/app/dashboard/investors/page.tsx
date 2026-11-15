// src/app/dashboard/investors/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Phone,
  CheckCircle,
  Clock,
  Funnel as Filter,
  CircleNotch as Loader2,
  MagnifyingGlass as Search,
  User as UserIcon,
  Archive,
  CaretRight as ChevronRight,
  Envelope as Mail,
  CalendarDots as CalendarDays,
  Handshake,
} from "@phosphor-icons/react/ssr";
import DataTable, { type RowAction } from "@/components/ui/DataTable";
import FilterDropdown from "@/components/ui/FilterDropdown";
import CardGrid from "@/components/ui/CardGrid";
import InviteInvestorModal from "@/components/investor/InviteInvestorModal";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import MobileFloatingSegment from "@/components/ui/MobileFloatingSegment";
import { useInvestorsList } from "@/hooks/investor/useInvestorsList";
import { useSetPageHeader } from "@/context/page-header-context";
import type { User } from "@/lib/types";

type InvestorStatus = "active" | "pending";
const VALID_STATUSES = new Set<InvestorStatus>(["active", "pending"]);

// ✅ NEW: Partner segments (umbrella page = "Partners", two sub-tabs)
type PartnerTab = "investors" | "brokers";

const TABS: { id: PartnerTab; label: string; icon: React.ElementType }[] = [
  { id: "investors", label: "Investors", icon: Users },
  { id: "brokers", label: "Brokers", icon: Handshake },
];

const VALID_TABS = new Set<PartnerTab>(["investors", "brokers"]);

// ✅ Mirrors CLIENT_STATUS_STYLES shape exactly
const INVESTOR_STATUS_STYLES: Record<
  InvestorStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Active",
  },
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Pending",
  },
};

const getInvestorStatus = (investor: User): InvestorStatus =>
  investor.is_onboarded ? "active" : "pending";

const PAGE_SIZE = 10;

export default function AgencyPartnersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { investors, loading } = useInvestorsList();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Hydrate from URL (tab + q + status)
  const tabFromUrl = searchParams.get("tab") as PartnerTab | null;
  const initialTab: PartnerTab =
    tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : "investors";

  const initialSearch = searchParams.get("q") || "";
  const statusParam = searchParams.get("status") as InvestorStatus | null;
  const initialStatus = statusParam && VALID_STATUSES.has(statusParam) ? statusParam : null;

  const [activeTab, setActiveTab] = useState<PartnerTab>(initialTab);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string | null>(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Sync FROM URL (handles browser back/forward, deep links)
  useEffect(() => {
    const t = searchParams.get("tab") as PartnerTab | null;
    if (t && VALID_TABS.has(t) && t !== activeTab) setActiveTab(t);

    const q = searchParams.get("q") || "";
    if (q !== search) setSearch(q);

    const s = searchParams.get("status") as InvestorStatus | null;
    const validS = s && VALID_STATUSES.has(s) ? s : null;
    if (validS !== statusFilter) setStatusFilter(validS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ✅ Sync TO URL (keeps state sharable/bookmarkable; tab is the source of truth)
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== "investors") params.set("tab", activeTab);
    // q/status are investor-specific — only serialize them on that tab
    if (activeTab === "investors") {
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter) params.set("status", statusFilter);
    }

    const str = params.toString();
    const newUrl = `/dashboard/investors${str ? `?${str}` : ""}`;

    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, activeTab]);

  const handleTabChange = (tabId: string) => {
    if (!VALID_TABS.has(tabId as PartnerTab)) return;
    const next = tabId as PartnerTab;
    if (next === activeTab) return;
    setActiveTab(next);
  };

  // ✅ Drive the mobile top bar (matches Clients/Financials pattern)
  useSetPageHeader(
    "Partners",
    "Manage host investors and broker relationships across your fleet network.",
  );

  // ✅ Derived metrics
  const metrics = useMemo(() => {
    const total = investors.length;
    const active = investors.filter(
      (i) => getInvestorStatus(i) === "active",
    ).length;
    const pending = total - active;
    return { total, active, pending };
  }, [investors]);

  // ✅ Client-side search + status filter
  const filteredInvestors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return investors.filter((investor) => {
      const matchesSearch =
        !q ||
        investor.full_name.toLowerCase().includes(q) ||
        (investor.email ?? "").toLowerCase().includes(q) ||
        (investor.phone_number ?? "").toLowerCase().includes(q);

      const matchesStatus =
        !statusFilter || getInvestorStatus(investor) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [investors, search, statusFilter]);

  // ✅ Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvestors.length / PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedInvestors = useMemo(
    () =>
      filteredInvestors.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredInvestors, safePage],
  );

  // ✅ Row actions
  const getInvestorActions = (investor: User): RowAction<User>[] =>
    [
      {
        label: "View Profile",
        icon: UserIcon,
        onClick: () =>
          router.push(`/dashboard/investors/${investor.id}`),
      },
      {
        label: "Resend Invite",
        icon: Mail,
        variant: "primary",
        disabled: getInvestorStatus(investor) !== "pending",
        onClick: () => {
          // TODO: wire to invite resend endpoint
        },
      },
      {
        label: "Archive Investor",
        icon: Archive,
        variant: "danger",
        separator: true,
        onClick: () => {
          // TODO: wire to archive endpoint
        },
      },
    ].filter((action) => !!action.label) as RowAction<User>[];

  // ✅ Mobile floating-segment toggle logic (2 tabs, mirrors Financials)
  const floatingToggleTarget: PartnerTab =
    activeTab === "investors" ? "brokers" : "investors";
  const FloatingTriggerIcon =
    activeTab === "investors" ? Handshake : Users;

  return (
    <div className="space-y-6">
      {/* ✅ Header — canonical pattern (title left, tabs right) */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">
              <Handshake
                size={28}
                weight="light"
                className="text-[var(--color-primary)]" aria-hidden="true"
              />
            </span>

            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              Partners
            </h1>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
            Manage your host investors and broker relationships across the fleet network.
          </p>
        </div>

        <div className="hidden md:block">
          <PremiumTabSwitcher tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          INVESTORS TAB
      ──────────────────────────────────────────────────────────── */}
      {activeTab === "investors" && (
        <div className="animate-in fade-in duration-300">
          {/* ✅ Canonical surface card */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              {/* Metrics pill group */}
              <div className="hidden sm:flex lg:flex-shrink-0 items-center justify-between gap-1 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm">
                <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">
                    Investors
                  </span>
                  <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">
                    {metrics.total}
                  </span>
                </div>
                <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
                <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">
                    Active
                  </span>
                  <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">
                    {metrics.active}
                  </span>
                </div>
                <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
                <div className="flex items-center justify-center gap-1.5 min-w-0 text-center sm:flex-1">
                  <span className="text-xs font-medium text-[var(--color-ink-muted)]">
                    Pending
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {metrics.pending}
                  </span>
                </div>
              </div>

              {/* Search + Filter + Primary CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <div className="flex items-center gap-2 flex-1 sm:w-80">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search investors..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                    />
                  </div>

                  <FilterDropdown
                    filterId="investor-status"
                    label="Status"
                    options={[
                      { label: "Active", value: "active", count: metrics.active },
                      {
                        label: "Pending",
                        value: "pending",
                        count: metrics.pending,
                      },
                    ]}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value)}
                    icon={Filter}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-all shadow-sm"
                >
                  <UserPlus size={16} aria-hidden="true" />
                  Invite Investor
                </button>
              </div>
            </div>

            {/* Body */}
            {loading ? (
              <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                Loading investors...
              </div>
            ) : filteredInvestors.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-[var(--color-ink-subtle)]" aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
                  {investors.length === 0
                    ? "No Investors Yet"
                    : "No investors found"}
                </h3>
                <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto mb-6">
                  {investors.length === 0
                    ? "Invite your first host investor to start expanding your fleet without upfront capital."
                    : "Try adjusting your search query or filters."}
                </p>
                {investors.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-all"
                  >
                    <UserPlus size={16} aria-hidden="true" />
                    Invite Your First Investor
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ✅ MOBILE: CardGrid */}
                <div className="block md:hidden">
                  <CardGrid
                    data={paginatedInvestors}
                    getCardId={(investor) => String(investor.id)}
                    compact={true}
                    showGlassEffect={true}
                    cardClassName="!p-3 hover:!border-[var(--color-primary)]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300"
                    containerClassName="px-2 pb-4"
                    maxHeight="calc(100vh - 160px)"
                    renderCardHeader={({ item }) => {
                      const status = getInvestorStatus(item);
                      const style = INVESTOR_STATUS_STYLES[status];
                      return (
                        <div
                          className="flex items-center justify-between w-full cursor-pointer"
                          onClick={() =>
                            router.push(`/dashboard/investors/${item.id}`)
                          }
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center overflow-hidden shadow-md text-[var(--color-primary)] font-bold text-sm">
                                {item.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute -top-0.5 -right-0.5">
                                <div
                                  className={`w-3 h-3 rounded-full ${style.dot} ring-2 ring-[var(--color-surface)] shadow-sm`}
                                />
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                                  {item.full_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Mail
                                  size={10}
                                  className="text-[var(--color-ink-subtle)] flex-shrink-0" aria-hidden="true"
                                />
                                <span className="text-[10px] text-[var(--color-ink-muted)] truncate">
                                  {item.email ?? "No email"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <ChevronRight
                            size={16}
                            className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" aria-hidden="true"
                          />
                        </div>
                      );
                    }}
                    renderCardBody={({ item }) => {
                      const status = getInvestorStatus(item);
                      const style = INVESTOR_STATUS_STYLES[status];
                      return (
                        <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60">
                          <div className="flex items-center gap-3 mb-3">
                            {/* Phone */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)]/80 flex items-center justify-center flex-shrink-0">
                                <Phone
                                  size={12}
                                  className="text-[var(--color-ink-subtle)]" aria-hidden="true"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[var(--color-ink)] truncate leading-tight">
                                  {item.phone_number || "No phone"}
                                </p>
                                <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">
                                  Contact
                                </span>
                              </div>
                            </div>

                            {/* Joined */}
                            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                              <div className="min-w-0 text-right">
                                <p className="text-xs font-semibold text-[var(--color-ink)] truncate leading-tight">
                                  {new Date(item.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </p>
                                <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">
                                  Joined
                                </span>
                              </div>
                              <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)]/80 flex items-center justify-center flex-shrink-0">
                                <CalendarDays
                                  size={12}
                                  className="text-[var(--color-ink-subtle)]" aria-hidden="true"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Unified bottom status pill */}
                          <div
                            className={`rounded-xl px-3 py-2.5 border ${
                              status === "pending"
                                ? "bg-amber-500/10 border-amber-500/20"
                                : "bg-[var(--color-surface-hover)]/50 border-[var(--color-surface-border)]/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                                  Investor
                                </span>
                                <span className="text-[10px] font-semibold text-[var(--color-ink)] truncate font-mono">
                                  #{item.id}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span
                                  className={`w-2 h-2 rounded-full ${style.dot} flex-shrink-0`}
                                />
                                <span
                                  className={`text-[9px] font-bold uppercase tracking-wide ${style.text}`}
                                >
                                  {style.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                    rowActions={getInvestorActions}
                  />
                </div>

                {/* ✅ DESKTOP: DataTable */}
                <div className="hidden md:block">
                  <DataTable
                    data={paginatedInvestors}
                    columns={[
                      {
                        header: "Investor",
                        accessorKey: "full_name",
                        cell: ({ row }) => {
                          const investor = row.original;
                          return (
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-sm shrink-0">
                                {investor.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex flex-col">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/dashboard/investors/${investor.id}`,
                                    );
                                  }}
                                  className="text-sm font-semibold text-[var(--color-ink)] truncate hover:text-[var(--color-primary)] transition-colors text-left"
                                >
                                  {investor.full_name}
                                </button>
                                {investor.email && (
                                  <a
                                    href={`mailto:${investor.email}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors truncate mt-0.5"
                                  >
                                    <Mail
                                      size={12}
                                      className="text-[var(--color-ink-subtle)] flex-shrink-0" aria-hidden="true"
                                    />
                                    <span className="truncate">
                                      {investor.email}
                                    </span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        },
                      },
                      {
                        header: "Phone",
                        accessorKey: "phone_number",
                        cell: ({ row }) => (
                          <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                            <Phone
                              size={14}
                              className="text-[var(--color-ink-subtle)]" aria-hidden="true"
                            />
                            <span className="font-medium">
                              {row.original.phone_number || "—"}
                            </span>
                          </div>
                        ),
                      },
                      {
                        header: "Status",
                        accessorKey: "is_onboarded",
                        cell: ({ row }) => {
                          const status = getInvestorStatus(row.original);
                          const style = INVESTOR_STATUS_STYLES[status];
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}
                            >
                              {status === "active" ? (
                                <>
                                  <CheckCircle size={12} aria-hidden="true" /> {style.label}
                                </>
                              ) : (
                                <>
                                  <Clock size={12} aria-hidden="true" /> {style.label}
                                </>
                              )}
                            </span>
                          );
                        },
                      },
                      {
                        header: "Joined",
                        accessorKey: "created_at",
                        cell: ({ row }) => (
                          <span className="text-sm text-[var(--color-ink-muted)]">
                            {new Date(row.original.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        ),
                      },
                    ]}
                    rowActions={getInvestorActions}
                    getRowId={(investor) => String(investor.id)}
                    onRowClick={(investor) =>
                      router.push(`/dashboard/investors/${investor.id}`)
                    }
                    loading={loading}
                    emptyMessage="No investors found matching your criteria."
                    currentPage={safePage}
                    totalPages={totalPages}
                    totalItems={filteredInvestors.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                    viewMode="desktop"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          BROKERS TAB — typed placeholder (no TS issues)
      ──────────────────────────────────────────────────────────── */}
      {activeTab === "brokers" && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
                <Handshake size={24} className="text-[var(--color-ink-subtle)]" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
                Broker Partners
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
                Referral brokers and channel partners will be managed here. This
                section is under construction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Mobile floating segment — mirrors Financials/Bookings */}
      <div
        data-fab-stack
        className="lg:hidden fixed right-4 bottom-[108px] z-[65] pointer-events-none transition-all duration-200"
      >
        <div className="pointer-events-auto">
          <MobileFloatingSegment
            segments={TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
            active={activeTab}
            onChange={handleTabChange}
            toggleTarget={floatingToggleTarget}
            triggerIcon={FloatingTriggerIcon}
          />
        </div>
      </div>

      {/* Invite Modal */}
      <InviteInvestorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

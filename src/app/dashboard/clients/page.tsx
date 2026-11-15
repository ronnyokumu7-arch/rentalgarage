"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Buildings as Building2,
  User as UserIcon,
  LinkSimple as Link2,
  User as UserRound,
  Building,
  UserPlus,
} from "@phosphor-icons/react/ssr";
import ClientInvitesPanel from "@/components/client/ClientInvitesPanel";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import MobileClientsList from "@/components/client/MobileClientsList";
import DesktopClientsList from "@/components/client/DesktopClientsList";
import AddClientModal from "@/components/client/AddClientModal";
import { useClientsList } from "@/hooks/clients/useClientsList"; // ✅ SINGLE HOOK
import { useSetPageHeader } from "@/context/page-header-context";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";
import type { ClientBookingState } from "@/components/client/mobile/types";

type ClientSegment = "individual" | "corporate" | "invites";

const TABS = [
  { id: "individual" as const, label: "Individual", icon: UserIcon },
  { id: "corporate"  as const, label: "Corporate",  icon: Building2 },
  { id: "invites"    as const, label: "Invites",    icon: Link2, hiddenOnMobile: true },
];

const VALID_TABS = new Set<ClientSegment>(["individual", "corporate", "invites"]);

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab") as ClientSegment | null;
  const initialTab: ClientSegment = tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : "individual";
  const [activeTab, setActiveTab] = useState<ClientSegment>(initialTab);
  const [addClientOpen, setAddClientOpen] = useState(false);

  // ✅ Fetch active bookings so we can compute ring states
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);

  useEffect(() => {
    let cancelled = false;
    bookingsApi
      .list({ page: 1, page_size: 100 })
      .then((items) => {
        if (cancelled) return;
        setActiveBookings(items.filter((b) => b.status === "active" || b.status === "confirmed"));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const clientBookingStateMap = useMemo(() => {
    const map = new Map<number, ClientBookingState>();
    const now = Date.now();
    activeBookings.forEach((b) => {
      if (!b.client_id) return;
      const start = new Date(b.start_date).getTime();
      const end = new Date(b.end_date).getTime();
      const state: ClientBookingState = now >= start && now <= end ? "on_trip" : "booked";
      if (map.get(b.client_id) === "on_trip") return;
      map.set(b.client_id, state);
    });
    return map;
  }, [activeBookings]);

  useEffect(() => {
    const t = searchParams.get("tab") as ClientSegment | null;
    if (t && VALID_TABS.has(t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId: string) => {
    if (!VALID_TABS.has(tabId as ClientSegment)) return;
    const next = tabId as ClientSegment;
    if (next === activeTab) return;
    setActiveTab(next);
    router.push(`/dashboard/clients?tab=${next}`, { scroll: false });
  };

  // ✅ SINGLE INSTANCE of the base hook (fixes the double-fetch / out-of-sync bug)
  const clients = useClientsList();

  // ✅ Derived metrics computed ONCE from the single filtered list
  const clientMetrics = useMemo(() => {
    const total = clients.filteredClients.length;
    const active = clients.filteredClients.filter((c) => c.status !== "suspended" && (c as any).bookingsCount > 0).length;
    const inactive = clients.filteredClients.filter((c) => c.status === "suspended" || (c as any).bookingsCount === 0).length;
    return { total, active, inactive };
  }, [clients.filteredClients]);

  const statusOptions = useMemo(
    () => [
      { label: "Active", value: "active", count: clientMetrics.active },
      { label: "Pending", value: "pending", count: clients.pendingClients },
      { label: "Suspended", value: "suspended", count: clientMetrics.inactive },
      { label: "Inactive", value: "inactive", count: clientMetrics.inactive },
    ],
    [clientMetrics.active, clientMetrics.inactive, clients.pendingClients]
  );

  const currentTabInfo = useMemo(() => {
    if (activeTab === "individual") {
      return {
        title: "Individual Clients",
        mobileTitle: "Clients",
        description: "Manage individual customer accounts, personal verification steps, and driver records.",
        icon: <UserRound size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
      };
    }
    if (activeTab === "corporate") {
      return {
        title: "Corporate Clients",
        mobileTitle: "Corporate",
        description: "Oversee commercial agency relationships, corporate profiles, and company contracts.",
        icon: <Building size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
      };
    }
    return {
      title: "Client Invites",
      mobileTitle: "Invites",
      description: "Generate single-use onboarding links and manage pending invitations.",
      icon: <UserPlus size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
    };
  }, [activeTab]);

  useSetPageHeader(currentTabInfo.mobileTitle, currentTabInfo.description);

  return (
    <div className="space-y-6">
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">{currentTabInfo.icon}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">{currentTabInfo.title}</h1>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">{currentTabInfo.description}</p>
        </div>
        <div className="hidden md:block">
          <PremiumTabSwitcher tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {activeTab === "invites" && (
        <div className="animate-in fade-in duration-300">
          <ClientInvitesPanel />
        </div>
      )}

      {activeTab === "corporate" && (
        <>
          <MobileClientsList
            search={clients.search}
            setSearch={clients.setSearch}
            statusFilter={clients.statusFilter}
            setStatusFilter={clients.setStatusFilter}
            statusOptions={statusOptions}
            activeTab={activeTab}
            handleTabChange={handleTabChange}
            loading={clients.loading}
            filteredClients={clients.filteredClients} // ✅ Full list for mobile (no pagination)
            pendingClients={clients.pendingClients}
            handleVerify={clients.handleVerify}
            handleSuspend={clients.handleSuspend}
            handleArchive={clients.handleArchive}
            refetch={clients.refetch}
            onAddClient={() => setAddClientOpen(true)}
            clientBookingStateMap={clientBookingStateMap}
          />
          <div className="hidden md:block p-12 text-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
            <Building2 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" aria-hidden="true" />
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Corporate Client Hub</h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">Commercial profiles, group company multi-driver billing, agency agreements coming soon.</p>
          </div>
        </>
      )}

      {activeTab === "individual" && (
        <>
          <MobileClientsList
            search={clients.search}
            setSearch={clients.setSearch}
            statusFilter={clients.statusFilter}
            setStatusFilter={clients.setStatusFilter}
            statusOptions={statusOptions}
            activeTab={activeTab}
            handleTabChange={handleTabChange}
            loading={clients.loading}
            filteredClients={clients.filteredClients} // ✅ Full list for mobile (no pagination)
            pendingClients={clients.pendingClients}
            handleVerify={clients.handleVerify}
            handleSuspend={clients.handleSuspend}
            handleArchive={clients.handleArchive}
            refetch={clients.refetch}
            onAddClient={() => setAddClientOpen(true)}
            clientBookingStateMap={clientBookingStateMap}
          />

          <DesktopClientsList
            loading={clients.loading}
            search={clients.search}
            setSearch={clients.setSearch}
            statusFilter={clients.statusFilter}
            setStatusFilter={clients.setStatusFilter}
            statusOptions={statusOptions}
            filteredClients={clients.filteredClients}
            paginatedClients={clients.paginatedClients} // ✅ Sliced to 10 for desktop
            pendingClients={clients.pendingClients}
            clientMetrics={clientMetrics}
            currentPage={clients.currentPage}
            setCurrentPage={clients.setCurrentPage}
            totalPages={clients.totalPages}
            pageSize={clients.pageSize}
            handleVerify={clients.handleVerify}
            handleReactivate={clients.handleReactivate}
            handleArchive={clients.handleArchive}
            refetch={clients.refetch}
            onAddClient={() => setAddClientOpen(true)}
          />
        </>
      )}

      <AddClientModal
        isOpen={addClientOpen}
        onClose={() => {
          setAddClientOpen(false);
          clients.refetch();
        }}
      />
    </div>
  );
}

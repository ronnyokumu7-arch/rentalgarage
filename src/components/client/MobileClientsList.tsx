// src/components/client/MobileClientsList.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Users,
  Loader2,
  UserIcon,
  MessageCircle,
  Shield,
  Archive,
  Plus,
  Building2,
  Clock,
  Phone,
} from "lucide-react";
import CardGrid, { RowAction } from "@/components/ui/CardGrid";
import ReviewVerificationModal from "@/components/client/ReviewVerificationModal";
import ClientsToolbar from "./mobile/ClientsToolbar";
import ClientsBanner from "./mobile/ClientsBanner";
import ClientRow from "./mobile/ClientRow";
import { getWhatsAppNumber, CLIENT_STATUS_STYLES } from "./mobile/helpers";
import type { ClientListItem, ClientBookingState } from "./mobile/types";

export type ClientSegment = "individual" | "corporate" | "invites";

interface MobileClientsListProps {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  statusOptions: { label: string; value: string; count: number }[];
  activeTab: ClientSegment;
  handleTabChange: (tab: string) => void;
  loading: boolean;
  filteredClients: any[];
  pendingClients: number;
  handleVerify: (id: number) => void;
  handleSuspend: (id: number) => void;
  handleArchive: (id: number) => void;
  refetch: () => void;
  onAddClient: () => void;
  /**
   * Map from client_id → booking state:
   *   - "booked"  → has booking, trip hasn't started yet
   *   - "on_trip" → trip is in progress right now
   *   - missing   → no booking
   */
  clientBookingStateMap?: Map<number, ClientBookingState>;
}

export default function MobileClientsList({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
  activeTab,
  handleTabChange,
  loading,
  filteredClients,
  pendingClients,
  handleVerify,
  handleSuspend,
  handleArchive,
  refetch,
  onAddClient,
  clientBookingStateMap,
}: MobileClientsListProps) {
  const router = useRouter();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewClientId, setReviewClientId] = useState<number | null>(null);

  const [selected, setSelected] = useState<any[]>([]);
  const isSelecting = selected.length > 0;
  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected]);

  const [searchFocused, setSearchFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);

  // ─── Selection ────────────────────────────────────────────────────
  const clearSelection = () => {
    setSelected([]);
    longPressFired.current = false;
  };

  const toggleSelection = (client: any) => {
    setSelected((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      if (exists) return prev.filter((c) => c.id !== client.id);
      return [...prev, client];
    });
  };

  const handleTouchStart = (client: any) => (e: React.TouchEvent) => {
    longPressFired.current = false;
    const touch = e.touches[0];
    if (!touch) return;
    longPressStartPos.current = { x: touch.clientX, y: touch.clientY };

    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      if (!isSelecting) setSelected([client]);
      else toggleSelection(client);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(15);
      }
    }, 450);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!longPressTimer.current || !longPressStartPos.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dx = Math.abs(touch.clientX - longPressStartPos.current.x);
    const dy = Math.abs(touch.clientY - longPressStartPos.current.y);
    if (dx > 8 || dy > 8) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    if (!isSelecting) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-selection-zone]")) return;
      clearSelection();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSelecting]);

  // ─── Batch actions ───────────────────────────────────────────────
  const handleBatchVerify = () => {
    if (selected.length === 0) return;
    selected.forEach((c) => handleVerify(c.id));
    clearSelection();
  };

  const handleBatchSuspend = () => {
    if (selected.length === 0) return;
    selected.forEach((c) => {
      if (c.status === "active") handleSuspend(c.id);
    });
    clearSelection();
  };

  const handleBatchArchive = () => {
    if (selected.length === 0) return;
    selected.forEach((c) => handleArchive(c.id));
    clearSelection();
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchFocused(false);
    searchInputRef.current?.blur();
  };

  // ─── Row actions ─────────────────────────────────────────────────
  const getClientActions = (client: any): RowAction<any>[] =>
    [
      {
        label: "View Full Profile",
        icon: UserIcon,
        onClick: () => router.push(`/dashboard/clients/${client.id}`),
      },
      {
        label: "Call Client",
        icon: Phone,
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
        onClick: () => handleVerify(client.id),
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

  const hasActiveFilter = statusFilter !== null && statusFilter !== "";
  const placeholder =
    activeTab === "corporate" ? "Search corporate clients..." : "Search clients...";

  // ✅ Non-paginated list + sort:
  //    1. Suspended → always last
  //    2. Everyone else → alphabetical by full_name
  const displayClients: ClientListItem[] = useMemo(() => {
    const enriched = filteredClients.map((c) => ({
      ...c,
      booking_state: clientBookingStateMap?.get(c.id) ?? "none",
    }));

    return enriched.sort((a, b) => {
      // Suspended clients sink to the bottom
      const aSuspended = a.status === "suspended" ? 1 : 0;
      const bSuspended = b.status === "suspended" ? 1 : 0;
      if (aSuspended !== bSuspended) return aSuspended - bSuspended;

      // Then alphabetical by name
      const aName = (a.full_name ?? "").toLowerCase();
      const bName = (b.full_name ?? "").toLowerCase();
      return aName.localeCompare(bName);
    });
  }, [filteredClients, clientBookingStateMap]);

  const handleRowClick = (client: any) => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (isSelecting) {
      toggleSelection(client);
      return;
    }
    const trigger = document.querySelector(
      `[data-card-actions="${client.id}"] button`
    ) as HTMLButtonElement | null;
    trigger?.click();
  };

  return (
    <>
      <div className="md:hidden animate-in fade-in duration-300 relative">
        <ClientsToolbar
          isSelecting={isSelecting}
          selectedCount={selected.length}
          onClearSelection={clearSelection}
          onBatchVerify={handleBatchVerify}
          onBatchSuspend={handleBatchSuspend}
          onBatchArchive={handleBatchArchive}
          search={search}
          setSearch={setSearch}
          onSearchFocus={() => setSearchFocused(true)}
          onSearchBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          onClearSearch={handleClearSearch}
          searchInputRef={searchInputRef}
          placeholder={placeholder}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((v) => !v)}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={statusOptions}
          hasActiveFilter={hasActiveFilter}
          searchFocused={searchFocused}
        />

        <ClientsBanner
          loading={loading}
          pendingClients={pendingClients}
          filteredCount={filteredClients.length}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          hidden={searchFocused || isSelecting}
        />

        {/* Card List — no pagination */}
        <div className="pb-4">
          {loading ? (
            <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading clients...
            </div>
          ) : displayClients.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-[var(--color-ink-subtle)]" />
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
                No clients found
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                Try adjusting your search query or filters.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] first:rounded-t-2xl last:rounded-b-2xl">
              {displayClients.map((client, index) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  index={index}
                  total={displayClients.length}
                  isSelected={selectedIds.has(client.id)}
                  isSelecting={isSelecting}
                  onTouchStart={handleTouchStart(client)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => handleRowClick(client)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Hidden CardGrid to render action sheets */}
        <div className="hidden">
          <CardGrid
            data={displayClients}
            getCardId={(client: any) => client.id}
            compact={true}
            onCardClick={() => {}}
            cardClassName="!p-0"
            containerClassName="!p-0"
            renderCardHeader={() => <div className="hidden" />}
            renderCardBody={() => null}
            rowActions={getClientActions}
            renderActionSheetBadge={(client: any) => {
              const style =
                CLIENT_STATUS_STYLES[client.status] || CLIENT_STATUS_STYLES.inactive;
              return (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider border ${
                    client.status === "active"
                      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                      : client.status === "pending"
                        ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                        : client.status === "suspended"
                          ? "text-rose-500 bg-rose-500/10 border-rose-500/20"
                          : "text-[var(--color-ink-muted)] bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
              );
            }}
          />
        </div>

        {/* FAB stack */}
        {!isSelecting && !searchFocused && (
          <div
            data-fab-stack
            className="fixed right-4 bottom-[108px] z-[65] flex flex-col items-end gap-3"
          >
            <button
              type="button"
              onClick={() =>
                handleTabChange(activeTab === "individual" ? "corporate" : "individual")
              }
              aria-label={
                activeTab === "individual"
                  ? "Switch to Corporate"
                  : "Switch to Individual"
              }
              className="w-12 h-12 rounded-xl bg-[var(--color-surface)]/80 backdrop-blur-xl border border-[var(--color-surface-border)] shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-surface-hover)]/90 transition-all"
            >
              {activeTab === "individual" ? (
                <Building2 size={18} className="text-[var(--color-ink-muted)]" />
              ) : (
                <UserIcon size={18} className="text-[var(--color-ink-muted)]" />
              )}
            </button>

            <button
              type="button"
              onClick={onAddClient}
              aria-label="Add Client"
              className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/20 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-primary)]/30 transition-all"
            >
              <div className="relative flex items-center justify-center">
                <UserIcon size={22} strokeWidth={2} className="text-[var(--color-primary)]" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-sm">
                  <Plus size={10} strokeWidth={3.5} />
                </span>
              </div>
            </button>
          </div>
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

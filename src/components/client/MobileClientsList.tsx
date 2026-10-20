"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Users,
  Phone,
  Loader2,
  ShieldAlert,
  ArrowRight,
  UserIcon,
  MessageCircle,
  CreditCard,
  Car,
  Shield,
  Ban,
  Archive,
  Search,
  CheckCircle2,
  Circle,
  X,
  Plus,
  Building2,
  Calendar,
} from "lucide-react";
import CardGrid, { RowAction } from "@/components/ui/CardGrid";
import SecureImage from "@/components/ui/SecureImage";
import ReviewVerificationModal from "@/components/client/ReviewVerificationModal";

/* ──────────────────────────────────────────────────────────────────────
   Types & helpers
────────────────────────────────────────────────────────────────────── */

export type ClientSegment = "individual" | "corporate" | "invites";

const CLIENT_STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:    { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500", label: "Active" },
  pending:   { bg: "bg-amber-500/10",   text: "text-amber-600 dark:text-amber-400",     dot: "bg-amber-500",   label: "Pending" },
  suspended: { bg: "bg-red-500/10",     text: "text-red-600 dark:text-red-400",         dot: "bg-red-500",     label: "Suspended" },
  inactive:  { bg: "bg-gray-500/10",    text: "text-gray-600 dark:text-gray-400",       dot: "bg-gray-500",    label: "Inactive" },
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

function getDLStatus(dlExpiry?: string | null): {
  kind: "none" | "expired" | "expiring" | "valid";
  label: string;
  tone: "emerald" | "amber" | "rose" | "muted";
} {
  if (!dlExpiry) return { kind: "none", label: "DL not provided", tone: "muted" };
  const expiry = new Date(dlExpiry);
  if (Number.isNaN(expiry.getTime())) {
    return { kind: "none", label: "DL not provided", tone: "muted" };
  }
  const diffDays = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
  if (diffDays < 0) return { kind: "expired", label: "DL expired", tone: "rose" };
  if (diffDays <= 30) {
    return {
      kind: "expiring",
      label: diffDays === 0 ? "DL expires today" : `DL expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`,
      tone: "amber",
    };
  }
  return { kind: "valid", label: "DL valid", tone: "emerald" };
}

/* ──────────────────────────────────────────────────────────────────────
   Props
────────────────────────────────────────────────────────────────────── */

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
  paginatedClients: any[];
  pendingClients: number;
  handleVerify: (id: number) => void;
  handleSuspend: (id: number) => void;
  handleArchive: (id: number) => void;
  refetch: () => void;
  onAddClient: () => void;
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
  paginatedClients,
  pendingClients,
  handleVerify,
  handleSuspend,
  handleArchive,
  refetch,
  onAddClient,
}: MobileClientsListProps) {
  const router = useRouter();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewClientId, setReviewClientId] = useState<number | null>(null);

  const [selected, setSelected] = useState<any[]>([]);
  const isSelecting = selected.length > 0;

  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);

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
        label: "Archive Client",
        icon: Users,
        variant: "danger",
        separator: true,
        onClick: () => handleArchive(client.id),
      },
    ].filter((action) => !!action.label) as RowAction<any>[];

  return (
    <>
      <div className="md:hidden animate-in fade-in duration-300 relative">
        {/* Toolbar */}
        <div className="py-3" data-selection-zone>
          {isSelecting ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  aria-label="Clear selection"
                >
                  <X size={16} />
                </button>
                <span className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                  {selected.length} selected
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleBatchVerify}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label="Verify clients"
                  title="Start Verification"
                >
                  <Shield size={16} />
                </button>
                <button
                  onClick={handleBatchSuspend}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label="Suspend clients"
                  title="Suspend"
                >
                  <Ban size={16} />
                </button>
                <button
                  onClick={handleBatchArchive}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors"
                  aria-label="Archive clients"
                  title="Archive"
                >
                  <Archive size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Search takes full width — segment dropdown removed */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    setTimeout(() => setSearchFocused(false), 150);
                  }}
                  placeholder={activeTab === "corporate" ? "Search corporate clients..." : "Search clients..."}
                  className="w-full h-10 pl-9 pr-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                />
                {search && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-surface-hover)] flex items-center justify-center hover:bg-[var(--color-surface-border)] transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={12} className="text-[var(--color-ink-muted)]" />
                  </button>
                )}
              </div>

              <div className={`overflow-x-auto scrollbar-none transition-all duration-200 ${searchFocused ? "max-h-0 opacity-0 overflow-hidden" : "max-h-20 opacity-100"}`}>
                <div className="flex items-center gap-2 py-1">
                  <button
                    onClick={() => setStatusFilter(null)}
                    className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border ${
                      statusFilter === null || statusFilter === ""
                        ? "text-[var(--color-primary)] border-[var(--color-primary)]"
                        : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    All
                  </button>
                  {statusOptions
                    .filter((opt) => opt.value !== "pending" && opt.value !== "inactive")
                    .map((opt) => {
                      const isActive = statusFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setStatusFilter(opt.value)}
                          className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                            isActive
                              ? "text-[var(--color-primary)] border-[var(--color-primary)]"
                              : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                          }`}
                        >
                          {opt.label}
                          {isActive && (
                            <span className="text-[9px] font-extrabold tabular-nums text-[var(--color-primary)]">
                              {opt.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  <button
                    onClick={() => setStatusFilter("with_booking")}
                    className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                      statusFilter === "with_booking"
                        ? "text-[var(--color-primary)] border-[var(--color-primary)]"
                        : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    <Calendar size={11} className="flex-shrink-0" />
                    With Booking
                  </button>
                  <button
                    onClick={() => setStatusFilter("inactive")}
                    className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                      statusFilter === "inactive"
                        ? "text-[var(--color-primary)] border-[var(--color-primary)]"
                        : "text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    <Archive size={11} className="flex-shrink-0" />
                    Archived
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={searchFocused || isSelecting ? "hidden" : ""}>
          {!loading && pendingClients > 0 && statusFilter !== "pending" && (
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className="w-full flex items-center justify-start gap-2 py-3 px-1 text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity text-xs font-semibold"
            >
              <ShieldAlert size={14} />
              {pendingClients} {pendingClients === 1 ? "client" : "clients"} awaiting your review
              <ArrowRight size={12} className="opacity-70" />
            </button>
          )}

          {!loading && statusFilter === "pending" && (
            <div className="w-full flex items-center justify-between py-3 px-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <span className="flex items-center gap-2">
                <ShieldAlert size={14} />
                Viewing {filteredClients.length} pending {filteredClients.length === 1 ? "client" : "clients"}
              </span>
              <button
                type="button"
                onClick={() => setStatusFilter(null)}
                className="text-[11px] font-bold px-2 py-1 rounded-md bg-blue-500/15 hover:bg-blue-500/25 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

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
          <CardGrid
            data={paginatedClients}
            getCardId={(client: any) => client.id}
            compact={true}
            onCardClick={(client: any) => {
              if (longPressFired.current) {
                longPressFired.current = false;
                return;
              }
              if (isSelecting) {
                toggleSelection(client);
                return;
              }
              const trigger = document.querySelector(
                `[data-card-actions="${client.id}"] button`,
              ) as HTMLButtonElement | null;
              trigger?.click();
            }}
            cardClassName={`!p-0 !rounded-none !border-0 !bg-transparent !shadow-none transition-colors [&_[data-card-actions]]:absolute [&_[data-card-actions]]:top-0 [&_[data-card-actions]]:right-0 [&_[data-card-actions]>button]:w-0 [&_[data-card-actions]>button]:h-0 [&_[data-card-actions]>button]:overflow-hidden [&_[data-card-actions]>button]:opacity-0`}
            containerClassName="!p-0"
            maxHeight={searchFocused ? "calc(100vh - 120px)" : "calc(100vh - 220px)"}
            renderCardHeader={({ item }: { item: any }) => {
              const phone = item.phone || "";
              const isVerified = item.verification_status === "verified";
              const isPending = item.status === "pending" || item.verification_status === "under_review" || item.verification_status === "sent";
              const isSuspended = item.status === "suspended";
              const isSelected = selected.some((c) => c.id === item.id);
              const dl = getDLStatus(item.dl_expiry);

              const dlToneClasses: Record<typeof dl.tone, string> = {
                emerald: "text-emerald-600 dark:text-emerald-400",
                amber: "text-amber-600 dark:text-amber-400",
                rose: "text-rose-600 dark:text-rose-400",
                muted: "text-[var(--color-ink-subtle)]",
              };

              const idStatus = isVerified
                ? { label: "ID verified", tone: "text-emerald-600 dark:text-emerald-400" }
                : isPending
                  ? { label: "ID pending", tone: "text-amber-600 dark:text-amber-400" }
                  : { label: "ID missing", tone: "text-[var(--color-ink-subtle)]" };

              return (
                <div
                  data-selection-zone
                  onTouchStart={handleTouchStart(item)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  // ✅ Removed background highlight & added select-none
                  className={`flex items-start gap-3 w-full py-3 border-b border-[var(--color-surface-border)]/50 last:border-b-0 transition-colors select-none ${
                    isSuspended
                      ? "opacity-50"
                      : "hover:bg-[var(--color-surface-hover)]/40"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--color-surface-hover)] flex items-center justify-center">
                      <SecureImage
                        src={item.avatar_image}
                        alt={item.full_name}
                        className="w-full h-full object-cover"
                        fallback={<UserIcon size={22} className="text-[var(--color-ink-subtle)]" />}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                        {item.full_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${idStatus.tone}`}>
                        <CreditCard size={11} className="flex-shrink-0" />
                        {idStatus.label}
                      </span>

                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${dlToneClasses[dl.tone]}`}>
                        <Car size={11} className="flex-shrink-0" />
                        {dl.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 min-w-0">
                      {phone ? (
                        <a
                          href={`tel:${phone.replace(/\s/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors min-w-0"
                        >
                          <Phone size={11} className="flex-shrink-0" />
                          <span className="truncate">{phone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--color-ink-subtle)] italic">No phone</span>
                      )}
                    </div>
                  </div>

                  {isSelecting && (
                    <div className="flex-shrink-0 self-center pl-1">
                      {isSelected ? (
                        <CheckCircle2 size={22} className="text-[var(--color-primary)]" strokeWidth={2.25} />
                      ) : (
                        <Circle size={22} className="text-[var(--color-ink-subtle)]" strokeWidth={1.5} />
                      )}
                    </div>
                  )}
                </div>
              );
            }}
            renderCardBody={() => null}
            rowActions={getClientActions}
            renderActionSheetBadge={(client: any) => {
              const style = CLIENT_STATUS_STYLES[client.status] || CLIENT_STATUS_STYLES.inactive;
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
        )}

        {/* ✅ FAB stack — z-65 sits above the PullUpNav drawer and grab area. 
            bottom-[108px] clears the nav bar (68px) + peek (24px) + breathing room. */}
        {!isSelecting && !searchFocused && (
          <div 
            data-fab-stack 
            className="fixed right-4 bottom-[108px] z-[65] flex flex-col items-end gap-3"
          >
            {/* Segment toggle */}
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

            {/* Add Client */}
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

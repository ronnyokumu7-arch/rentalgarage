// src/components/client/MobileClientsList.tsx
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
  BadgeCheck,
  Shield,
  Ban,
  Archive,
  Search,
  CheckCircle2,
  Circle,
  X,
  Plus,
  Building2,
  ChevronDown,
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

/**
 * ✅ Derive a friendly DL status from an ISO expiry date.
 * Returns one of: 'none' | 'expired' | 'expiring' | 'valid'
 * and a friendly label like "DL expired", "DL expires in 12 days", "DL valid".
 */
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

  const diffDays = Math.ceil(
    (expiry.getTime() - Date.now()) / 86_400_000,
  );

  if (diffDays < 0) {
    return { kind: "expired", label: "DL expired", tone: "rose" };
  }
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

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const longPressStartPos = useRef<{ x: number; y: number } | null>(null);

  const [segmentMenuOpen, setSegmentMenuOpen] = useState(false);
  const segmentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!segmentMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        segmentMenuRef.current &&
        !segmentMenuRef.current.contains(e.target as Node)
      ) {
        setSegmentMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [segmentMenuOpen]);

  const clearSelection = () => {
    setSelected([]);
    longPressFired.current = false;
  };

  const toggleSelection = (client: any) => {
    setSelected((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      if (exists) {
        return prev.filter((c) => c.id !== client.id);
      }
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
      if (!isSelecting) {
        setSelected([client]);
      } else {
        toggleSelection(client);
      }
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
      if (c.status === "active") {
        handleSuspend(c.id);
      }
    });
    clearSelection();
  };

  const handleBatchArchive = () => {
    if (selected.length === 0) return;
    selected.forEach((c) => handleArchive(c.id));
    clearSelection();
  };

  const segmentOptions: {
    id: ClientSegment;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: "individual", label: "Individual", icon: UserIcon },
    { id: "corporate", label: "Corporate", icon: Building2 },
  ];

  const activeSegment =
    segmentOptions.find((s) => s.id === activeTab) || segmentOptions[0];
  const SegmentIcon = activeSegment.icon;

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
      <div className="md:hidden -mx-4 animate-in fade-in duration-300 relative">
        {/* Toolbar */}
        <div className="px-4 py-3" data-selection-zone>
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
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
                  />
                </div>

                <div ref={segmentMenuRef} className="relative flex-shrink-0">
                  <button
                    onClick={() => setSegmentMenuOpen((v) => !v)}
                    className={`h-10 px-3 rounded-xl border flex items-center gap-1.5 transition-colors ${
                      segmentMenuOpen
                        ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10"
                        : "border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                    aria-label="Switch client type"
                    aria-haspopup="true"
                    aria-expanded={segmentMenuOpen}
                  >
                    <SegmentIcon
                      size={14}
                      className="text-[var(--color-ink-muted)]"
                      strokeWidth={2}
                    />
                    <span className="text-[11px] font-bold text-[var(--color-ink)]">
                      {activeSegment.label}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-[var(--color-ink-subtle)] transition-transform ${segmentMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {segmentMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      {segmentOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = activeTab === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              handleTabChange(opt.id);
                              setSegmentMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-colors ${
                              isActive
                                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                                : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                            }`}
                          >
                            <Icon size={14} strokeWidth={2} className="flex-shrink-0" />
                            <span className="flex-1 text-left">{opt.label}</span>
                            {isActive && (
                              <CheckCircle2 size={14} className="flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatusFilter(null)}
                    className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border ${
                      statusFilter === null || statusFilter === ""
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                        : "bg-[var(--color-surface)] text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    All
                  </button>
                  {statusOptions.map((opt) => {
                    const isActive = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-bold transition-colors border flex items-center gap-1.5 ${
                          isActive
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                            : "bg-[var(--color-surface)] text-[var(--color-ink-muted)] border-[var(--color-surface-border)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {opt.label}
                        <span
                          className={`text-[9px] font-extrabold tabular-nums ${
                            isActive ? "text-white/80" : "text-[var(--color-ink-subtle)]"
                          }`}
                        >
                          {opt.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {!isSelecting && !loading && pendingClients > 0 && statusFilter !== "pending" && (
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity text-xs font-semibold"
          >
            <ShieldAlert size={14} />
            {pendingClients} {pendingClients === 1 ? "client" : "clients"} awaiting your review
            <ArrowRight size={12} className="opacity-70" />
          </button>
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
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
              No clients found
            </h3>
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
            maxHeight="calc(100vh - 220px)"
            renderCardHeader={({ item }: { item: any }) => {
              const style =
                CLIENT_STATUS_STYLES[item.status] || CLIENT_STATUS_STYLES.inactive;
              const phone = item.phone || "";
              const isVerified = item.verification_status === "verified";
              const isSelected = selected.some((c) => c.id === item.id);
              const dl = getDLStatus(item.dl_expiry);

              // Tone → color classes for the DL chip and ID verified pill
              const dlToneClasses: Record<typeof dl.tone, string> = {
                emerald: "text-emerald-600 dark:text-emerald-400",
                amber: "text-amber-600 dark:text-amber-400",
                rose: "text-rose-600 dark:text-rose-400",
                muted: "text-[var(--color-ink-subtle)]",
              };

              return (
                <div
                  data-selection-zone
                  onTouchStart={handleTouchStart(item)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`flex items-start gap-3 w-full py-3 px-4 border-b border-[var(--color-surface-border)]/50 last:border-b-0 transition-colors ${
                    isSelected
                      ? "bg-[var(--color-primary)]/10"
                      : "hover:bg-[var(--color-surface-hover)]/40"
                  }`}
                >
                  {/* ✅ Avatar: 48px square, covers ~2 rows (name + compliance) */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--color-surface-hover)] flex items-center justify-center">
                      <SecureImage
                        src={item.avatar_image}
                        alt={item.full_name}
                        className="w-full h-full object-cover"
                        fallback={
                          <UserIcon size={22} className="text-[var(--color-ink-subtle)]" />
                        }
                      />
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${style.dot} ring-2 ring-[var(--color-surface)] shadow-sm`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Row 1: Name + verified check */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                        {item.full_name}
                      </span>
                      {isVerified && (
                        <BadgeCheck
                          size={14}
                          className="text-blue-500 flex-shrink-0"
                          fill="currentColor"
                          stroke="var(--color-surface)"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>

                    {/* ✅ Row 2: Compliance summary (ID verified · DL valid/expired/expires in x days) */}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {/* ID status */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                          item.id_number
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-[var(--color-ink-subtle)]"
                        }`}
                      >
                        <CreditCard size={10} className="flex-shrink-0" />
                        {item.id_number ? "ID verified" : "ID missing"}
                      </span>

                      <span className="text-[10px] text-[var(--color-ink-subtle)]">·</span>

                      {/* DL status */}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold ${dlToneClasses[dl.tone]}`}
                      >
                        <Car size={10} className="flex-shrink-0" />
                        {dl.label}
                      </span>
                    </div>

                    {/* ✅ Row 3: Phone */}
                    <div className="flex items-center gap-1.5 mt-1 min-w-0">
                      {phone ? (
                        <a
                          href={`tel:${phone.replace(/\s/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors min-w-0"
                        >
                          <Phone size={10} className="flex-shrink-0" />
                          <span className="truncate">{phone}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-[var(--color-ink-subtle)] italic">
                          No phone
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelecting && (
                    <div className="flex-shrink-0 self-center pl-1">
                      {isSelected ? (
                        <CheckCircle2
                          size={22}
                          className="text-[var(--color-primary)]"
                          strokeWidth={2.25}
                        />
                      ) : (
                        <Circle
                          size={22}
                          className="text-[var(--color-ink-subtle)]"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            }}
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
        )}

        {!isSelecting && (
          <button
            type="button"
            onClick={onAddClient}
            aria-label="Add Client"
            className="fixed right-4 bottom-20 z-40 w-14 h-14 rounded-xl bg-[var(--color-primary)]/20 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-primary)]/30 transition-all"
          >
            <div className="relative flex items-center justify-center">
              <UserIcon size={22} strokeWidth={2} className="text-[var(--color-primary)]" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-sm">
                <Plus size={10} strokeWidth={3.5} />
              </span>
            </div>
          </button>
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

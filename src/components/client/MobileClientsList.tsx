// src/components/client/MobileClientsList.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  Phone,
  Loader2,
  ShieldAlert,
  ArrowRight,
  UserIcon,
  Filter,
  MessageCircle,
  CreditCard,
  Car,
  BadgeCheck,
} from "lucide-react";
import { useState } from "react";
import CardGrid, { RowAction } from "@/components/ui/CardGrid";
import SecureImage from "@/components/ui/SecureImage";
import MobilePageToolbar from "@/components/ui/MobilePageToolbar";
import AddClientButton from "@/components/client/AddClientButton";
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
  mobileTabs: { id: string; label: string; icon: React.ElementType }[];
  toolbarTriggerIcon: React.ElementType;
  loading: boolean;
  filteredClients: any[];
  paginatedClients: any[];
  pendingClients: number;
  handleArchive: (id: number) => void;
  refetch: () => void;
}

export default function MobileClientsList({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  statusOptions,
  activeTab,
  handleTabChange,
  mobileTabs,
  toolbarTriggerIcon,
  loading,
  filteredClients,
  paginatedClients,
  pendingClients,
  handleArchive,
  refetch,
}: MobileClientsListProps) {
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
      <div className="md:hidden bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
        <div className="p-3 border-b border-[var(--color-surface-border)]">
          <MobilePageToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search clients..."
            segment={activeTab}
            onSegmentChange={(value) => handleTabChange(value)}
            segments={mobileTabs}
            segmentMenuMode="toggle"
            segmentTriggerIcon={toolbarTriggerIcon}
            filters={[
              {
                id: "client-status",
                label: "Status",
                options: statusOptions,
                value: statusFilter,
                onChange: setStatusFilter,
                icon: Filter,
              },
            ]}
            primaryAction={<AddClientButton />}
          />
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
              Viewing {filteredClients.length} pending{" "}
              {filteredClients.length === 1 ? "client" : "clients"}
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
            onCardClick={(client: any) => router.push(`/dashboard/clients/${client.id}`)}
            cardClassName="!p-0 !rounded-none !border-0 !bg-transparent !shadow-none hover:!bg-[var(--color-surface-hover)]/40 transition-colors"
            containerClassName="!p-0"
            maxHeight="calc(100vh - 180px)"
            renderCardHeader={({ item }: { item: any }) => {
              const style =
                CLIENT_STATUS_STYLES[item.status] || CLIENT_STATUS_STYLES.inactive;
              const dlExpiryDate = item.dl_expiry;
              const isDLValid = dlExpiryDate ? new Date(dlExpiryDate) > new Date() : false;
              const phone = item.phone || "";
              const isVerified = item.verification_status === "verified";

              return (
                <div className="flex items-start gap-3 w-full py-3 px-4 pr-10">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-[var(--color-surface-hover)] flex items-center justify-center">
                      <SecureImage
                        src={item.avatar_image}
                        alt={item.full_name}
                        className="w-full h-full object-cover"
                        fallback={
                          <UserIcon size={20} className="text-[var(--color-ink-subtle)]" />
                        }
                      />
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${style.dot} ring-2 ring-[var(--color-surface)] shadow-sm`}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    {/* Row 1: Name + Verification Badge */}
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

                    {/* Row 2: Phone */}
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

                    {/* Row 3: ID | DL with icons */}
                    {(item.id_number || item.dl_number) && (
                      <div className="flex items-center gap-2 mt-1 min-w-0 flex-wrap">
                        {item.id_number && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-ink-muted)] truncate">
                            <CreditCard size={10} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                            {item.id_number}
                          </span>
                        )}

                        {item.id_number && item.dl_number && (
                          <span className="text-[10px] text-[var(--color-ink-subtle)]">|</span>
                        )}

                        {item.dl_number && (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-mono truncate ${
                              isDLValid
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            <Car size={10} className="flex-shrink-0 opacity-80" />
                            {item.dl_number}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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

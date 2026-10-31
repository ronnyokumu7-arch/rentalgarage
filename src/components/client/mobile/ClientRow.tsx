// src/components/client/mobile/ClientRow.tsx
"use client";

import {
  Phone,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  Circle,
  BadgeCheck,
} from "lucide-react";
import {
  getInitials,
  getAvatarStatusClasses,
  getWhatsAppNumber,
  getDLStatus,
} from "./helpers";
import type { ClientListItem } from "./types";

interface ClientRowProps {
  client: ClientListItem;
  index: number;
  total: number;
  isSelected: boolean;
  isSelecting: boolean;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClick: () => void;
}

export default function ClientRow({
  client,
  index,
  total,
  isSelected,
  isSelecting,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClick,
}: ClientRowProps) {
  const phone = client.phone || "";
  const waNumber = getWhatsAppNumber(client.phone);
  const isVerified = client.verification_status === "verified";
  const isPending =
    client.status === "pending" ||
    client.verification_status === "under_review" ||
    client.verification_status === "sent";
  const isSuspended = client.status === "suspended";

  const dl = getDLStatus(client.dl_expiry);
  const hasExpiredDL = dl.kind === "expired";

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

  const avatarColors = getAvatarStatusClasses(client, hasExpiredDL);

  const renderDL = () => {
    if (dl.kind === "none") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-ink-subtle)]">
          <CreditCard size={11} className="flex-shrink-0" />
          DL not provided
        </span>
      );
    }

    if (dl.kind === "valid") {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CreditCard size={11} className="flex-shrink-0" />
          Driving License
          <BadgeCheck size={13} strokeWidth={2.25} className="flex-shrink-0" />
        </span>
      );
    }

    if (dl.kind === "expired") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
          <CreditCard size={11} className="flex-shrink-0" />
          DL expired
        </span>
      );
    }

    // expiring soon
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${dlToneClasses[dl.tone]}`}>
        <CreditCard size={11} className="flex-shrink-0" />
        {dl.label}
      </span>
    );
  };

  return (
    <div
      data-selection-zone
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      className={`relative flex items-start gap-3 w-full py-3 px-3 transition-colors select-none ${
        isSuspended
          ? "opacity-50"
          : "hover:bg-[var(--color-surface-hover)]/40"
      }`}
    >
      {index !== total - 1 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[var(--color-surface-border)] to-transparent" />
      )}

      {/* Avatar — tint communicates status */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm ${avatarColors}`}
        >
          {getInitials(client.full_name)}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
            {client.full_name}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${idStatus.tone}`}>
            <CreditCard size={11} className="flex-shrink-0" />
            {idStatus.label}
          </span>

          {renderDL()}
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {phone ? (
            <>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-colors text-[10px] font-bold text-[var(--color-ink)]"
              >
                <Phone size={10} className="text-[var(--color-ink-muted)] flex-shrink-0" />
                <span className="font-mono tracking-tight whitespace-nowrap">{phone}</span>
              </a>

              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-colors text-[10px] font-bold text-[var(--color-ink)]"
                >
                  <MessageCircle size={10} className="text-[var(--color-ink-muted)] flex-shrink-0" />
                  Message
                </a>
              )}
            </>
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
}

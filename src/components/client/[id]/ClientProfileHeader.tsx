// src/components/client/[id]/ClientProfileHeader.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Pencil,
  Check,
  Phone,
  MessageCircle,
  ShieldCheck,
  Car,
  MoreVertical,
  Archive,
  Ban,
} from "lucide-react";
import type { Client } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────
   Action types
────────────────────────────────────────────────────────────────────── */

export type ActionItem = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger" | "primary" | "success";
  disabled?: boolean;
  hidden?: boolean;
};

type CompactAction = {
  icon: React.ElementType;
  label: string;
  href: string;
  tone?: "default" | "success" | "primary";
};

/* ──────────────────────────────────────────────────────────────────────
   Action group (dropdown + compact buttons)
────────────────────────────────────────────────────────────────────── */

function ProfileActionGroup({
  actions,
  compact = [],
}: {
  actions: ActionItem[];
  compact?: CompactAction[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visibleActions = actions.filter((a) => !a.hidden);

  return (
    <div className="flex items-center gap-2">
      {compact.map((btn) => {
        const Icon = btn.icon;
        const toneClass =
          btn.tone === "success"
            ? "text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30"
            : btn.tone === "primary"
              ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30"
              : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]";
        return (
          <a
            key={btn.label}
            href={btn.href}
            target={btn.href.startsWith("http") ? "_blank" : undefined}
            rel={btn.href.startsWith("http") ? "noopener noreferrer" : undefined}
            title={btn.label}
            aria-label={btn.label}
            className={`w-10 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-center transition-all active:scale-95 ${toneClass}`}
          >
            <Icon size={18} />
          </a>
        );
      })}

      {visibleActions.length > 0 && (
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            title="More actions"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={open}
            className="w-10 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
          >
            <MoreVertical size={18} />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+6px)] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50"
            >
              <div className="py-1">
                {visibleActions.map((action, i) => {
                  const Icon = action.icon;
                  const toneClass =
                    action.tone === "danger"
                      ? "text-rose-600 hover:bg-rose-500/10"
                      : action.tone === "primary"
                        ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                        : action.tone === "success"
                          ? "text-emerald-600 hover:bg-emerald-500/10"
                          : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]";
                  const separator = action.tone === "danger" && i > 0;
                  return (
                    <div key={action.label}>
                      {separator && (
                        <div className="h-px bg-[var(--color-surface-border)] my-1" />
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpen(false);
                          action.onClick();
                        }}
                        disabled={action.disabled}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${toneClass}`}
                      >
                        <Icon size={14} className="shrink-0" />
                        <span className="flex-1 text-left">{action.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Header
────────────────────────────────────────────────────────────────────── */

interface ClientProfileHeaderProps {
  client: Client;
  actionLoading: boolean;
  onEditIdentity: () => void;
  onEditDriving: () => void;
  onReviewVerification: () => void;
  onSuspend: () => void;
  onReactivate: () => void;
  onArchive: () => void;
}

export default function ClientProfileHeader({
  client,
  actionLoading,
  onEditIdentity,
  onEditDriving,
  onReviewVerification,
  onSuspend,
  onReactivate,
  onArchive,
}: ClientProfileHeaderProps) {
  const isPending = client.status === "pending";
  const isUnderReview = client.verification_status === "under_review";
  const isSuspended = client.status === "suspended";

  const phoneDigits = (client.phone || "").replace(/[^\d+]/g, "");
  const compactActions: CompactAction[] = [];
  if (phoneDigits) {
    compactActions.push({
      icon: Phone,
      label: "Call client",
      href: `tel:${phoneDigits}`,
      tone: "primary",
    });
    compactActions.push({
      icon: MessageCircle,
      label: "WhatsApp client",
      href: `https://wa.me/${phoneDigits.replace(/^\+/, "")}`,
      tone: "success",
    });
  }

  const menuActions: ActionItem[] = [
    {
      icon: ShieldCheck,
      label: isUnderReview ? "Review Verification" : "Manage Verification",
      onClick: onReviewVerification,
      tone: "primary",
      hidden: !(isPending || isUnderReview || client.verification_status === "rejected"),
    },
    {
      icon: Pencil,
      label: "Edit Identity",
      onClick: onEditIdentity,
    },
    {
      icon: Car,
      label: "Edit Driving Details",
      onClick: onEditDriving,
    },
    {
      icon: isSuspended ? Check : Ban,
      label: isSuspended ? "Reactivate Client" : "Suspend Client",
      onClick: isSuspended ? onReactivate : onSuspend,
      tone: isSuspended ? "success" : "danger",
      disabled: actionLoading,
    },
    {
      icon: Archive,
      label: "Archive Client",
      onClick: onArchive,
      tone: "danger",
      disabled: actionLoading,
    },
  ];

  return <ProfileActionGroup actions={menuActions} compact={compactActions} />;
}

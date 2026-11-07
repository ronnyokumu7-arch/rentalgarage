"use client";

import React from "react";
import Link from "next/link";
import { getClientDisplayName } from "@/lib/client-name";
import {
  User,
  Phone,
  Envelope as Mail,
  ShieldCheck,
  Chat as MessageSquare,
  Buildings as Building2,
  Sparkle as Sparkles,
  CaretRight as ChevronRight
} from "@phosphor-icons/react/ssr";
import type { Booking } from "@/lib/types";

interface Props {
  booking: Booking;
}

export function ClientProfileWidget({ booking }: Props) {
  const client = booking.client;

  // Resolve display name prioritizing full_name or combined first/last name
  const clientName =
    getClientDisplayName(
      client?.full_name || [client?.first_name, client?.last_name].filter(Boolean).join(" "),
    ) || "Unassigned VIP Client";

  const clientEmail = client?.email || "No email on record";
  const clientPhone = client?.phone || "No phone on record";
  const clientCompany = client?.company_name || client?.company || "Private Individual";

  return (
    <div className="relative overflow-hidden p-6 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-3xl shadow-sm space-y-6">
      {/* Decorative Brand Accent Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-surface-border)] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-primary)]/5 text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-inner">
            <User size={22} aria-hidden="true" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--color-surface)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-ink-muted)]">
                Client Profile
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                <Sparkles size={10} aria-hidden="true" /> VIP Tier
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--color-ink)] tracking-tight mt-0.5">
              {clientName}
            </h2>
          </div>
        </div>

        {/* Security & Verification Status Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <ShieldCheck size={15} aria-hidden="true" />
          <span>Identity Verified</span>
        </div>
      </div>

      {/* Core Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Email Node */}
        <div className="p-4 rounded-2xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] transition-all hover:border-[var(--color-primary)]/30 group">
          <div className="flex items-center gap-2 text-[var(--color-ink-muted)] mb-1.5">
            <Mail size={14} className="group-hover:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Email Address</span>
          </div>
          <p className="text-xs font-bold text-[var(--color-ink)] truncate" title={clientEmail}>
            {clientEmail}
          </p>
        </div>

        {/* Phone Node */}
        <div className="p-4 rounded-2xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] transition-all hover:border-[var(--color-primary)]/30 group">
          <div className="flex items-center gap-2 text-[var(--color-ink-muted)] mb-1.5">
            <Phone size={14} className="group-hover:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Direct Line</span>
          </div>
          <p className="text-xs font-bold text-[var(--color-ink)] font-mono">
            {clientPhone}
          </p>
        </div>

        {/* Corporate / Entity Node */}
        <div className="p-4 rounded-2xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] transition-all hover:border-[var(--color-primary)]/30 group">
          <div className="flex items-center gap-2 text-[var(--color-ink-muted)] mb-1.5">
            <Building2 size={14} className="group-hover:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Organization</span>
          </div>
          <p className="text-xs font-bold text-[var(--color-ink)] truncate">
            {clientCompany}
          </p>
        </div>
      </div>

      {/* Premium Executive CTA Action Suite */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--color-surface-border)]">
        <div className="flex items-center gap-2">
          {/* Quick Call Action */}
          {client?.phone && (
            <a
              href={`tel:${client.phone}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-[var(--color-ink)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all shadow-sm active:scale-[0.98]"
            >
              <Phone size={13} aria-hidden="true" />
              Call Direct
            </a>
          )}

          {/* Quick Message Action */}
          {client?.phone && (
            <a
              href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-[var(--color-ink)] hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm active:scale-[0.98]"
            >
              <MessageSquare size={13} aria-hidden="true" />
              WhatsApp Dispatch
            </a>
          )}
        </div>

        {/* Full CRM Profile Deep Link */}
        {client?.id && (
          <Link
            href={`/dashboard/clients/${client.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl shadow-md shadow-[var(--color-primary)]/10 transition-all active:scale-[0.98] group"
          >
            <span>View Full CRM Profile</span>
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default ClientProfileWidget;

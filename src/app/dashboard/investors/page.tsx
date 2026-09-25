"use client";

import { useState } from "react";
import { UserPlus, Users, TrendingUp } from "lucide-react";
import InviteInvestorModal from "@/components/investor/InviteInvestorModal";

export default function AgencyInvestorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Users size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              Investors
            </h1>
          </div>
          <p className="ml-10 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
            Manage your host investors, track their vehicles, and oversee lease agreements.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-all shadow-sm"
        >
          <UserPlus size={16} />
          Invite Investor
        </button>
      </div>

      {/* Empty State / Placeholder */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={32} className="text-[var(--color-primary)]" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No Investors Yet</h3>
        <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto mb-6">
          Invite your first host investor to start expanding your fleet without upfront capital. They will receive a secure link to set up their profile and payout details.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-all"
        >
          <UserPlus size={16} />
          Invite Your First Investor
        </button>
      </div>

      {/* Modal */}
      <InviteInvestorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

// src/components/dashboard/ActionCenterWidget.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Undo2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import UpcomingRentalsTabContent from "@/components/dashboard/features/UpcomingRentalsTabContent";
import ReturningTodayTabContent from "@/components/dashboard/features/ReturningTodayTabContent";
import { useUpcomingRentalsTab } from "@/hooks/dashboard/features/useUpcomingRentalsTab";
import { useReturningTodayTab } from "@/hooks/dashboard/features/useReturningTodayTab";

type SubTab = "upcoming" | "returning";

const HEADER_COPY: Record<
  SubTab,
  { title: string; description: string; icon: LucideIcon }
> = {
  upcoming: {
    title: "Upcoming",
    description: "Track pending and confirmed bookings",
    icon: Calendar,
  },
  returning: {
    title: "Returning",
    description: "Cars returning within 24h",
    icon: Undo2,
  },
};

export default function ActionCenterWidget() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("upcoming");

  // ✅ Both hooks mount together — counts drive the toggle badge + smart default
  const { rentals, loading: upcomingLoading } = useUpcomingRentalsTab();
  const { returns, loading: returningLoading } = useReturningTodayTab();

  // ✅ SMART DEFAULT — one-shot. Runs after both hooks resolve their first load.
  const hasInitializedDefault = useRef(false);
  useEffect(() => {
    if (hasInitializedDefault.current) return;
    if (upcomingLoading || returningLoading) return;
    hasInitializedDefault.current = true;
    if (returns.length > 0) {
      setActiveSubTab("returning");
    }
  }, [upcomingLoading, returningLoading, returns.length]);

  const headerCopy = HEADER_COPY[activeSubTab];
  const HeaderIcon = headerCopy.icon;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-gradient-to-r from-[var(--color-surface-hover)]/50 to-transparent">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/80 flex items-center justify-center text-white shadow-sm shadow-[var(--color-primary)]/20 flex-shrink-0">
            <HeaderIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[var(--color-ink)] tracking-tight">
              {headerCopy.title}
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
              {headerCopy.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 sm:p-5 max-h-[560px]">
        {activeSubTab === "upcoming" && <UpcomingRentalsTabContent />}
        {activeSubTab === "returning" && <ReturningTodayTabContent />}
      </div>

      {/* ── FOOTER — Tab Switcher ───────────────────────────────────── */}
      {/* ✅ Added the surface-hover background to match Recent Activity */}
      <div className="px-3 py-2 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab("upcoming")}
            aria-label="Show upcoming rentals"
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold ${
              activeSubTab === "upcoming"
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Calendar size={12} />
            <span>Upcoming</span>
            {!upcomingLoading && rentals.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold tabular-nums leading-none ${
                  activeSubTab === "upcoming"
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                }`}
              >
                {rentals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("returning")}
            aria-label="Show returning rentals"
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold ${
              activeSubTab === "returning"
                ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
            }`}
          >
            <Undo2 size={12} />
            <span>Returning</span>
            {!returningLoading && returns.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold tabular-nums leading-none ${
                  activeSubTab === "returning"
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                }`}
              >
                {returns.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

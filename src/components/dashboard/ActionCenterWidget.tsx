// src/components/dashboard/ActionCenterWidget.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Calendar,
  Undo2,
  Loader2,
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
    title: "Upcoming Rentals",
    description: "Track pending and Confirmed bookings",
    icon: Calendar,
  },
  returning: {
    title: "Returning Today",
    // ✅ Shortened description to prevent truncation
    description: "Trips due within 24 hours",
    icon: Undo2,
  },
};

export default function ActionCenterWidget() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("upcoming");

  // ✅ Both hooks mount together — counts drive the toggle badge + smart default
  const { rentals, loading: upcomingLoading } = useUpcomingRentalsTab();
  const { returns, loading: returningLoading } = useReturningTodayTab();

  // ✅ SMART DEFAULT — one-shot. Runs after both hooks resolve their first load.
  // If anything needs returning (or is overdue) → default to Returning.
  // Otherwise → default to Upcoming. User's manual switch is never overridden.
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

  // ✅ Compute the "other" tab for the toggle button
  const otherTab: SubTab = activeSubTab === "upcoming" ? "returning" : "upcoming";
  const otherCopy = HEADER_COPY[otherTab];
  const otherCount = otherTab === "upcoming" ? rentals.length : returns.length;
  const otherLoading = otherTab === "upcoming" ? upcomingLoading : returningLoading;
  const OtherIcon = otherCopy.icon;

  const toggleSubTab = () => setActiveSubTab(otherTab);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-gradient-to-r from-[var(--color-surface-hover)]/50 to-transparent">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Title + description */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/80 flex items-center justify-center text-white shadow-sm shadow-[var(--color-primary)]/20 flex-shrink-0">
              <HeaderIcon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-[var(--color-ink)] tracking-tight flex items-center gap-1.5">
                {headerCopy.title}
                <Sparkles
                  size={13}
                  className="text-[var(--color-primary)] opacity-70 flex-shrink-0"
                />
              </h3>
              {/* ✅ Removed truncate, shortened text fits comfortably */}
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                {headerCopy.description}
              </p>
            </div>
          </div>

          {/* ✅ Compact toggle button — shows the OTHER tab */}
          <button
            type="button"
            onClick={toggleSubTab}
            title={`Switch to ${otherCopy.title}`}
            aria-label={`Switch to ${otherCopy.title}`}
            className="flex-shrink-0 flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]/50 hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)]/30 transition-all active:scale-95 cursor-pointer group"
          >
            <OtherIcon
              size={13}
              strokeWidth={2.25}
              className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0"
            />
            <span className="text-[11px] font-bold text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] transition-colors whitespace-nowrap">
              {otherCopy.title.split(" ")[0]}
            </span>
            {otherLoading ? (
              <Loader2
                size={10}
                className="animate-spin text-[var(--color-ink-subtle)] flex-shrink-0"
              />
            ) : otherCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[9px] font-extrabold tabular-nums flex-shrink-0 leading-none">
                {otherCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 sm:p-4 max-h-[560px] space-y-2.5">
        {activeSubTab === "upcoming" && <UpcomingRentalsTabContent />}
        {activeSubTab === "returning" && <ReturningTodayTabContent />}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <div className="px-5 py-2.5 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] text-center">
        <button
          onClick={() => router.push("/dashboard/bookings")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
        >
          View all Rentals
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// src/components/dashboard/ActionCenterWidget.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Calendar, Undo2 } from "lucide-react";
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
    description: "Confirmed and pending trips scheduled next",
    icon: Calendar,
  },
  returning: {
    title: "Returning Today",
    description: "Active trips due back within 24 hours",
    icon: Undo2,
  },
};

export default function ActionCenterWidget() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("upcoming");

  // ✅ Both hooks mount together — counts drive the badges + smart default
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

  const subTabs: {
    id: SubTab;
    label: string;
    count: number;
    loading: boolean;
  }[] = [
    { id: "upcoming", label: "Upcoming", count: rentals.length, loading: upcomingLoading },
    { id: "returning", label: "Returning", count: returns.length, loading: returningLoading },
  ];

  const headerCopy = HEADER_COPY[activeSubTab];
  const HeaderIcon = headerCopy.icon;

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-[var(--color-surface-border)] bg-gradient-to-r from-[var(--color-surface-hover)]/50 to-transparent">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)]/80 flex items-center justify-center text-white shadow-sm shadow-[var(--color-primary)]/20 flex-shrink-0">
              <HeaderIcon size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--color-ink)] tracking-tight flex items-center gap-1.5">
                {headerCopy.title}
                <Sparkles
                  size={13}
                  className="text-[var(--color-primary)] opacity-70 flex-shrink-0"
                />
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] truncate">
                {headerCopy.description}
              </p>
            </div>
          </div>

          {/* ✅ Full-width sub-tab switcher */}
          <SubTabSwitcher
            activeTab={activeSubTab}
            setActiveTab={setActiveSubTab}
            subTabs={subTabs}
          />
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

/* ──────────────────────────────────────────────────────────────────────
   Sub-tab switcher — full-width, sliding indicator, count badges.
   Radius scale matched to RecentActivityWidget's TimeFilterSwitcher:
     container → rounded-lg
     indicator → rounded-md
     buttons   → rounded-md
────────────────────────────────────────────────────────────────────── */

interface SubTabSwitcherProps {
  activeTab: SubTab;
  setActiveTab: (tab: SubTab) => void;
  subTabs: { id: SubTab; label: string; count: number; loading: boolean }[];
}

function SubTabSwitcher({ activeTab, setActiveTab, subTabs }: SubTabSwitcherProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (!activeEl) return;
      const rect = activeEl.getBoundingClientRect();
      const containerRect = activeEl.parentElement?.getBoundingClientRect();
      if (containerRect) {
        setIndicatorStyle({
          left: rect.left - containerRect.left,
          width: rect.width,
          top: rect.top - containerRect.top,
          height: rect.height,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="relative w-full">
      {indicatorStyle && (
        <div
          className="absolute z-0 rounded-md bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

      <div className="relative z-10 flex items-center gap-1 p-1 bg-[var(--color-surface-hover)]/50 rounded-lg border border-[var(--color-surface-border)]/50 flex-shrink-0 overflow-hidden w-full">
        {subTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-bold transition-all duration-300 whitespace-nowrap touch-manipulation cursor-pointer
                ${
                  isActive
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }
              `}
            >
              <span>{tab.label}</span>
              {!tab.loading && tab.count > 0 && (
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors
                    ${
                      isActive
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "bg-[var(--color-surface)] text-[var(--color-ink-muted)]"
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

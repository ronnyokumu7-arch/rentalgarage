// src/components/layout/BottomNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NavItem } from "@/lib/nav-config";

interface BottomNavProps {
  navItems: NavItem[];
}

export default function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href?: string, children?: { href: string }[]) => {
    if (children && children.length > 0) {
      return children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
    }
    if (!href) return false;
    if (href === "/dashboard" || href === "/super-admin") {
      return pathname === href || pathname === href + "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // ✅ Reorder items: Dashboard | Bookings | Fleet | Financials | Clients → More
  const reorderedItems = [...navItems].sort((a, b) => {
    const priority: Record<string, number> = {
      dashboard: 0,
      bookings: 1,
      fleet: 2,
      financials: 3,
      clients: 4,
    };
    const aKey = a.label.toLowerCase();
    const bKey = b.label.toLowerCase();
    return (priority[aKey] ?? 99) - (priority[bKey] ?? 99);
  });

  const mobileItems = reorderedItems.map((item) => {
    if (item.children && item.children.length > 0) {
      return { ...item, href: item.children[0].href, icon: item.icon };
    }
    return item;
  });

  // ✅ MOBILE 5-ITEM RULE: First 4 visible, rest in "More"
  const visibleItems = mobileItems.slice(0, 4);
  const moreItems = mobileItems.slice(4);

  return (
    <>
      {/* 
        ✅ ICONS-ONLY MOBILE BOTTOM NAV:
        - Tight Google-Maps-style capsule highlight (horizontal pill, not a tall square)
      */}
      <nav className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom,0px)] bg-[var(--color-surface)]/90 backdrop-blur-xl border-t border-[var(--color-surface-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon as LucideIcon;
          return (
            <Link
              key={item.label}
              href={item.href || "#"}
              className="flex items-center justify-center flex-1 h-full"
              aria-label={item.label}
            >
              {/* ✅ Capsule highlight: hugs the icon with just-right padding */}
              <div
                className={`flex items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
                  active
                    ? "text-[var(--color-primary)] bg-[var(--color-primary-muted)]/60"
                    : "text-[var(--color-ink-muted)]"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              </div>
            </Link>
          );
        })}

        {/* "More" Button */}
        {moreItems.length > 0 && (
          <button
            onClick={() => setShowMoreDrawer(true)}
            className="flex items-center justify-center flex-1 h-full"
            aria-label="More options"
          >
            <div
              className={`flex items-center justify-center px-4 py-2 rounded-full transition-all duration-200 ${
                moreItems.some((m) => isActive(m.href))
                  ? "text-[var(--color-primary)] bg-[var(--color-primary-muted)]/60"
                  : "text-[var(--color-ink-muted)]"
              }`}
            >
              <MoreHorizontal size={22} strokeWidth={1.8} />
            </div>
          </button>
        )}
      </nav>

      {/* 
        ✅ "MORE" DRAWER - CLEAN PREMIUM ICON GRID
        - Tightly wrapped premium icon boxes with text below.
      */}
      {mounted && showMoreDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMoreDrawer(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-[var(--color-surface)] rounded-t-2xl border-t border-[var(--color-surface-border)] pb-[env(safe-area-inset-bottom,0px)] animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-border)]">
              <span className="text-base font-bold text-[var(--color-ink)]">More</span>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="p-2 rounded-full bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-all active:scale-95"
                aria-label="Close"
              >
                <X size={18} strokeWidth={2} className="text-[var(--color-ink-muted)]" />
              </button>
            </div>

            {/* ✅ CLEAN PREMIUM ICON GRID (No bulky outer container) */}
            <div className="p-5 grid grid-cols-3 gap-y-6 gap-x-4">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon as LucideIcon;
                return (
                  <Link
                    key={item.label}
                    href={item.href || "#"}
                    onClick={() => setShowMoreDrawer(false)}
                    className="group flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      active
                        ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20"
                        : "bg-[var(--color-surface-hover)]/80 border border-[var(--color-surface-border)] text-[var(--color-primary)] group-hover:bg-[var(--color-surface-hover)] group-hover:scale-105 group-hover:border-[var(--color-primary)]/20"
                    }`}>
                      <Icon size={24} strokeWidth={active ? 2.2 : 1.8} />
                    </div>
                    <span className={`text-[11px] font-semibold text-center leading-tight ${
                      active ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]"
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

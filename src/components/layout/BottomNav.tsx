// src/components/layout/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import type { NavItem } from "@/lib/nav-config";

interface BottomNavProps {
  navItems: NavItem[];
}

/**
 * Display-label overrides — cosmetic only, doesn't touch nav-config.
 */
const DISPLAY_LABELS: Record<string, string> = {
  dashboard: "Home",
};

export default function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href?: string, children?: { href: string }[]) => {
    if (children && children.length > 0) {
      return children.some(
        (c) => pathname === c.href || pathname.startsWith(c.href + "/")
      );
    }
    if (!href) return false;
    if (href === "/dashboard" || href === "/super-admin") {
      return pathname === href || pathname === href + "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // ✅ Bottom-nav priority: Home · Bookings · Fleet · Clients
  // Financials lives one rank deeper and falls outside the 4-item slice.
  const reorderedItems = [...navItems].sort((a, b) => {
    const priority: Record<string, number> = {
      dashboard: 0,
      bookings: 1,
      fleet: 2,
      clients: 3,
      financials: 4,
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

  // ✅ FIXED 4-ITEM RULE — everything else lives in the topbar menu
  const visibleItems = mobileItems.slice(0, 4);

  const getDisplayLabel = (label: string) =>
    DISPLAY_LABELS[label.toLowerCase()] ?? label;

  return (
    <nav
      className="flex items-center justify-around h-[68px] px-2 pb-[env(safe-area-inset-bottom,0px)] bg-[var(--color-surface)]/90 backdrop-blur-xl border-t border-[var(--color-surface-border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      aria-label="Primary navigation"
    >
      {visibleItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon as LucideIcon;
        const displayLabel = getDisplayLabel(item.label);

        return (
          <Link
            key={item.label}
            href={item.href || "#"}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1"
            aria-label={displayLabel}
          >
            {/* Capsule highlight wraps the icon only */}
            <div
              className={`flex items-center justify-center px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                active
                  ? "text-[var(--color-primary)] bg-[var(--color-primary-muted)]/60"
                  : "text-[var(--color-ink-muted)]"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            </div>

            {/* Caption — color-only active state */}
            <span
              className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
                active
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-ink-muted)]"
              }`}
            >
              {displayLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

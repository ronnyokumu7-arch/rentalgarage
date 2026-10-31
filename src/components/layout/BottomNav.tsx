// src/components/layout/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import type { NavItem } from "@/lib/nav-config";

interface BottomNavProps {
  navItems: NavItem[];
}

const DISPLAY_LABELS: Record<string, string> = {
  dashboard: "Home",
};

/**
 * Mapping from route → accent color for the top border.
 * - Pages directly in the bottom nav use the four "primary" sections.
 * - Pages reachable via the PullUpNav (Tasks, Team, Drivers, Investors,
 *   Settings, Reports) each get their own color so the border changes
 *   when the user is inside one of them.
 */
const ROUTE_ACCENT: Array<{ match: string; color: string }> = [
  { match: "/dashboard/bookings", color: "var(--color-primary)" },
  { match: "/dashboard/fleet",    color: "var(--color-primary)" },
  { match: "/dashboard/clients",  color: "var(--color-primary)" },
  { match: "/dashboard",          color: "var(--color-primary)" },
  { match: "/dashboard/financials", color: "var(--color-primary)" },
  // ✅ PullUp nav pages — still tint the border so users know something is active
  { match: "/dashboard/users",     color: "var(--color-primary)" },
  { match: "/dashboard/drivers",   color: "var(--color-primary)" },
  { match: "/dashboard/investors", color: "var(--color-primary)" },
  { match: "/dashboard/tasks",     color: "var(--color-primary)" },
  { match: "/dashboard/settings",  color: "var(--color-primary)" },
  { match: "/dashboard/reports",   color: "var(--color-primary)" },
];

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

  const visibleItems = mobileItems.slice(0, 4);

  const getDisplayLabel = (label: string) =>
    DISPLAY_LABELS[label.toLowerCase()] ?? label;

  // ✅ Resolve the accent color: match against the current route
  const accentColor =
    ROUTE_ACCENT.find(({ match }) => pathname === match || pathname.startsWith(match + "/"))
      ?.color ?? "var(--color-ink-muted)";

  return (
    <div className="relative bg-[var(--color-surface)]/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <nav
        className="relative flex items-center justify-around h-[68px] px-2 pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Primary navigation"
      >
        {/* ✅ Feather-thin masked border — always visible, color reflects active route */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 transition-colors duration-300"
          style={{
            height: "0.5px",
            backgroundColor: accentColor,
            maskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            opacity: 0.8,
          }}
        />

        {visibleItems.map((item) => {
          const active = isActive(item.href, item.children);
          const Icon = item.icon as LucideIcon;
          const displayLabel = getDisplayLabel(item.label);

          return (
            <Link
              key={item.label}
              href={item.href || "#"}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1"
              aria-label={displayLabel}
            >
              <div
                className={`flex items-center justify-center px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                  active
                    ? "text-[var(--color-primary)] bg-[var(--color-primary-muted)]/60"
                    : "text-[var(--color-ink-muted)]"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              </div>

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
    </div>
  );
}

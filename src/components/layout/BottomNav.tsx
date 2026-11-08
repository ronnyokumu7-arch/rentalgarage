"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import type { NavItem } from "@/lib/nav-config";

interface BottomNavProps {
  navItems: NavItem[];
}

export default function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();

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

  // Flatten items for bottom nav (ignore groups for simplicity on mobile, or show first child)
  const mobileItems = navItems.map(item => {
    if (item.children && item.children.length > 0) {
      return { ...item, href: item.children[0].href, icon: item.icon };
    }
    return item;
  });

  return (
    <nav
      aria-label="Mobile navigation"
      className="flex h-16 w-full items-center justify-start gap-1 overflow-x-auto overscroll-x-contain px-2 bg-surface-card/90 backdrop-blur-xl border-t border-surface-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
    >
      {mobileItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon as LucideIcon;
        
        return (
          <Link
            key={item.label}
            href={item.href || "#"}
            className={`flex h-full w-16 shrink-0 flex-col items-center justify-center rounded-xl px-1 transition-all duration-200 ${
              active 
                ? "text-accent-dark bg-accent-bg/50" 
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} className="mb-1" />
            <span className={`whitespace-nowrap text-[10px] font-medium ${active ? "font-semibold" : ""}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

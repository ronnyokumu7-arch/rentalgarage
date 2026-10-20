// src/components/layout/PullUpNav.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import type { NavItem } from "@/lib/nav-config";
import { useAuth } from "@/context/auth-context";

interface PullUpNavProps {
  navItems: NavItem[];
}

const BAR_HEIGHT = 68;
const PEEK_VISIBLE = 32;
const DRAG_DEADZONE = 10;
const OPEN_HEIGHT_RATIO = 0.62;

const DISPLAY_LABELS: Record<string, string> = {
  dashboard: "Home",
};

export default function PullUpNav({ navItems }: PullUpNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  // ✅ Filter drawer items to exclude those already in the peek bar.
  // Priority order matches BottomNav so the same 4 items get sliced off.
  const reorderedItems = [...navItems].sort((a, b) => {
    const priority: Record<string, number> = {
      dashboard: 0, bookings: 1, fleet: 2, clients: 3, financials: 4,
    };
    return (priority[a.label.toLowerCase()] ?? 99) - (priority[b.label.toLowerCase()] ?? 99);
  });

  const peekItems = reorderedItems
    .map((item) =>
      item.children && item.children.length > 0
        ? { ...item, href: item.children[0].href, icon: item.icon }
        : item,
    )
    .slice(0, 4);

  const peekLabels = new Set(peekItems.map((i) => i.label.toLowerCase()));
  const drawerItems = navItems.filter(
    (item) => !peekLabels.has(item.label.toLowerCase()) && !item.hiddenOnMobile,
  );

  // ── State ──────────────────────────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [openHeight, setOpenHeight] = useState(0);
  const [travel, setTravel] = useState(0);

  const dragStartY = useRef<number | null>(null);
  const dragStartOffset = useRef(0);
  const dragging = useRef(false);
  const bodyLocked = useRef(false);

  useEffect(() => {
    setMounted(true);
    const compute = () => {
      const vh = window.innerHeight;
      const oh = Math.round(vh * OPEN_HEIGHT_RATIO);
      setOpenHeight(oh);
      setTravel(Math.max(oh - PEEK_VISIBLE, 120));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const isActive = useCallback(
    (href?: string, children?: { href: string }[]) => {
      if (children && children.length > 0) {
        return children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
      }
      if (!href) return false;
      if (href === "/dashboard" || href === "/super-admin") {
        return pathname === href || pathname === href + "/";
      }
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname],
  );

  useEffect(() => {
    setDragOffset(0);
  }, [pathname]);

  const getDisplayLabel = (label: string) =>
    DISPLAY_LABELS[label.toLowerCase()] ?? label;

  const lockBody = () => {
    if (bodyLocked.current) return;
    document.body.style.overflow = "hidden";
    bodyLocked.current = true;
  };

  const unlockBody = () => {
    if (!bodyLocked.current) return;
    document.body.style.overflow = "";
    bodyLocked.current = false;
  };

  useEffect(() => {
    return () => {
      if (bodyLocked.current) {
        document.body.style.overflow = "";
        bodyLocked.current = false;
      }
    };
  }, []);

  // ── Drag ───────────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    dragStartOffset.current = dragOffset;
    dragging.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const dy = dragStartY.current - e.clientY;

    if (!dragging.current && Math.abs(dy) > DRAG_DEADZONE) {
      dragging.current = true;
      lockBody();
    }
    if (!dragging.current) return;

    const next = Math.max(0, Math.min(travel, dragStartOffset.current + dy));
    setDragOffset(next);
    if (e.cancelable) e.preventDefault();
  };

  const handlePointerUp = () => {
    if (dragStartY.current === null) return;
    dragging.current = false;
    dragStartY.current = null;
    unlockBody();
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragging.current) {
      e.preventDefault();
      e.stopPropagation();
      dragging.current = false;
    }
  };

  const toggleOpen = () => {
    if (dragOffset >= travel / 2) setDragOffset(0);
    else setDragOffset(travel);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!mounted || openHeight === 0) return null;

  const translateY = travel - dragOffset;
  const isOpen = dragOffset > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 z-[58] bg-black/40 backdrop-blur-[2px]"
        style={{
          opacity: Math.min(1, dragOffset / Math.max(travel, 1)),
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={() => setDragOffset(0)}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <div
        className="lg:hidden fixed inset-x-0 z-[60] bg-[var(--color-surface)] border-t border-[var(--color-surface-border)] rounded-t-[28px] shadow-[0_-20px_60px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden"
        style={{
          bottom: BAR_HEIGHT,
          height: openHeight,
          transform: `translate3d(0, ${translateY}px, 0)`,
          transition: dragging.current
            ? "none"
            : "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
        }}
        aria-hidden={!isOpen}
      >
        {/* Peek strip — hint pill */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleOpen();
            }}
            className="flex items-center justify-center w-14 h-6"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            <span className="block w-10 h-1 rounded-full bg-[var(--color-ink-subtle)]/50" />
          </button>
        </div>

        {/* Header */}
        <div className="px-5 pb-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">
            Explore More
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
            {drawerItems.length + 1} items
          </span>
        </div>

        {/* Content — 3-column grid, bare icon + single label */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-8">
          <div className="grid grid-cols-3 gap-x-2 gap-y-6">
            {drawerItems.map((item) => {
              const active = isActive(item.href, item.children);
              const Icon = item.icon as LucideIcon;
              const href =
                item.href ??
                (item.children && item.children.length > 0
                  ? item.children[0].href
                  : "#");
              const label = getDisplayLabel(item.label);
              const caption = (item as any).description || label;

              return (
                <Link
                  key={item.label}
                  href={href}
                  className="group flex flex-col items-center gap-1.5 rounded-xl py-2 px-1 transition-colors active:bg-[var(--color-surface-hover)]/60"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.25 : 1.8}
                    className={`transition-colors ${
                      active
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]"
                    }`}
                  />

                  <span
                    className={`text-[11px] font-semibold leading-tight text-center truncate max-w-full ${
                      active
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-ink)]"
                    }`}
                  >
                    {caption}
                  </span>
                </Link>
              );
            })}

            {/* ✅ Logout Tile */}
            <button
              onClick={handleLogout}
              className="group flex flex-col items-center gap-1.5 rounded-xl py-2 px-1 transition-colors active:bg-[var(--color-surface-hover)]/60 cursor-pointer"
            >
              <LogOut
                size={22}
                strokeWidth={1.8}
                className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-danger)] transition-colors"
              />
              <span className="text-[11px] font-semibold leading-tight text-center truncate max-w-full text-[var(--color-ink-muted)] group-hover:text-[var(--color-danger)] transition-colors">
                Sign out
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Drag catch — over the peek strip only */}
      <div
        className="lg:hidden fixed inset-x-0 z-[63] touch-none"
        style={{
          bottom: BAR_HEIGHT,
          height: PEEK_VISIBLE,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
      />
    </>
  );
}

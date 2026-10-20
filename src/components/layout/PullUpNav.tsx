"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronUp, LogOut } from "lucide-react";
import type { NavItem } from "@/lib/nav-config";
import { useAuth } from "@/context/auth-context";

interface PullUpNavProps {
  navItems: NavItem[];
}

const BAR_HEIGHT = 68;
const PEEK_VISIBLE = 32;
const OPEN_HEIGHT_RATIO = 0.62;

const DISPLAY_LABELS: Record<string, string> = {
  dashboard: "Home",
};

export default function PullUpNav({ navItems }: PullUpNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

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

  const [mounted, setMounted] = useState(false);
  const [openHeight, setOpenHeight] = useState(0);
  const [travel, setTravel] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);

  const drawerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const hasMoved = useRef<boolean>(false);
  const isDragging = useRef<boolean>(false);
  const bodyLocked = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const compute = () => {
      const vh = window.innerHeight;
      const oh = Math.round(vh * OPEN_HEIGHT_RATIO);
      setOpenHeight(oh);
      const tr = Math.max(oh - PEEK_VISIBLE, 120);
      setTravel(tr);
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
    setCurrentOffset(0);
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

  // ✅ Signal to the rest of the app that the menu is open
  useEffect(() => {
    if (currentOffset > PEEK_VISIBLE + 10) {
      document.body.setAttribute("data-pullup-open", "true");
    } else {
      document.body.removeAttribute("data-pullup-open");
    }
    return () => {
      document.body.removeAttribute("data-pullup-open");
    };
  }, [currentOffset]);

  useEffect(() => {
    const drawer = drawerRef.current;
    const handle = dragHandleRef.current;
    if (!drawer || !handle) return;

    let startY = 0;
    let startOffset = 0;
    let rafId: number | null = null;
    let moved = false;
    let active = false;

    const updatePosition = (offset: number) => {
      const clamped = Math.max(0, Math.min(travel, offset));
      const translateY = travel - clamped;
      
      drawer.style.transition = "none";
      drawer.style.transform = `translate3d(0, ${translateY}px, 0)`;
      
      const content = drawer.querySelector('.drawer-content') as HTMLElement;
      if (content) {
        const op = Math.min(1, Math.max(0, (clamped - PEEK_VISIBLE) / 30));
        content.style.opacity = op.toString();
        content.style.pointerEvents = op > 0.5 ? "auto" : "none";
      }
    };

    const onPointerDown = (e: PointerEvent | TouchEvent) => {
      if (!handle.contains(e.target as Node)) return;
      
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      startY = clientY;
      startOffset = Math.max(0, Math.min(travel, currentOffset));
      moved = false;
      active = true;
      isDragging.current = true;
      
      if (rafId) cancelAnimationFrame(rafId);
      updatePosition(startOffset);
      
      lockBody();
      // ✅ Fixed: properly type the pointerId
      if ('pointerId' in e && typeof e.pointerId === 'number') {
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent | TouchEvent) => {
      if (!active) return;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dy = startY - clientY;

      if (Math.abs(dy) > 5 && !moved) {
        moved = true;
        hasMoved.current = true;
      }

      if (moved) {
        if (e.cancelable) e.preventDefault();
        const targetOffset = startOffset + dy;
        
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          updatePosition(targetOffset);
        });
      }
    };

    const onPointerUp = () => {
      if (!active) return;
      active = false;
      isDragging.current = false;
      unlockBody();
      if (rafId) cancelAnimationFrame(rafId);

      if (!moved) {
        const next = currentOffset >= travel / 2 ? 0 : travel;
        setCurrentOffset(next);
        drawer.style.transition = "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)";
        drawer.style.transform = `translate3d(0, ${travel - next}px, 0)`;
      } else {
        const style = window.getComputedStyle(drawer);
        const matrix = new DOMMatrixReadOnly(style.transform);
        const currentTranslate = matrix.m42;
        const currentDrawerOffset = travel - currentTranslate;
        
        const nextOffset = currentDrawerOffset >= travel / 2 ? travel : 0;
        setCurrentOffset(nextOffset);
        
        drawer.style.transition = "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)";
        drawer.style.transform = `translate3d(0, ${travel - nextOffset}px, 0)`;
        
        setTimeout(() => {
          const content = drawer.querySelector('.drawer-content') as HTMLElement;
          if (content) {
            const op = Math.min(1, Math.max(0, (nextOffset - PEEK_VISIBLE) / 30));
            content.style.opacity = op.toString();
            content.style.pointerEvents = op > 0.5 ? "auto" : "none";
          }
        }, 300);
      }
    };

    const onPointerCancel = () => {
      if (!active) return;
      active = false;
      moved = false;
      isDragging.current = false;
      unlockBody();
      
      if (rafId) cancelAnimationFrame(rafId);
      
      const next = currentOffset >= travel / 2 ? travel : 0;
      setCurrentOffset(next);
      drawer.style.transition = "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)";
      drawer.style.transform = `translate3d(0, ${travel - next}px, 0)`;
    };

    handle.addEventListener("pointerdown", onPointerDown as EventListener);
    window.addEventListener("pointermove", onPointerMove as EventListener, { passive: false });
    window.addEventListener("pointerup", onPointerUp as EventListener);
    window.addEventListener("pointercancel", onPointerCancel as EventListener);

    handle.addEventListener("touchstart", onPointerDown as EventListener, { passive: true });
    window.addEventListener("touchmove", onPointerMove as EventListener, { passive: false });
    window.addEventListener("touchend", onPointerUp as EventListener);
    window.addEventListener("touchcancel", onPointerCancel as EventListener);

    return () => {
      handle.removeEventListener("pointerdown", onPointerDown as EventListener);
      window.removeEventListener("pointermove", onPointerMove as EventListener);
      window.removeEventListener("pointerup", onPointerUp as EventListener);
      window.removeEventListener("pointercancel", onPointerCancel as EventListener);
      
      handle.removeEventListener("touchstart", onPointerDown as EventListener);
      window.removeEventListener("touchmove", onPointerMove as EventListener);
      window.removeEventListener("touchend", onPointerUp as EventListener);
      window.removeEventListener("touchcancel", onPointerCancel as EventListener);
    };
  }, [travel, currentOffset]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!mounted || openHeight === 0) return null;

  const translateY = travel - currentOffset;
  const isOpen = currentOffset > 0;

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 z-[58] bg-black/40 backdrop-blur-[2px]"
        style={{
          opacity: Math.min(1, currentOffset / Math.max(travel, 1)),
          pointerEvents: isOpen && !isDragging.current ? "auto" : "none",
          transition: "opacity 200ms ease-out",
        }}
        onClick={() => setCurrentOffset(0)}
        aria-hidden={!isOpen}
      />

      <div
        ref={drawerRef}
        data-pullup-drawer
        className="lg:hidden fixed inset-x-0 z-[60] bg-[var(--color-surface)] border-t border-[var(--color-surface-border)] rounded-t-[20px] shadow-[0_-20px_60px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden"
        style={{
          bottom: BAR_HEIGHT,
          height: openHeight,
          transform: `translate3d(0, ${translateY}px, 0)`,
          willChange: "transform",
          touchAction: "none",
        }}
        aria-hidden={!isOpen}
      >
        <div
          ref={dragHandleRef}
          className="relative flex items-center justify-center h-[32px] flex-shrink-0 cursor-grab active:cursor-grabbing select-none bg-[var(--color-bg-elevated)] rounded-t-[20px]"
        >
          {/* ✅ Hide "Explore more" when menu is open */}
          <div 
            className="absolute left-5 flex items-center gap-1.5 transition-opacity duration-300"
            style={{ 
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? "none" : "auto",
            }}
          >
            <span className="text-[11px] font-medium text-[var(--color-ink-muted)]">
              Explore more
            </span>
          </div>

          <div className="flex items-center justify-center w-14 h-full">
            <span className="block w-10 h-1 rounded-full bg-[var(--color-ink-faint)]" />
          </div>

          <div className="absolute right-5 flex items-center">
            <ChevronUp
              size={14}
              className="text-[var(--color-ink-subtle)] transition-transform duration-300"
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </div>
        </div>

        <div
          className="drawer-content flex flex-col flex-1 overflow-hidden"
          style={{
            opacity: Math.min(1, Math.max(0, (currentOffset - PEEK_VISIBLE) / 30)),
            pointerEvents: currentOffset > PEEK_VISIBLE + 15 ? "auto" : "none",
            transition: "opacity 200ms ease-out",
          }}
        >
          <div className="px-5 pt-4 pb-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">
              Quick Access
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
              {drawerItems.length + 1} items
            </span>
          </div>

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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      </div>
    </>
  );
}

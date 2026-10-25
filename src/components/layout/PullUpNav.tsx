// src/components/layout/PullUpNav.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronUp, ChevronRight, LogOut } from "lucide-react";
import type { NavItem } from "@/lib/nav-config";
import { useAuth } from "@/context/auth-context";

import {
  SettingsPanel,
  SettingsSubPanel,
  SettingsLeaf,
  FinancialsPanel,
  FinancialsLeaf,
} from "./pullup/SubPanels";

interface PullUpNavProps {
  navItems: NavItem[];
}

const BAR_HEIGHT = 68;
const PEEK_VISIBLE = 32;
const NORMAL_HEIGHT_RATIO = 0.62;
const FULL_HEIGHT_RATIO = 0.95;

const DISPLAY_LABELS: Record<string, string> = {
  dashboard: "Home",
};

export default function PullUpNav({ navItems }: PullUpNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  const [panelStack, setPanelStack] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [openHeight, setOpenHeight] = useState(0);
  const [travel, setTravel] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartY = useRef(0);
  const dragStartOffset = useRef(0);
  const hasMoved = useRef(false);

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

  const currentPanel = panelStack[panelStack.length - 1] || null;
  const parts = currentPanel?.split(":") ?? [];
  const level = parts.length;
  const isSettingsLeaf = parts[0] === "settings" && level === 3;

  useEffect(() => {
    setMounted(true);
    const compute = () => {
      const vh = window.innerHeight;
      const ratio = isSettingsLeaf ? FULL_HEIGHT_RATIO : NORMAL_HEIGHT_RATIO;
      const oh = Math.round(vh * ratio);
      setOpenHeight(oh);
      setTravel(Math.max(oh - PEEK_VISIBLE, 120));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [isSettingsLeaf]);

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

  const closeDrawer = useCallback(() => {
    setCurrentOffset(0);
  }, []);

  useEffect(() => {
    setPanelStack([]);
    setCurrentOffset(0);
  }, [pathname, searchParams]);

  const getDisplayLabel = (label: string) =>
    DISPLAY_LABELS[label.toLowerCase()] ?? label;

  useEffect(() => {
    if (currentOffset > PEEK_VISIBLE + 10) {
      document.body.setAttribute("data-pullup-open", "true");
    } else {
      document.body.removeAttribute("data-pullup-open");
    }
    return () => document.body.removeAttribute("data-pullup-open");
  }, [currentOffset]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    dragStartY.current = touch.clientY;
    dragStartOffset.current = currentOffset;
    hasMoved.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const dy = dragStartY.current - touch.clientY;
    if (Math.abs(dy) > 4) hasMoved.current = true;
    if (!hasMoved.current) return;

    const next = Math.max(0, Math.min(travel, dragStartOffset.current + dy));
    setCurrentOffset(next);

    if (e.cancelable) e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // ✅ Tap: toggle based on current state
    if (!hasMoved.current) {
      setCurrentOffset((prev) => (prev >= travel / 2 ? 0 : travel));
      return;
    }

    // ✅ Drag: snap to nearest edge
    setCurrentOffset((prev) => (prev >= travel / 2 ? travel : 0));
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!mounted || openHeight === 0) return null;

  const translateY = travel - currentOffset;
  const isOpen = currentOffset > 0;

  const pushPanel = (panel: string) => setPanelStack((p) => [...p, panel]);
  const popPanel = () => setPanelStack((p) => p.slice(0, -1));

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    const label = item.label.toLowerCase();
    if (label === "settings") {
      e.preventDefault();
      pushPanel("settings");
    } else if (label === "financials") {
      e.preventDefault();
      pushPanel("financials");
    }
  };

  let content;

  if (currentPanel === "settings") {
    // ✅ FIXED: Added onClose={closeDrawer} so Profile Settings can dismiss the sheet
    content = <SettingsPanel onBack={popPanel} onNavigate={pushPanel} onClose={closeDrawer} />;
  } else if (parts[0] === "settings" && level === 2) {
    content = (
      <SettingsSubPanel
        tabId={parts[1]}
        onBack={popPanel}
        onNavigate={pushPanel}
        onClose={closeDrawer}
      />
    );
  } else if (parts[0] === "settings" && level === 3) {
    content = <SettingsLeaf moduleId={parts[2]} onBack={popPanel} />;
  } else if (currentPanel === "financials") {
    content = <FinancialsPanel onBack={popPanel} onNavigate={pushPanel} />;
  } else if (parts[0] === "financials" && level === 2) {
    content = <FinancialsLeaf tabId={parts[1]} onClose={closeDrawer} />;
  } else {
    content = (
      <>
        <div className="px-5 pt-4 pb-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-[var(--color-ink)] tracking-tight">
            Business Tools
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
              const href = item.href ?? (item.children?.[0]?.href || "#");
              const label = getDisplayLabel(item.label);
              const caption = (item as any).description || label;
              const hasSubPanel = label === "Settings" || label === "Financials";

              return (
                <Link
                  key={item.label}
                  href={href}
                  onClick={(e) => handleItemClick(e, item)}
                  className="group flex flex-col items-center gap-1.5 rounded-xl py-2 px-1 transition-colors active:bg-[var(--color-surface-hover)]/60"
                >
                  <div className="relative">
                    <Icon
                      size={22}
                      strokeWidth={active ? 2.25 : 1.8}
                      className={`transition-colors ${
                        active
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]"
                      }`}
                    />
                    {hasSubPanel && (
                      <ChevronRight
                        size={10}
                        className="absolute -bottom-1 -right-1 text-[var(--color-ink-subtle)] bg-[var(--color-surface)] rounded-full"
                      />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold leading-tight text-center truncate max-w-full ${
                      active ? "text-[var(--color-primary)]" : "text-[var(--color-ink)]"
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
      </>
    );
  }

  return (
    <>
      <div
        className="lg:hidden fixed inset-0 z-[58] bg-black/40 backdrop-blur-[2px]"
        style={{
          opacity: Math.min(1, currentOffset / Math.max(travel, 1)),
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 200ms ease-out",
        }}
        onClick={closeDrawer}
        aria-hidden={!isOpen}
      />

      <div
        className="lg:hidden fixed inset-x-0 z-[60] bg-[var(--color-surface)] border-t border-[var(--color-surface-border)] rounded-t-[20px] shadow-[0_-20px_60px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden"
        style={{
          bottom: BAR_HEIGHT,
          height: openHeight,
          transform: `translate3d(0, ${translateY}px, 0)`,
          willChange: "transform",
          transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden={!isOpen}
      >
        <div
          className="relative flex items-center justify-center h-[32px] flex-shrink-0 cursor-grab active:cursor-grabbing select-none bg-[var(--color-bg-elevated)] rounded-t-[20px]"
          style={{ touchAction: "none" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute left-5 flex items-center gap-1.5 pointer-events-none">
            <span className="text-[11px] font-medium text-[var(--color-ink-muted)]">
              More Options
            </span>
          </div>
          <div className="flex items-center justify-center w-14 h-full pointer-events-none">
            <span className="block w-10 h-1 rounded-full bg-[var(--color-ink-faint)]" />
          </div>
          <div className="absolute right-5 flex items-center pointer-events-none">
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
          {content}
        </div>
      </div>
    </>
  );
}

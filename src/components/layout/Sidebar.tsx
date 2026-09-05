// src/components/layout/Sidebar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ChevronRight, LogOut, Settings, X, type LucideIcon,
  Sparkles, Shield, LayoutDashboard, Users, Car,
  Calendar, FileText, HelpCircle, BarChart3
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { NavItem } from "@/lib/nav-config";

interface SidebarProps {
  navItems: NavItem[];
  isMobile?: boolean;
  onClose?: () => void;
}

// ── Icon mapping for consistent icons ──────────────────────────
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  clients: Users,
  vehicles: Car,
  bookings: Calendar,
  calendar: Calendar,
  invoices: FileText,
  settings: Settings,
  help: HelpCircle,
  analytics: BarChart3,
  shield: Shield,
};

function getIcon(iconName?: string): LucideIcon | null {
  if (!iconName) return null;
  return iconMap[iconName] || null;
}

export default function Sidebar({ navItems, isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tenant, logout } = useAuth();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState<number>(0);
  const [hoveredItem, setHoveredItem] = useState<{ label: string; top: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handle(e: MouseEvent) {
      const target = e.target as Node;
      const isInsideSidebar = sidebarRef.current?.contains(target);
      const isInsideFlyout = flyoutRef.current?.contains(target);

      if (!isInsideSidebar && !isInsideFlyout) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    setOpenGroup(null);
    setHoveredItem(null);
  }, [pathname]);

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

  const handleGroupClick = (label: string, el: HTMLButtonElement | null) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setFlyoutPos(rect.top);
    setOpenGroup(openGroup === label ? null : label);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const openGroupItem = navItems.find((i) => i.label === openGroup);
  const settingsItem = navItems.find((item) => item.label === "Settings");
  const regularNavItems = navItems.filter((item) => item.label !== "Settings");

  const fullName = user?.full_name || user?.email || "User";
  const userInitial = fullName.charAt(0).toUpperCase();
  const companyName = tenant?.name || "Agency";

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`relative z-30 flex flex-col flex-shrink-0 
                   bg-[var(--color-bg)] 
                   border-r border-[var(--color-surface-border)] 
                   transition-colors duration-300
                   ${isMobile ? 'w-72 h-full' : 'h-full w-20'}`}
      >
        {/* ── Logo & Mobile Close Button ──────────────────────────────────── */}
        <div className="h-16 flex items-center justify-between px-4 flex-shrink-0 border-b border-[var(--color-surface-border)]">
          <Link href="/dashboard" className="group" onClick={() => isMobile && onClose?.()}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px] text-white tracking-tight select-none bg-gradient-brand shadow-lg shadow-primary/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/40">
              RG
            </div>
          </Link>
          
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink-primary)] hover:bg-[var(--color-surface-hover)] transition-all"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <nav className="flex-1 flex flex-col gap-1.5 px-3 py-4 overflow-y-auto custom-scrollbar">
          {regularNavItems.map((item) => {
            const active = isActive(item.href, item.children);
            const isGroupOpen = openGroup === item.label;
            
            let Icon: LucideIcon | null = null;
            if (typeof item.icon === 'string') {
              Icon = getIcon(item.icon);
            } else if (item.icon) {
              Icon = item.icon as LucideIcon;
            }

            return (
              <div key={item.label} className="relative group/nav">
                {item.href && !item.children ? (
                  <Link
                    href={item.href}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredItem({ label: item.label, top: rect.top });
                      }
                    }}
                    onMouseLeave={() => !isMobile && setHoveredItem(null)}
                    onClick={() => isMobile && onClose?.()}
                    className={`relative flex items-center justify-center ${
                      isMobile ? 'justify-start gap-3 px-4 h-12' : 'w-full h-12'
                    } rounded-xl transition-all duration-200 outline-none group/btn ${
                      active
                        ? "text-[var(--color-primary)] bg-[var(--color-primary-muted)]"
                        : "text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-primary)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    {!isMobile && active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--color-primary)] shadow-lg shadow-primary/30" />
                    )}
                    {Icon && (
                      <Icon
                        size={20}
                        strokeWidth={active ? 2 : 1.8}
                        className={`transition-all duration-200 ${
                          isMobile ? 'flex-shrink-0' : ''
                        } ${active ? 'text-[var(--color-primary)]' : ''}`}
                      />
                    )}
                    {isMobile && (
                      <span className={`text-sm font-medium ${
                        active ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink)]'
                      }`}>
                        {item.label}
                      </span>
                    )}
                    {!isMobile && active && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-bg)]" />
                    )}
                  </Link>
                ) : (
                  <button
                    ref={(el) => {
                      buttonRefs.current[item.label] = el;
                    }}
                    onClick={() => isMobile ? router.push(item.children?.[0]?.href || '#') : handleGroupClick(item.label, buttonRefs.current[item.label])}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredItem({ label: item.label, top: rect.top });
                      }
                    }}
                    onMouseLeave={() => !isMobile && setHoveredItem(null)}
                    className={`relative flex items-center justify-center ${
                      isMobile ? 'justify-start gap-3 px-4 h-12' : 'w-full h-12'
                    } rounded-xl transition-all duration-200 outline-none group/btn ${
                      isGroupOpen || active
                        ? "text-[var(--color-primary)] bg-[var(--color-primary-muted)]"
                        : "text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-primary)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    {!isMobile && (isGroupOpen || active) && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--color-primary)] shadow-lg shadow-primary/30" />
                    )}
                    {Icon && (
                      <Icon
                        size={20}
                        strokeWidth={isGroupOpen || active ? 2 : 1.8}
                        className={`transition-all duration-200 ${
                          isMobile ? 'flex-shrink-0' : ''
                        } ${isGroupOpen || active ? 'text-[var(--color-primary)]' : ''}`}
                      />
                    )}
                    {isMobile && (
                      <>
                        <span className={`text-sm font-medium ${
                          isGroupOpen || active ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink)]'
                        }`}>
                          {item.label}
                        </span>
                        <ChevronRight size={16} className={`ml-auto ${
                          isGroupOpen || active ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink-subtle)]'
                        }`} />
                      </>
                    )}
                    {!isMobile && (
                      <span
                        className={`absolute bottom-1.5 right-1.5 w-[5px] h-[5px] rounded-full transition-all ${
                          isGroupOpen || active
                            ? "bg-[var(--color-primary)]"
                            : "bg-[var(--color-ink-subtle)]"
                        }`}
                      />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Bottom Section: User Profile (Mobile Only) + Settings & Logout ── */}
        <div className={`px-3 pb-4 flex-shrink-0 space-y-1.5 border-t border-[var(--color-surface-border)] pt-3`}>
          
          {/* User Profile Card (Mobile Only) */}
          {isMobile && (
            <div className="mb-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 flex-shrink-0">
                  {userInitial}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--color-ink)] truncate leading-tight">
                    {fullName}
                  </p>
                  <p className="text-[10px] font-medium text-[var(--color-ink-muted)] truncate">
                    {companyName}
                  </p>
                </div>
                
                <Link 
                  href={user?.role === "super_admin" ? `/super-admin/users/${user?.id}` : `/dashboard/users/${user?.id}`}
                  onClick={() => isMobile && onClose?.()}
                  className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-primary)] transition-all"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {settingsItem && (
            <Link
              href={settingsItem.href || "#"}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({ label: settingsItem.label, top: rect.top });
                }
              }}
              onMouseLeave={() => !isMobile && setHoveredItem(null)}
              onClick={() => isMobile && onClose?.()}
              className={`relative flex items-center justify-center ${
                isMobile ? 'justify-start gap-3 px-4' : 'w-full'
              } h-11 rounded-xl transition-all duration-200 outline-none group/btn ${
                isActive(settingsItem.href)
                  ? "text-[var(--color-primary)] bg-[var(--color-primary-muted)]"
                  : "text-[var(--color-ink-subtle)] hover:text-[var(--color-ink-primary)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <Settings
                size={18}
                strokeWidth={isActive(settingsItem.href) ? 2 : 1.8}
                className={`transition-all duration-500 ${
                  isActive(settingsItem.href) ? 'text-[var(--color-primary)]' : ''
                } ${!isMobile && 'group-hover/btn:rotate-[180deg] group-hover/btn:scale-110'}`}
              />
              {isMobile && (
                <span className={`text-sm font-medium ${
                  isActive(settingsItem.href) ? 'text-[var(--color-primary)]' : 'text-[var(--color-ink)]'
                }`}>
                  Settings
                </span>
              )}
            </Link>
          )}

          <button
            onClick={handleLogout}
            className={`group/logout relative flex items-center justify-center ${
              isMobile ? 'justify-start gap-3 px-4' : 'w-full'
            } h-11 rounded-xl text-[var(--color-ink-subtle)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-all duration-300`}
            title="Sign out"
          >
            <LogOut 
              size={18} 
              strokeWidth={1.8} 
              className={`relative z-10 transition-transform duration-300 ${
                !isMobile && 'group-hover/logout:translate-x-0.5'
              }`}
            />
            {isMobile && <span className="text-sm font-medium">Sign out</span>}
            {!isMobile && (
              <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--color-danger)] scale-x-0 transition-transform duration-300 group-hover/logout:scale-x-100" />
            )}
          </button>
        </div>
      </aside>

      {/* ── PORTAL: Tooltip (Desktop Only) ────────────────────────────────── */}
      {!isMobile && mounted && hoveredItem && !openGroup && createPortal(
        <div
          className="pointer-events-none fixed whitespace-nowrap text-[11px] font-bold px-3 py-1.5 rounded-lg z-[9999] 
                     bg-[var(--color-ink-primary)] text-[var(--color-surface)]
                     shadow-[var(--shadow-dropdown)] animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: "84px",
            top: `${hoveredItem.top}px`,
            transform: "translateY(-50%)",
          }}
        >
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--color-ink-primary)]" />
          {hoveredItem.label}
        </div>,
        document.body
      )}

      {/* ── PORTAL: Flyout Panel (Desktop Only) ───────────────────────────── */}
      {!isMobile && mounted && openGroup && openGroupItem?.children && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenGroup(null)} />
          <div
            ref={flyoutRef}
            className="fixed z-[9999] w-[280px] overflow-y-auto animate-in slide-in-from-left-2 fade-in duration-200 custom-scrollbar"
            style={{
              left: "84px",
              top: `${flyoutPos}px`,
              maxHeight: "calc(100vh - 4rem)",
            }}
          >
            <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-dropdown)] backdrop-blur-xl">
              {/* Flyout Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--color-surface-border)]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20">
                  {openGroupItem.icon && (() => {
                    let Icon: LucideIcon | null = null;
                    if (typeof openGroupItem.icon === 'string') {
                      Icon = getIcon(openGroupItem.icon);
                    } else {
                      Icon = openGroupItem.icon as LucideIcon;
                    }
                    return Icon ? <Icon size={16} strokeWidth={1.5} className="text-[var(--color-primary)]" /> : null;
                  })()}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-primary)]">
                  {openGroupItem.label}
                </p>
                <Sparkles size={12} className="text-[var(--color-primary)] ml-auto opacity-40" />
              </div>

              {/* Flyout Items */}
              <div className="space-y-1">
                {openGroupItem.children.map((child) => {
                  const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                  let ChildIcon: LucideIcon | null = null;
                  if (typeof (child as any).icon === 'string') {
                    ChildIcon = getIcon((child as any).icon);
                  } else if ((child as any).icon) {
                    ChildIcon = (child as any).icon as LucideIcon;
                  }
                  
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group/child ${
                        childActive
                          ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                          : "text-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink-primary)]"
                      }`}
                    >
                      {ChildIcon && (
                        <ChildIcon
                          size={16}
                          strokeWidth={1.5}
                          className={`flex-shrink-0 ${
                            childActive ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"
                          }`}
                        />
                      )}
                      <span className="flex-1">{child.label}</span>
                      {childActive && (
                        <ChevronRight size={14} strokeWidth={2.5} className="text-[var(--color-primary)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

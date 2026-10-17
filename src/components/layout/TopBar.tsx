// src/components/layout/TopBar.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, Sun, Moon, User, Settings, Bell,
  LogOut, ChevronRight, Command, Briefcase,
  MoreVertical, Sparkles, X, HelpCircle, Shield,
  CreditCard, Users, CalendarDays, Car, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import MobileSearchModal from "@/components/search/MobileSearchModal";
import DesktopSearchDropdown from "@/components/search/DesktopSearchDropdown";

interface TopbarProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

interface SearchScope {
  id: string;
  label: string;
  placeholder: string;
  icon?: React.ElementType;
  isBrand?: boolean;
}

const SEARCH_SCOPES: SearchScope[] = [
  { id: "all", label: "All", placeholder: "Search anything...", isBrand: true },
  { id: "clients", label: "Clients", placeholder: "Search clients...", icon: Users },
  { id: "bookings", label: "Bookings", placeholder: "Search bookings...", icon: CalendarDays },
  { id: "fleet", label: "Fleet", placeholder: "Search fleet...", icon: Car },
];

export default function Topbar({ onMenuToggle, isMobileMenuOpen = false }: TopbarProps) {
  const { user, tenant, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showScopeMenu, setShowScopeMenu] = useState(false);
  const [activeScope, setActiveScope] = useState<SearchScope>(SEARCH_SCOPES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isCurrentlyDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(isCurrentlyDark);
    if (isCurrentlyDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    if (scopeRef.current && !scopeRef.current.contains(e.target as Node)) setShowScopeMenu(false);
    if (
      desktopSearchRef.current &&
      !desktopSearchRef.current.contains(e.target as Node)
    ) {
      setDesktopDropdownOpen(false);
    }
  }, []);

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowUserMenu(false);
      setShowScopeMenu(false);
      setDesktopDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!showUserMenu && !showScopeMenu && !desktopDropdownOpen) return;
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showUserMenu, showScopeMenu, desktopDropdownOpen, handleClickOutside, handleEscapeKey]);

  useEffect(() => {
    setShowUserMenu(false);
    setShowScopeMenu(false);
    setMobileSearchOpen(false);
    setDesktopDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        if (searchQuery.trim().length > 0) setDesktopDropdownOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    const scope = activeScope.id === "all" ? "" : `&scope=${activeScope.id}`;
    setDesktopDropdownOpen(false);
    router.push(`/dashboard/search?q=${encodeURIComponent(q)}${scope}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const companyName = user?.role === "super_admin" ? "Rental Garage" : tenant?.name || "Agency";
  const isSuperAdmin = user?.role === "super_admin";
  const fullName = user?.full_name || user?.email || "User";

  const tenantLogoUrl = tenant?.profile?.logo_url || null;

  const renderAvatar = (size: "md" | "lg") => {
    const dims = { md: "w-9 h-9", lg: "w-12 h-12" };
    const iconSizes = { md: 16, lg: 22 };

    if (user?.avatar_url) {
      return (
        <img
          src={user.avatar_url}
          alt={fullName}
          className={`${dims[size]} rounded-full object-cover border border-surface-border`}
        />
      );
    }

    return (
      <div
        className={`${dims[size]} rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 ring-2 ring-surface`}
      >
        <User size={iconSizes[size]} className="text-white" strokeWidth={2} />
      </div>
    );
  };

  const renderRoleIcon = (role?: string) => {
    if (!role) return <Briefcase size={12} className="text-ink-subtle" />;
    const roleLower = role.toLowerCase();
    if (roleLower.includes("admin") || roleLower.includes("super")) {
      return <Shield size={12} className="text-primary" />;
    }
    if (roleLower.includes("manager") || roleLower.includes("owner")) {
      return <Briefcase size={12} className="text-primary" />;
    }
    return <User size={12} className="text-ink-subtle" />;
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return "User";
    const roleLower = role.toLowerCase();
    if (roleLower.includes("super_admin") || roleLower.includes("superadmin")) return "Super Admin";
    if (roleLower.includes("tenant_admin") || roleLower.includes("admin")) return "Admin";
    if (roleLower.includes("manager")) return "Manager";
    return role.replace("_", " ");
  };

  const renderScopeMark = (scope: SearchScope, size: number = 13) => {
    if (scope.isBrand) {
      return (
        <span
          className="text-primary font-black flex items-center justify-center flex-shrink-0"
          style={{
            fontSize: `${size + 1}px`,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          RG
        </span>
      );
    }
    if (scope.icon) {
      const Icon = scope.icon;
      return (
        <Icon
          size={size}
          strokeWidth={2.25}
          className="flex-shrink-0 text-primary"
        />
      );
    }
    return <Sparkles size={size} strokeWidth={2.25} className="flex-shrink-0 text-primary" />;
  };

  return (
    <>
      <header className="h-14 sm:h-16 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 sticky top-0 z-30 bg-bg transition-all duration-300">

        {/* ── LEFT: System Brand ──────────────────────────────────────────── */}
        <Link href="/dashboard" className="flex flex-col justify-center flex-shrink-0 min-w-0">
          <span className="text-sm font-medium text-ink tracking-tight leading-tight">
            Rental<span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]">Garage</span>
          </span>
          <span className="text-[10px] text-ink-muted leading-tight mt-0.5 truncate">
            Car rental business manager
          </span>
        </Link>

        {/* ── CENTER: Search Bar (desktop only) ───────────────────────────── */}
        <div className="hidden sm:flex flex-1 max-w-[864px] mx-auto">
          <div
            ref={desktopSearchRef}
            className={`relative w-full transition-transform duration-300 origin-center ${searchFocused ? 'scale-[1.02]' : 'scale-100'}`}
          >
            <div className={`
              flex items-center gap-1.5 h-9 pl-1.5 pr-3 rounded-full
              border transition-all duration-200
              ${searchFocused
                ? 'border-surface-border bg-surface shadow-sm shadow-black/5'
                : 'border-surface-border bg-transparent hover:border-primary/30'
              }
            `}>

              {/* Scope Picker */}
              <div ref={scopeRef} className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowScopeMenu(!showScopeMenu)}
                  className={`flex items-center gap-1 h-7 pl-2 pr-1.5 rounded-full transition-colors ${
                    showScopeMenu
                      ? 'bg-primary/15'
                      : 'bg-primary/8 hover:bg-primary/12'
                  }`}
                  aria-label={`Search scope: ${activeScope.label}`}
                  aria-haspopup="true"
                  aria-expanded={showScopeMenu}
                >
                  {renderScopeMark(activeScope, 12)}
                  <ChevronDown
                    size={12}
                    strokeWidth={2.5}
                    className="text-ink-muted flex-shrink-0"
                  />
                </button>

                {showScopeMenu && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-surface border border-surface-border rounded-xl shadow-[var(--shadow-dropdown)] z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-surface-border">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Search in</p>
                    </div>
                    <div className="py-1">
                      {SEARCH_SCOPES.map((scope) => {
                        const isActive = activeScope.id === scope.id;
                        return (
                          <button
                            key={scope.id}
                            type="button"
                            onClick={() => {
                              setActiveScope(scope);
                              setShowScopeMenu(false);
                              searchInputRef.current?.focus();
                              if (searchQuery.trim().length > 0) setDesktopDropdownOpen(true);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-ink hover:bg-surface-hover'
                            }`}
                          >
                            <span className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                              {renderScopeMark(scope, 12)}
                            </span>
                            <span className="flex-1 text-left">{scope.label}</span>
                            {isActive && <ChevronRight size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-surface-border flex-shrink-0" />

              {/* Search Input */}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDesktopDropdownOpen(e.target.value.trim().length > 0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={activeScope.placeholder}
                className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-subtle outline-none min-w-0"
                onFocus={() => {
                  setSearchFocused(true);
                  if (searchQuery.trim().length > 0) setDesktopDropdownOpen(true);
                }}
                onBlur={() => {
                  setSearchFocused(false);
                  // Delay so clicks inside dropdown register first
                  window.setTimeout(() => {
                    if (
                      desktopSearchRef.current &&
                      !desktopSearchRef.current.contains(document.activeElement)
                    ) {
                      // noop — the outside-click handler manages closing
                    }
                  }, 150);
                }}
              />

              {/* Kbd hint */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <kbd className="flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-semibold text-ink-subtle border border-surface-border bg-surface-hover">
                  <Command size={9} strokeWidth={2.5} />
                </kbd>
                <kbd className="flex items-center justify-center px-1.5 h-5 rounded-md text-[10px] font-semibold text-ink-subtle border border-surface-border bg-surface-hover">K</kbd>
              </div>
            </div>

            {/* ✅ Desktop live results dropdown */}
            {desktopDropdownOpen && searchQuery.trim().length > 0 && (
              <DesktopSearchDropdown
                query={searchQuery}
                scope={activeScope.id as "all" | "clients" | "bookings" | "fleet"}
                onSubmit={handleSearchSubmit}
                onResultClick={() => {
                  setDesktopDropdownOpen(false);
                  setSearchQuery("");
                }}
              />
            )}
          </div>
        </div>

        {/* ── RIGHT: Controls ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 ml-auto">

          <button
            onClick={toggleTheme}
            className="flex w-9 h-9 rounded-xl items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink transition-all duration-200 active:scale-95"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
          </button>

          <div className="w-px h-6 bg-surface-border mx-0.5 sm:mx-1" />

          <button
            className="relative flex w-9 h-9 rounded-xl items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink transition-all duration-200 active:scale-95"
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={1.8} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          <div className="w-px h-6 bg-surface-border mx-0.5 sm:mx-1" />

          <div ref={menuRef} className="hidden lg:block relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center justify-center rounded-full hover:opacity-90 transition-all duration-200 active:scale-95"
              aria-label="Open user menu"
              aria-haspopup="true"
              aria-expanded={showUserMenu}
            >
              <div className="relative flex-shrink-0">
                {renderAvatar("md")}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-bg" />
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[calc(100vw-2rem)] sm:w-[300px] max-w-[300px] rounded-2xl bg-surface border border-surface-border shadow-[var(--shadow-dropdown)] z-[9999] overflow-hidden animate-in slide-up fade-in duration-200">
                <div className="px-4 pt-4 pb-3 border-b border-surface-border">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {renderAvatar("lg")}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-surface" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink truncate leading-tight">{fullName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-primary/20 bg-primary-muted text-primary">
                          {renderRoleIcon(user?.role)}
                          {getRoleLabel(user?.role)}
                        </div>
                        {user?.is_active === false && (
                          <span className="text-[10px] text-danger font-medium">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-muted to-primary-subtle border border-primary/20">
                    {tenantLogoUrl ? (
                      <img
                        src={tenantLogoUrl}
                        alt={companyName}
                        className="w-5 h-5 rounded-md object-contain bg-white flex-shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600">
                        {(companyName[0] || "A").toUpperCase()}
                      </div>
                    )}
                    <p className="text-[12px] font-medium text-primary-text truncate">{companyName}</p>
                    <Sparkles size={12} className="text-primary ml-auto opacity-60" />
                  </div>
                </div>

                <div className="px-2 py-2 space-y-0.5">
                  <Link
                    href={isSuperAdmin ? `/super-admin/users/${user?.id}` : `/dashboard/users/${user?.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-ink hover:bg-surface-hover transition-all duration-150 group"
                  >
                    <User size={16} strokeWidth={1.8} className="text-ink-muted group-hover:text-primary transition-colors" />
                    <span className="flex-1 font-medium">View Profile</span>
                    <ChevronRight size={14} className="text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link
                    href={isSuperAdmin ? "/super-admin/settings" : "/dashboard/settings"}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-ink hover:bg-surface-hover transition-all duration-150 group"
                  >
                    <Settings size={16} strokeWidth={1.8} className="text-ink-muted group-hover:text-primary transition-colors" />
                    <span className="flex-1 font-medium">Settings</span>
                    <ChevronRight size={14} className="text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link
                    href="/dashboard/financials"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-ink hover:bg-surface-hover transition-all duration-150 group"
                  >
                    <CreditCard size={16} strokeWidth={1.8} className="text-ink-muted group-hover:text-primary transition-colors" />
                    <span className="flex-1 font-medium">Billing & Invoices</span>
                    <ChevronRight size={14} className="text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link
                    href="/help"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-ink hover:bg-surface-hover transition-all duration-150 group"
                  >
                    <HelpCircle size={16} strokeWidth={1.8} className="text-ink-muted group-hover:text-primary transition-colors" />
                    <span className="flex-1 font-medium">Help Center</span>
                    <ChevronRight size={14} className="text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>

                <div className="h-px bg-surface-border mx-3 my-1" />

                <div className="px-2 py-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-danger-text hover:bg-danger-bg dark:hover:bg-rose-500/10 transition-all duration-150 group"
                  >
                    <LogOut size={16} strokeWidth={1.8} className="text-danger-text" />
                    <span className="flex-1">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Mobile Search Trigger */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-ink-muted hover:bg-surface-hover hover:text-ink transition-all duration-200 active:scale-95"
            aria-label="Search"
          >
            <Search size={17} strokeWidth={1.8} />
          </button>

          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-ink-muted hover:bg-surface-hover hover:text-ink transition-all duration-200 active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={18} strokeWidth={2} /> : <MoreVertical size={18} strokeWidth={2} />}
            </button>
          )}
        </div>
      </header>

      {/* ✅ Mobile Search Overlay */}
      <MobileSearchModal
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />
    </>
  );
}

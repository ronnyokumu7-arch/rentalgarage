"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, Bell, Sun, Moon, User, Settings,
  LogOut, ChevronRight, Command, Briefcase,
  Menu, Sparkles, X, HelpCircle, Shield,
  CreditCard
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface TopbarProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Topbar({ onMenuToggle, isMobileMenuOpen = false }: TopbarProps) {
  const { user, tenant, logout } = useAuth();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isCurrentlyDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(isCurrentlyDark);
    if (isCurrentlyDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  // ── Click Outside ──────────────────────────────────────────────────────────
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowUserMenu(false);
  }, []);

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setShowUserMenu(false);
  }, []);

  useEffect(() => {
    if (!showUserMenu) return;
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showUserMenu, handleClickOutside, handleEscapeKey]);

  useEffect(() => { setShowUserMenu(false); }, [pathname]);

  // ── Keyboard shortcut for search ──────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
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

  const companyName = user?.role === "super_admin" ? "Rental Garage" : tenant?.name || "Agency";
  const isSuperAdmin = user?.role === "super_admin";
  const userInitial = user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U";
  const fullName = user?.full_name || user?.email || "User";

  // ── Render Avatar ────────────────────────────────────────────────────────
  const renderAvatar = (size: "md" | "lg") => {
    const dims = {
      md: "w-10 h-10",
      lg: "w-12 h-12"
    };
    const textSizes = {
      md: "text-sm",
      lg: "text-lg"
    };
    
    if (user?.avatar_url) {
      return <img src={user.avatar_url} alt={fullName} className={`${dims[size]} rounded-full object-cover border-2 border-[var(--color-surface-border)]`} />;
    }
    
    return (
      <div className={`${dims[size]} rounded-full flex items-center justify-center font-bold ${textSizes[size]} text-white bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 ring-2 ring-[var(--color-surface)]`}>
        {userInitial}
      </div>
    );
  };

  // ── Render Role Icon ──────────────────────────────────────────────────────
  const renderRoleIcon = (role?: string) => {
    if (!role) return <Briefcase size={12} className="text-[var(--color-ink-subtle)]" />;
    const roleLower = role.toLowerCase();
    if (roleLower.includes("admin") || roleLower.includes("super")) {
      return <Shield size={12} className="text-[var(--color-primary)]" />;
    }
    if (roleLower.includes("manager") || roleLower.includes("owner")) {
      return <Briefcase size={12} className="text-[var(--color-primary)]" />;
    }
    return <User size={12} className="text-[var(--color-ink-subtle)]" />;
  };

  // ── Get Role Badge Label ──────────────────────────────────────────────────
  const getRoleLabel = (role?: string) => {
    if (!role) return "User";
    const roleLower = role.toLowerCase();
    if (roleLower.includes("super_admin") || roleLower.includes("superadmin")) return "Super Admin";
    if (roleLower.includes("tenant_admin") || roleLower.includes("admin")) return "Admin";
    if (roleLower.includes("manager")) return "Manager";
    return role.replace("_", " ");
  };

  // ── Get greeting with emoji ──────────────────────────────────────────────
  const getGreeting = () => {
    const h = new Date().getHours();
    const name = fullName.split(" ")[0] || "there";
    if (h < 12) return `Good morning, ${name}`;
    if (h < 17) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  return (
    <header className="h-14 sm:h-16 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 sticky top-0 z-30 border-b border-[var(--color-surface-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl transition-all duration-300">
      
      {/* ── LEFT: Brand (Hidden on Desktop) ─────────────────────────────────── */}
      <Link href="/dashboard" className="lg:hidden flex items-center gap-2.5 group">
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/25 ring-2 ring-[var(--color-surface)] transition-all duration-300 group-hover:shadow-blue-500/40 group-hover:scale-105">
            RG
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-[var(--color-surface)]" />
        </div>
        <span className="text-sm font-bold text-[var(--color-ink)] tracking-tight">
          Rental<span className="text-blue-600 dark:text-blue-400">Garage</span>
        </span>
      </Link>

      {/* Breadcrumb / Context - Desktop only */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
        <span className="font-medium">{getGreeting()}</span>
        <span className="text-[var(--color-ink-subtle)]">•</span>
        <span className="text-[var(--color-ink-subtle)] capitalize">
          {pathname.split("/").filter(Boolean).pop()?.replace("-", " ") || "Dashboard"}
        </span>
      </div>

      {/* ── CENTER: Search Bar ───────────────────────────────────────────────── */}
      <div className="hidden sm:flex flex-1 max-w-xl mx-auto">
        <div className={`relative w-full transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
          <div className={`
            flex items-center gap-3 h-9 px-3.5 rounded-xl 
            border transition-all duration-200
            ${searchFocused 
              ? 'border-blue-500/50 bg-[var(--color-surface)] shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20' 
              : 'border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-hover)]'
            }
          `}>
            <Search size={14} strokeWidth={2} className={`flex-shrink-0 transition-colors ${searchFocused ? 'text-blue-500' : 'text-[var(--color-ink-subtle)]'}`} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search anything..."
              className="flex-1 bg-transparent text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] outline-none min-w-0"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <kbd className="flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-semibold text-[var(--color-ink-subtle)] border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">
                <Command size={9} strokeWidth={2.5} />
              </kbd>
              <kbd className="flex items-center justify-center px-1.5 h-5 rounded-md text-[10px] font-semibold text-[var(--color-ink-subtle)] border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">K</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Controls ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 ml-auto">
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="flex w-9 h-9 rounded-xl items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-200 active:scale-95"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-200 active:scale-95">
          <Bell size={17} strokeWidth={1.8} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[var(--color-bg)] animate-pulse" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--color-surface-border)] mx-0.5 sm:mx-1" />

        {/* User Menu (Desktop Only - Hidden on Mobile) */}
        <div ref={menuRef} className="hidden lg:block relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)} 
            className="flex items-center gap-2 pl-0.5 pr-2.5 py-0.5 rounded-xl hover:bg-[var(--color-surface-hover)] transition-all duration-200 group"
          >
            <div className="relative flex-shrink-0">
              {renderAvatar("md")}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[var(--color-bg)]" />
            </div>
            <span className="hidden md:block text-[13px] font-medium text-[var(--color-ink)] max-w-[80px] truncate">
              {fullName.split(" ")[0]}
            </span>
            <ChevronRight size={13} strokeWidth={2.5} className={`hidden md:block text-[var(--color-ink-subtle)] transition-transform duration-200 ${showUserMenu ? "rotate-90" : ""}`} />
          </button>

          {/* User Dropdown Menu - Premium Upgrade */}
          {showUserMenu && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[calc(100vw-2rem)] sm:w-[300px] max-w-[300px] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-dropdown)] z-[9999] overflow-hidden animate-in slide-up fade-in duration-200">
              
              {/* Header - User Info */}
              <div className="px-4 pt-4 pb-3 border-b border-[var(--color-surface-border)]">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {renderAvatar("lg")}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[var(--color-surface)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--color-ink)] truncate leading-tight">{fullName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-[var(--color-primary)]/20 bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                        {renderRoleIcon(user?.role)}
                        {getRoleLabel(user?.role)}
                      </div>
                      {user?.is_active === false && (
                        <span className="text-[10px] text-[var(--color-danger)] font-medium">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Tenant/Agency Badge */}
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--color-primary-muted)] to-[var(--color-primary-subtle)] border border-[var(--color-primary)]/20">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600">
                    {companyName[0]}
                  </div>
                  <p className="text-[12px] font-medium text-[var(--color-primary-text)] truncate">{companyName}</p>
                  <Sparkles size={12} className="text-[var(--color-primary)] ml-auto opacity-60" />
                </div>
              </div>

              {/* Menu Actions - Clean Icons */}
              <div className="px-2 py-2 space-y-0.5">
                <Link 
                  href={isSuperAdmin ? `/super-admin/users/${user?.id}` : `/dashboard/users/${user?.id}`} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all duration-150 group"
                >
                  <User size={16} strokeWidth={1.8} className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                  <span className="flex-1 font-medium">View Profile</span>
                  <ChevronRight size={14} className="text-[var(--color-ink-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                
                <Link 
                  href={isSuperAdmin ? "/super-admin/settings" : "/dashboard/settings"} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all duration-150 group"
                >
                  <Settings size={16} strokeWidth={1.8} className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                  <span className="flex-1 font-medium">Settings</span>
                  <ChevronRight size={14} className="text-[var(--color-ink-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link 
                  href="/dashboard/financials" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all duration-150 group"
                >
                  <CreditCard size={16} strokeWidth={1.8} className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                  <span className="flex-1 font-medium">Billing & Invoices</span>
                  <ChevronRight size={14} className="text-[var(--color-ink-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <Link 
                  href="/help" 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all duration-150 group"
                >
                  <HelpCircle size={16} strokeWidth={1.8} className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                  <span className="flex-1 font-medium">Help Center</span>
                  <ChevronRight size={14} className="text-[var(--color-ink-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--color-surface-border)] mx-3 my-1" />

{/* Logout - Distinguished */}
<div className="px-2 py-2">
  <button 
    onClick={logout} 
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] dark:hover:bg-rose-500/10 transition-all duration-150 group"
  >
    <LogOut size={16} strokeWidth={1.8} className="text-[var(--color-danger-text)]" />
    <span className="flex-1">Sign out</span>
  </button>
</div>
            </div>
          )}
        </div>

        {/* ✅ Hamburger Menu - Moved to FAR RIGHT (Mobile Only) */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-200 active:scale-95"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        )}
      </div>
    </header>
  );
}

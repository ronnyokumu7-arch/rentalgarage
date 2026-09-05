"use client";

import {
  LayoutDashboard, Building2, CreditCard, BarChart3, Settings,
  CalendarDays, Contact, Users, CarFront, Wallet, Server, LifeBuoy, ListChecks, UserCircle,
} from "lucide-react";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
}

// ── OPTIMIZED PREMIUM ICON COMPONENTS ────────────────────────────────────────
// NOTE: No hardcoded colors. This allows the Sidebar to control them via CSS.
// Using `currentColor` for seamless Light/Dark mode switching.

const PremiumDashboardIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <LayoutDashboard size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumCalendarIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <CalendarDays size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumContactIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Contact size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumUsersIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Users size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumWalletIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Wallet size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumBarChartIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <BarChart3 size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumSettingsIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Settings size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumBuildingIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Building2 size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumCreditCardIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <CreditCard size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumServerIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <Server size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumLifeBuoyIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <LifeBuoy size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumTasksIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <ListChecks size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumDriversIcon = ({ size = 20, strokeWidth = 1.8, className = "" }: any) => (
  <UserCircle size={size} strokeWidth={strokeWidth} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

// ─── SUPER ADMIN NAVIGATION ───────────────────────────────────────────────────
export const superAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/super-admin", icon: PremiumDashboardIcon },
  { label: "Agencies", href: "/super-admin/agencies", icon: PremiumBuildingIcon },
  { label: "Subscriptions", href: "/super-admin/subscriptions", icon: PremiumCreditCardIcon },
  { label: "Reports", href: "/super-admin/reports", icon: PremiumBarChartIcon },
  { label: "System", href: "/super-admin/system", icon: PremiumServerIcon },
  { label: "Settings", href: "/super-admin/settings", icon: PremiumSettingsIcon },
  { label: "Support", href: "/super-admin/support", icon: PremiumLifeBuoyIcon },
];

// ─── TENANT ADMIN NAVIGATION ──────────────────────────────────────────────────
export const tenantAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: PremiumDashboardIcon },
  { label: "Bookings", href: "/dashboard/bookings", icon: PremiumCalendarIcon },
  { label: "Clients", href: "/dashboard/clients", icon: PremiumContactIcon },
  { label: "Fleet", href: "/dashboard/fleet", icon: CarFront },
  { label: "Drivers", href: "/dashboard/drivers", icon: PremiumDriversIcon },
  { label: "Users", href: "/dashboard/users", icon: PremiumUsersIcon },
  { label: "Financials", href: "/dashboard/financials", icon: PremiumWalletIcon },
  { label: "Reports", href: "/dashboard/reports", icon: PremiumBarChartIcon },
  { label: "Tasks", href: "/dashboard/tasks", icon: PremiumTasksIcon },
  { label: "Settings", href: "/dashboard/settings", icon: PremiumSettingsIcon },
];

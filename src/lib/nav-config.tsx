// src/lib/nav-config.tsx
"use client";

import {
  Storefront,
  Buildings,
  CreditCard,
  ChartBar,
  Gear,
  Calendar,
  Users,
  UsersThree,
  Car,
  Wallet,
  HardDrives,
  Lifebuoy,
  Checks,
  UserCircle,
} from "@phosphor-icons/react";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
  /** Hidden from the mobile navigation drawer. Desktop sidebar keeps it. */
  hiddenOnMobile?: boolean;
}

// ── PREMIUM PHOSPHOR ICON COMPONENTS ─────────────────────────────────────────

const PremiumDashboardIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <Storefront size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumCalendarIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <Calendar size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

// ✅ Clients: Two-heads icon
const PremiumContactIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <Users size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

// ✅ Team (formerly Users): Three-heads icon for internal community
const PremiumTeamIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <UsersThree size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumWalletIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <Wallet size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumBarChartIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <ChartBar size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumSettingsIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <Gear size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumBuildingIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <Buildings size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumCreditCardIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <CreditCard size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumServerIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <HardDrives size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumLifeBuoyIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <Lifebuoy size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumTasksIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <Checks size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

const PremiumDriversIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <UserCircle size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

// ✅ Fleet: Front-facing car
const PremiumFleetIcon = ({ size = 20, weight = "regular", className = "" }: any) => (
  <Car size={size} weight={weight} className={`transition-transform duration-200 group-hover/nav:scale-110 ${className}`} />
);

// ─── EXPORTABLE ICON MAP ──────────────────────────────────────────────────────
export const navIconMap: Record<string, React.ElementType> = {
  Dashboard: PremiumDashboardIcon,
  Bookings: PremiumCalendarIcon,
  Clients: PremiumContactIcon,
  Fleet: PremiumFleetIcon,
  Financials: PremiumWalletIcon,
  Reports: PremiumBarChartIcon,
  Settings: PremiumSettingsIcon,
  Team: PremiumTeamIcon, // Updated from "Users"
  Drivers: PremiumDriversIcon,
  Tasks: PremiumTasksIcon,
  Agencies: PremiumBuildingIcon,
  Subscriptions: PremiumCreditCardIcon,
  System: PremiumServerIcon,
  Support: PremiumLifeBuoyIcon,
};

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
  { label: "Fleet", href: "/dashboard/fleet", icon: PremiumFleetIcon },
  { label: "Drivers", href: "/dashboard/drivers", icon: PremiumDriversIcon },
  { label: "Investors", href: "/dashboard/investors", icon: PremiumContactIcon }, // Keeping Two-Heads for investors too
  { label: "Team", href: "/dashboard/users", icon: PremiumTeamIcon }, // ✅ Renamed to "Team"
  { label: "Financials", href: "/dashboard/financials", icon: PremiumWalletIcon },
  { label: "Reports", href: "/dashboard/reports", icon: PremiumBarChartIcon },
  { label: "Tasks", href: "/dashboard/tasks", icon: PremiumTasksIcon },
  { label: "Settings", href: "/dashboard/settings", icon: PremiumSettingsIcon },
];

// ─── INVESTOR NAVIGATION ──────────────────────────────────────────────────────
export const investorNav: NavItem[] = [
  { label: "Dashboard", href: "/investor/dashboard", icon: PremiumDashboardIcon },
  { label: "My Fleet", href: "/investor/fleet", icon: PremiumFleetIcon },
  { label: "Earnings", href: "/investor/earnings", icon: PremiumWalletIcon },
  { label: "Settings", href: "/investor/settings", icon: PremiumSettingsIcon },
];

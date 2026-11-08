"use client";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  Settings,
  CalendarDays,
  Contact,
  Users,
  Car,
  Wallet,
  Server,
  FileText,      // ✅ Added for Quotations
  Receipt,       // ✅ Added for Invoices
  FileSignature, // ✅ Added for Contracts
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

// ─── SUPER ADMIN NAVIGATION ───────────────────────────────────────────────────
export const superAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  { label: "Agencies", href: "/super-admin/agencies", icon: Building2 },
  {
    label: "Subscriptions",
    icon: CreditCard,
    children: [
      { label: "Plans & Status", href: "/super-admin/subscriptions" },
      { label: "Renewals", href: "/super-admin/subscriptions/renewals" },
    ],
  },
  { label: "Reports", href: "/super-admin/reports", icon: BarChart3 },
  {
    label: "System",
    icon: Server,
    children: [
      // Add system-level links here if needed
    ],
  },
];

// ─── TENANT ADMIN NAVIGATION ──────────────────────────────────────────────────
export const tenantAdminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { label: "Clients", href: "/dashboard/clients", icon: Contact },
  { label: "Fleet", href: "/dashboard/fleet", icon: Car },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Financials", href: "/dashboard/financials", icon: Wallet },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

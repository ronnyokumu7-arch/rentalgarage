// src/lib/search/page-registry.ts
"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCircle,
  Building2,
  CarFront,
  Wrench,
  BarChart3,
  FilePlus2,
  FileSignature,
  Banknote,
  Wallet,
  CalendarRange,
  KeyRound,
  UserCog,
  Settings as SettingsIcon,
  CreditCard,
  Puzzle,
  Activity,
  Database,
  ListChecks,
  TrendingUp,
  LifeBuoy,
  Server,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────────────── */

export type RegistryRole =
  | "tenant_admin"
  | "tenant_staff"
  | "investor"
  | "super_admin";

export type RegistrySection =
  | "overview"
  | "bookings"
  | "clients"
  | "drivers"
  | "financials"
  | "fleet"
  | "investors"
  | "tasks"
  | "users"
  | "settings"
  | "reports"
  | "support"
  | "platform";

export interface PageEntry {
  /** Stable id — used for keys and dedupe. */
  id: string;
  /** Display label. */
  label: string;
  /** Short description shown under the label. */
  description: string;
  /** Route (may include `?tab=` and `?module=` deep links). */
  href: string;
  /** Lucide icon. */
  icon: LucideIcon;
  /** Logical section this page belongs to. */
  section: RegistrySection;
  /** Which roles can see this page in search. */
  roles: RegistryRole[];
  /** Lowercase search aliases (the more the better). */
  aliases: string[];
  /** Status keywords that should surface this page. */
  statusKeywords?: string[];
  /** Optional ranking boost (higher = earlier in results). */
  weight?: number;
  /**
   * Marks an entry whose *tab* (or the page itself) is hidden from
   * mobile browse. It is still returned by search, and the
   * destination page must still render it on mobile when deep-linked.
   */
  isDesktopBrowseOnly?: boolean;
}

/* ──────────────────────────────────────────────────────────────────────
   Registry
   Mirrors nav-config.tsx (tenantAdminNav, investorNav, superAdminNav)
   plus known sub-tab deep links.
────────────────────────────────────────────────────────────────────── */

export const PAGE_REGISTRY: PageEntry[] = [
  /* ════════════════════════════════════════════════════════════════
     TENANT ADMIN / TENANT STAFF
  ════════════════════════════════════════════════════════════════ */

  {
    id: "dashboard",
    label: "Dashboard",
    description: "Real-time overview of your rental business",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "overview",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "home", "overview", "summary", "stats", "kpi", "today",
      "revenue", "income", "alerts", "upcoming", "activity",
    ],
  },

  /* ── Bookings ──────────────────────────────────────────────────── */
  {
    id: "bookings",
    label: "Bookings",
    description: "Reservations, trips, and calendar",
    href: "/dashboard/bookings",
    icon: CalendarDays,
    section: "bookings",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "booking", "reservation", "reservations", "rental", "rentals",
      "trip", "trips", "calendar", "timeline", "schedule", "reserve",
      "fleet timeline", "extend", "extension", "pickup", "return",
    ],
    statusKeywords: [
      "pending", "confirmed", "active", "completed", "cancelled",
      "no_show", "awaiting_mileage",
    ],
    weight: 2,
  },
  {
    id: "bookings-calendar",
    label: "Bookings Calendar",
    description: "Fleet timeline view of all reservations",
    href: "/dashboard/bookings?tab=calendar",
    icon: CalendarDays,
    section: "bookings",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "calendar", "timeline", "fleet timeline", "schedule",
      "gantt", "blocks", "scheduling",
    ],
    statusKeywords: ["confirmed", "active"],
  },

  /* ── Clients ───────────────────────────────────────────────────── */
  {
    id: "clients",
    label: "Clients",
    description: "Individual and corporate clients",
    href: "/dashboard/clients",
    icon: Users,
    section: "clients",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "client", "clients", "customer", "customers", "individual",
      "individuals", "corporate", "company", "companies", "crm",
      "verification", "verify", "kyc", "kyc pending", "driving licence",
      "driver licence", "dl", "id number", "avatar", "self drive",
      "own driver", "chauffeur",
    ],
    statusKeywords: ["active", "pending", "suspended", "inactive"],
    weight: 2,
  },
  {
    id: "clients-invites",
    label: "Client Invites",
    description: "Onboarding links and pending invitations",
    href: "/dashboard/clients?tab=invites",
    icon: Users,
    section: "clients",
    roles: ["tenant_admin"],
    aliases: [
      "invite", "invites", "client invite", "client invites",
      "onboarding", "onboarding link", "link", "links", "pending invite",
    ],
    isDesktopBrowseOnly: true,
  },

  /* ── Fleet ─────────────────────────────────────────────────────── */
  {
    id: "fleet",
    label: "Fleet",
    description: "Vehicles, garage, maintenance",
    href: "/dashboard/fleet",
    icon: CarFront,
    section: "fleet",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "fleet", "vehicle", "vehicles", "car", "cars", "garage",
      "maintenance", "service", "inspection", "mileage", "plate",
      "reg number", "vin", "performance", "utilization", "fuel",
      "insurance", "tracking",
    ],
    statusKeywords: [
      "available", "rented", "maintenance", "pending_activation", "retired",
    ],
    weight: 2,
  },
  {
    id: "fleet-performance",
    label: "Fleet Performance",
    description: "Utilisation, revenue, and profitability per vehicle",
    href: "/dashboard/fleet?tab=performance",
    icon: BarChart3,
    section: "fleet",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "performance", "utilisation", "utilization", "profitability",
      "analytics", "kpi", "returns", "roi", "vehicle performance",
    ],
    isDesktopBrowseOnly: true,
  },
  {
    id: "fleet-garage",
    label: "Garage Operations",
    description: "Onboard new vehicles, manage maintenance",
    href: "/dashboard/fleet?tab=garage",
    icon: Wrench,
    section: "fleet",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "garage", "workshop", "maintenance", "repair", "service",
      "inspection", "mechanic", "parts", "quick garage",
    ],
    statusKeywords: ["maintenance", "in_service", "pending"],
  },

  /* ── Drivers ───────────────────────────────────────────────────── */
  {
    id: "drivers",
    label: "Drivers",
    description: "Company and contract drivers",
    href: "/dashboard/drivers",
    icon: UserCircle,
    section: "drivers",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "driver", "drivers", "chauffeur", "chauffeurs", "staff driver",
      "company driver", "contract driver", "freelance", "pool",
      "available", "on trip", "on leave", "pay mode", "commission",
      "fixed per job", "payroll", "dl expiry", "vetted", "vetting",
      "verification",
    ],
    statusKeywords: ["available", "on_trip", "on_leave", "suspended"],
  },
  {
    id: "drivers-contract",
    label: "Contract Drivers",
    description: "External contractor and freelance driver pool",
    href: "/dashboard/drivers?tab=contract",
    icon: UserCircle,
    section: "drivers",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "contract driver", "contract drivers", "freelance", "freelancer",
      "external", "outsourced", "contractor", "contractors",
    ],
    isDesktopBrowseOnly: true,
  },

  /* ── Investors ─────────────────────────────────────────────────── */
  {
    id: "investors",
    label: "Investors",
    description: "Manage host investors, vehicles, and lease agreements",
    href: "/dashboard/investors",
    icon: TrendingUp,
    section: "investors",
    roles: ["tenant_admin"],
    aliases: [
      "investor", "investors", "host investor", "host", "leases",
      "lease agreement", "partnership", "vehicle owner", "vehicle owners",
      "commission", "payout", "payouts",
    ],
    statusKeywords: ["active", "pending"],
  },

  /* ── Users / Team ──────────────────────────────────────────────── */
  {
    id: "users",
    label: "Users",
    description: "Manage team members, roles, and access",
    href: "/dashboard/users",
    icon: UserCog,
    section: "users",
    roles: ["tenant_admin"],
    aliases: [
      "user", "users", "team", "staff", "roster", "employee",
      "employees", "member", "members", "invite", "invites",
      "role", "roles", "permission", "permissions", "access",
      "scheduler", "shift", "shifts", "availability",
    ],
    statusKeywords: ["active", "pending", "suspended", "invited"],
  },
  {
    id: "users-scheduler",
    label: "Shift Scheduler",
    description: "Plan shifts, availability, and coverage",
    href: "/dashboard/users?tab=scheduler",
    icon: CalendarRange,
    section: "users",
    roles: ["tenant_admin"],
    aliases: [
      "scheduler", "schedule", "shift", "shifts", "rota", "roster",
      "availability", "coverage", "calendar", "week",
    ],
    isDesktopBrowseOnly: true,
  },
  {
    id: "users-roles",
    label: "Roles & Permissions",
    description: "Configure custom roles and access levels",
    href: "/dashboard/users?tab=roles",
    icon: KeyRound,
    section: "users",
    roles: ["tenant_admin"],
    aliases: [
      "role", "roles", "permission", "permissions", "access",
      "matrix", "guard", "policy", "roles & permissions",
    ],
    isDesktopBrowseOnly: true,
  },

  /* ── Financials ────────────────────────────────────────────────── */
  {
    id: "financials",
    label: "Financials",
    description: "Invoices, payments, contracts, revenue",
    href: "/dashboard/financials",
    icon: Wallet,
    section: "financials",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "finance", "financial", "financials", "invoice", "invoices",
      "receipt", "receipts", "contract", "contracts", "payment",
      "payments", "billing", "revenue", "money", "cash", "ledger",
      "p&l", "profit", "loss", "statement",
    ],
    weight: 2,
  },
  {
    id: "financials-invoices",
    label: "Invoices",
    description: "Create, send, and track all invoices",
    href: "/dashboard/financials?tab=invoices",
    icon: FilePlus2,
    section: "financials",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "invoice", "invoices", "bill", "bills", "receipt", "receipts",
      "issued", "unpaid", "overdue", "paid", "voided", "draft invoice",
    ],
    statusKeywords: ["paid", "unpaid", "overdue", "voided", "draft"],
    isDesktopBrowseOnly: true,
  },
  {
    id: "financials-contracts",
    label: "Contracts",
    description: "Manage your rental contracts seamlessly",
    href: "/dashboard/financials?tab=contracts",
    icon: FileSignature,
    section: "financials",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "contract", "contracts", "agreement", "agreements", "signature",
      "signed", "pending signature", "expiring", "lease",
      "rental agreement",
    ],
    statusKeywords: ["active", "pending", "signed", "expiring", "expired"],
    isDesktopBrowseOnly: true,
  },
  {
    id: "financials-payments",
    label: "Payments",
    description: "Monitor and reconcile incoming payments",
    href: "/dashboard/financials?tab=payments",
    icon: Banknote,
    section: "financials",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "payment", "payments", "pay", "transaction", "transactions",
      "reconcile", "reconciliation", "gateway", "mpesa", "cash",
      "refund", "refunds",
    ],
    statusKeywords: ["completed", "pending", "failed", "refunded"],
  },

  /* ── Reports ───────────────────────────────────────────────────── */
  {
    id: "reports",
    label: "Reports",
    description: "Analytics, insights, and business metrics",
    href: "/dashboard/reports",
    icon: BarChart3,
    section: "reports",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "report", "reports", "analytics", "insights", "metrics",
      "charts", "graphs", "performance", "dashboard metrics",
      "kpi", "kpis",
    ],
  },

  /* ── Tasks (hidden on mobile browse) ───────────────────────────── */
  {
    id: "tasks",
    label: "Tasks",
    description: "Task management and to-dos",
    href: "/dashboard/tasks",
    icon: ListChecks,
    section: "tasks",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "task", "tasks", "todo", "todos", "checklist", "checklists",
      "reminder", "reminders", "assignment", "assignments", "backlog",
    ],
    statusKeywords: ["pending", "completed", "in_progress", "overdue"],
    isDesktopBrowseOnly: true,
  },

  /* ── Settings ──────────────────────────────────────────────────── */
  {
    id: "settings",
    label: "Settings",
    description: "Account and agency settings",
    href: "/dashboard/settings",
    icon: SettingsIcon,
    section: "settings",
    roles: ["tenant_admin", "tenant_staff"],
    aliases: [
      "setting", "settings", "preferences", "config", "configuration",
      "profile", "business profile", "business", "agency", "tenant",
      "logo", "policies", "terms", "policy", "clauses", "appearance",
      "theme", "dark mode", "regional", "timezone", "currency",
      "language", "notification", "notifications", "email",
      "authentication", "2fa", "password", "session",
    ],
    statusKeywords: ["enabled", "disabled"],
    weight: 2,
  },
  {
    id: "settings-billing",
    label: "Billing & Subscription",
    description: "Manage plan, payment methods, and invoices",
    href: "/dashboard/settings?tab=financials&module=billing",
    icon: CreditCard,
    section: "settings",
    roles: ["tenant_admin"],
    aliases: [
      "billing", "subscription", "plan", "plans", "upgrade",
      "downgrade", "invoice", "invoices", "payment methods",
      "card", "credit card", "mpesa", "gateway",
    ],
    statusKeywords: ["active", "past_due", "cancelled", "trial"],
  },
  {
    id: "settings-integrations",
    label: "Integrations",
    description: "Connect external APIs, webhooks, and services",
    href: "/dashboard/settings?tab=system&module=integrations",
    icon: Puzzle,
    section: "settings",
    roles: ["tenant_admin"],
    aliases: [
      "integration", "integrations", "api", "apis", "webhook",
      "webhooks", "connector", "third party", "external",
      "api key", "api keys", "token", "tokens", "secret",
    ],
  },
  {
    id: "settings-audit",
    label: "Audit Logs",
    description: "System activity, user actions, security events",
    href: "/dashboard/settings?tab=system&module=audit",
    icon: Activity,
    section: "settings",
    roles: ["tenant_admin"],
    aliases: [
      "audit", "audit log", "audit logs", "logs", "activity",
      "history", "security", "security events", "sessions",
    ],
  },
  {
    id: "settings-data",
    label: "Data Management",
    description: "Export, import, and manage your rental data",
    href: "/dashboard/settings?tab=advanced&module=data",
    icon: Database,
    section: "settings",
    roles: ["tenant_admin"],
    aliases: [
      "data", "database", "export", "import", "backup", "restore",
      "migration", "csv", "backup & recovery", "system health",
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     INVESTOR
  ════════════════════════════════════════════════════════════════ */

  {
    id: "investor-dashboard",
    label: "Investor Dashboard",
    description: "Overview of your vehicles, earnings, and activity",
    href: "/investor/dashboard",
    icon: LayoutDashboard,
    section: "overview",
    roles: ["investor"],
    aliases: [
      "home", "overview", "summary", "stats", "kpi", "today",
      "revenue", "earnings", "income", "activity",
    ],
  },
  {
    id: "investor-fleet",
    label: "My Fleet",
    description: "Your vehicles and their current status",
    href: "/investor/fleet",
    icon: CarFront,
    section: "fleet",
    roles: ["investor"],
    aliases: [
      "fleet", "vehicle", "vehicles", "car", "cars", "garage",
      "maintenance", "service", "inspection", "mileage", "plate",
      "reg number", "vin", "my vehicles", "my cars",
    ],
    statusKeywords: [
      "available", "rented", "maintenance", "pending_activation", "retired",
    ],
  },
  {
    id: "investor-earnings",
    label: "Earnings",
    description: "Payouts, commissions, and revenue from your fleet",
    href: "/investor/earnings",
    icon: Wallet,
    section: "financials",
    roles: ["investor"],
    aliases: [
      "earnings", "payout", "payouts", "revenue", "income",
      "commission", "commissions", "statement", "statements",
      "financials", "money", "ledger",
    ],
    statusKeywords: ["paid", "pending", "completed"],
  },
  {
    id: "investor-settings",
    label: "Investor Settings",
    description: "Account, profile, and payout preferences",
    href: "/investor/settings",
    icon: SettingsIcon,
    section: "settings",
    roles: ["investor"],
    aliases: [
      "setting", "settings", "preferences", "config", "profile",
      "payout methods", "bank", "bank account", "mpesa", "notification",
      "notifications",
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     SUPER ADMIN
  ════════════════════════════════════════════════════════════════ */

  {
    id: "super-admin",
    label: "Platform Dashboard",
    description: "Platform-wide overview",
    href: "/super-admin",
    icon: LayoutDashboard,
    section: "platform",
    roles: ["super_admin"],
    aliases: ["dashboard", "home", "overview", "platform", "super admin"],
  },
  {
    id: "super-admin-agencies",
    label: "Agencies",
    description: "All agencies on the platform",
    href: "/super-admin/agencies",
    icon: Building2,
    section: "platform",
    roles: ["super_admin"],
    aliases: ["agency", "agencies", "tenant", "tenants", "business", "businesses"],
    statusKeywords: ["active", "pending", "suspended", "cancelled"],
  },
  {
    id: "super-admin-subscriptions",
    label: "Subscriptions",
    description: "Plans and billing cycles",
    href: "/super-admin/subscriptions",
    icon: CreditCard,
    section: "platform",
    roles: ["super_admin"],
    aliases: ["subscription", "subscriptions", "plan", "plans", "billing", "upgrade", "downgrade"],
    statusKeywords: ["active", "past_due", "cancelled", "trial"],
  },
  {
    id: "super-admin-reports",
    label: "Platform Reports",
    description: "Platform-wide analytics",
    href: "/super-admin/reports",
    icon: BarChart3,
    section: "reports",
    roles: ["super_admin"],
    aliases: ["report", "reports", "analytics", "metrics", "insights"],
  },
  {
    id: "super-admin-system",
    label: "System",
    description: "Infrastructure and system status",
    href: "/super-admin/system",
    icon: Server,
    section: "platform",
    roles: ["super_admin"],
    aliases: ["system", "health", "infra", "infrastructure", "status", "uptime"],
  },
  {
    id: "super-admin-settings",
    label: "Platform Settings",
    description: "Global platform settings",
    href: "/super-admin/settings",
    icon: SettingsIcon,
    section: "settings",
    roles: ["super_admin"],
    aliases: ["settings", "config", "configuration", "global"],
  },
  {
    id: "super-admin-support",
    label: "Support",
    description: "Support tickets and inquiries",
    href: "/super-admin/support",
    icon: LifeBuoy,
    section: "support",
    roles: ["super_admin"],
    aliases: ["support", "tickets", "help", "inquiry", "inquiries"],
    statusKeywords: ["open", "pending", "closed", "resolved"],
  },
];

/* ──────────────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────────────── */

export function getPagesForRole(
  role: RegistryRole | string | undefined | null,
): PageEntry[] {
  if (!role) return PAGE_REGISTRY.filter((p) => p.roles.includes("tenant_staff"));
  const normalized = role as RegistryRole;
  return PAGE_REGISTRY.filter((p) => p.roles.includes(normalized));
}

export function toPageResult(entry: PageEntry): {
  type: "page";
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  section: RegistrySection;
} {
  return {
    type: "page",
    label: entry.label,
    description: entry.description,
    href: entry.href,
    icon: entry.icon,
    section: entry.section,
  };
}

// src/hooks/useGlobalSearch.ts
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { clientsApi } from "@/lib/api/clients";
import { bookingsApi } from "@/lib/api/bookings";
import { vehiclesApi } from "@/lib/api/vehicles";
import { useAuth } from "@/context/auth-context";
import { tenantAdminNav, superAdminNav, investorNav } from "@/lib/nav-config";
import type { Client, Booking, Vehicle } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────────────── */

export type SearchScope = "all" | "clients" | "bookings" | "fleet";

export interface ClientResult {
  type: "client";
  id: number;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: string;
  id_number: string | null;
}

export interface BookingResult {
  type: "booking";
  id: number;
  booking_number: string | null;
  client_name: string | null;
  client_phone: string | null;
  vehicle_name: string | null;
  vehicle_plate: string | null;
  status: string;
  start_date: string;
  end_date: string;
}

export interface VehicleResult {
  type: "vehicle";
  id: number;
  make: string;
  model: string;
  plate_number: string;
  status: string;
  current_mileage: number;
}

export interface PageResult {
  type: "page";
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

export type SearchResult = ClientResult | BookingResult | VehicleResult | PageResult;

export interface GroupedResults {
  pages: PageResult[];
  clients: ClientResult[];
  bookings: BookingResult[];
  vehicles: VehicleResult[];
  total: number;
}

export interface UseGlobalSearchReturn {
  loading: boolean;
  error: string | null;
  results: GroupedResults;
  refetch: () => Promise<void>;
}

/* ──────────────────────────────────────────────────────────────────────
   Config
────────────────────────────────────────────────────────────────────── */

const PER_CATEGORY_CAP = 50;

/* ──────────────────────────────────────────────────────────────────────
   Page aliases — augment the auto-derived nav entries with synonyms
────────────────────────────────────────────────────────────────────── */

const PAGE_ALIASES: Record<string, string[]> = {
  "/dashboard/bookings": ["booking", "reservation", "reservations", "trip", "trips", "rental", "rentals"],
  "/dashboard/clients": ["client", "customer", "customers", "individual", "corporate"],
  "/dashboard/fleet": ["vehicle", "vehicles", "car", "cars", "garage", "maintenance"],
  "/dashboard/drivers": ["driver", "chauffeur", "chauffeurs"],
  "/dashboard/financials": ["finance", "invoice", "invoices", "payment", "payments", "contract", "contracts", "billing", "revenue"],
  "/dashboard/reports": ["analytics", "insights", "metrics"],
  "/dashboard/users": ["user", "team", "staff", "roster", "employee", "employees", "roles"],
  "/dashboard/tasks": ["task", "todo", "todos"],
  "/dashboard/settings": ["setting", "preferences", "config", "profile"],
  "/dashboard/investors": ["investor", "investors", "lease", "leases"],
  "/dashboard/vault": ["archive", "archived", "vault"],
  "/super-admin": ["dashboard", "home"],
  "/super-admin/agencies": ["agency", "agencies", "tenant", "tenants"],
  "/super-admin/subscriptions": ["subscription", "subscriptions", "plan", "plans", "billing"],
  "/super-admin/reports": ["analytics", "insights", "metrics"],
  "/super-admin/system": ["config", "infra", "infrastructure", "system"],
  "/super-admin/settings": ["setting", "preferences", "config"],
  "/super-admin/support": ["help", "support", "ticket", "tickets"],
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  "/dashboard": "Overview of your rental business",
  "/dashboard/bookings": "Reservations, trips, and calendar",
  "/dashboard/clients": "Individual and corporate clients",
  "/dashboard/fleet": "Vehicles, garage, maintenance",
  "/dashboard/drivers": "Company and contract drivers",
  "/dashboard/financials": "Invoices, payments, contracts",
  "/dashboard/reports": "Analytics and insights",
  "/dashboard/users": "Team roster, scheduler, roles",
  "/dashboard/tasks": "Task management",
  "/dashboard/settings": "Account and agency settings",
  "/dashboard/investors": "Investor vehicles and leases",
  "/dashboard/vault": "Archived records",
  "/super-admin": "Platform overview",
  "/super-admin/agencies": "All agencies on the platform",
  "/super-admin/subscriptions": "Plans and billing cycles",
  "/super-admin/reports": "Platform-wide analytics",
  "/super-admin/system": "System configuration and health",
  "/super-admin/settings": "Platform settings",
  "/super-admin/support": "Support tickets and inquiries",
};

/* ──────────────────────────────────────────────────────────────────────
   Filter helpers
────────────────────────────────────────────────────────────────────── */

const matchesClient = (c: Client, q: string): boolean =>
  !!(
    c.full_name?.toLowerCase().includes(q) ||
    c.phone?.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.id_number?.toLowerCase().includes(q) ||
    c.dl_number?.toLowerCase().includes(q)
  );

const matchesBooking = (b: Booking, q: string): boolean => {
  const client = b.client as any;
  const vehicle = b.vehicle as any;
  return !!(
    b.booking_number?.toLowerCase().includes(q) ||
    b.id.toString().includes(q) ||
    b.destination?.toLowerCase().includes(q) ||
    b.pickup_location?.toLowerCase().includes(q) ||
    b.return_location?.toLowerCase().includes(q) ||
    b.client_name?.toLowerCase().includes(q) ||
    b.client_phone?.toLowerCase().includes(q) ||
    client?.full_name?.toLowerCase().includes(q) ||
    client?.phone?.toLowerCase().includes(q) ||
    b.vehicle_name?.toLowerCase().includes(q) ||
    b.vehicle_plate?.toLowerCase().includes(q) ||
    vehicle?.make?.toLowerCase().includes(q) ||
    vehicle?.model?.toLowerCase().includes(q) ||
    vehicle?.plate_number?.toLowerCase().includes(q)
  );
};

const matchesVehicle = (v: Vehicle, q: string): boolean =>
  !!(
    v.make?.toLowerCase().includes(q) ||
    v.model?.toLowerCase().includes(q) ||
    v.plate_number?.toLowerCase().includes(q) ||
    v.vin?.toLowerCase().includes(q)
  );

/* ──────────────────────────────────────────────────────────────────────
   Hook
────────────────────────────────────────────────────────────────────── */

export function useGlobalSearch(query: string): UseGlobalSearchReturn {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef(false);

  /* ── ✅ ROLE-BASED PAGE REGISTRY ────────────────────────────────────
     Derived from the user's own nav config — no cross-role leakage.
     Super admins only see super-admin pages; tenant users only their
     own tenant nav; investors only their own.                                */
  const navForRole = useMemo(() => {
    if (!user) return [];
    switch (user.role) {
      case "super_admin":
        return superAdminNav;
      case "investor":
        return investorNav;
      case "tenant_admin":
      case "tenant_staff":
      default:
        return tenantAdminNav;
    }
  }, [user]);

  const pageRegistry = useMemo<PageResult[]>(() => {
    return navForRole
      .filter((item): item is typeof item & { href: string } => !!item.href)
      .map((item) => ({
        type: "page" as const,
        label: item.label,
        description: PAGE_DESCRIPTIONS[item.href] ?? "",
        href: item.href,
        icon: item.icon,
      }));
  }, [navForRole]);

  const fetchAll = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const [c, b, v] = await Promise.all([
        clientsApi.list({ page_size: 200 }),
        bookingsApi.list({ page_size: 200 }),
        vehiclesApi.list({ page_size: 200 }),
      ]);
      setClients(c ?? []);
      setBookings(b ?? []);
      setVehicles(v ?? []);
    } catch (err) {
      console.error("Global search fetch failed:", err);
      setError("Failed to load search data. Try again.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const results = useMemo<GroupedResults>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { pages: [], clients: [], bookings: [], vehicles: [], total: 0 };
    }

    // ✅ Pages — role-scoped + alias-aware
    const pageResults: PageResult[] = pageRegistry.filter((page) => {
      if (page.label.toLowerCase().includes(q)) return true;
      const aliases = PAGE_ALIASES[page.href] ?? [];
      return aliases.some((alias) => alias.toLowerCase().includes(q));
    });

    const clientResults: ClientResult[] = clients
      .filter((c) => matchesClient(c, q))
      .slice(0, PER_CATEGORY_CAP)
      .map((c) => ({
        type: "client",
        id: c.id,
        full_name: c.full_name,
        phone: c.phone ?? null,
        email: c.email ?? null,
        status: c.status,
        id_number: c.id_number ?? null,
      }));

    const bookingResults: BookingResult[] = bookings
      .filter((b) => matchesBooking(b, q))
      .slice(0, PER_CATEGORY_CAP)
      .map((b) => ({
        type: "booking",
        id: b.id,
        booking_number: b.booking_number ?? null,
        client_name: b.client_name ?? b.client?.full_name ?? null,
        client_phone: b.client_phone ?? b.client?.phone ?? null,
        vehicle_name:
          b.vehicle_name ??
          (b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : null),
        vehicle_plate: b.vehicle_plate ?? b.vehicle?.plate_number ?? null,
        status: b.status,
        start_date: b.start_date,
        end_date: b.end_date,
      }));

    const vehicleResults: VehicleResult[] = vehicles
      .filter((v) => matchesVehicle(v, q))
      .slice(0, PER_CATEGORY_CAP)
      .map((v) => ({
        type: "vehicle",
        id: v.id,
        make: v.make,
        model: v.model,
        plate_number: v.plate_number,
        status: v.status,
        current_mileage: v.current_mileage,
      }));

    return {
      pages: pageResults,
      clients: clientResults,
      bookings: bookingResults,
      vehicles: vehicleResults,
      total:
        pageResults.length +
        clientResults.length +
        bookingResults.length +
        vehicleResults.length,
    };
  }, [query, pageRegistry, clients, bookings, vehicles]);

  return { loading, error, results, refetch: fetchAll };
}

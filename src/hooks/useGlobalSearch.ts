// src/hooks/useGlobalSearch.ts
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { clientsApi } from "@/lib/api/clients";
import { bookingsApi } from "@/lib/api/bookings";
import { vehiclesApi } from "@/lib/api/vehicles";
import { useAuth } from "@/context/auth-context";
import type { Client, Booking, Vehicle } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import {
  getPagesForRole,
  toPageResult,
  type RegistrySection,
} from "@/lib/search/page-registry";
import {
  statusesInText,
  statusesForEntity,
  isPureStatusQuery,
} from "@/lib/search/status-registry";

/* ──────────────────────────────────────────────────────────────────────
   Public types
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
  icon: LucideIcon;
  section: RegistrySection;
}

export interface GroupedResults {
  pages: PageResult[];
  clients: ClientResult[];
  bookings: BookingResult[];
  vehicles: VehicleResult[];
  total: number;
  /** Statuses the query implicitly referenced, for UI chips. */
  detectedStatuses: string[];
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
const STATUS_ONLY_PAGE_BOOST = 10;

/* ──────────────────────────────────────────────────────────────────────
   Text helpers
────────────────────────────────────────────────────────────────────── */

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Does any token match any haystack string (substring, both directions)? */
function anyTokenMatches(
  tokens: string[],
  haystacks: Array<string | null | undefined>,
): boolean {
  const clean = haystacks.filter(
    (h): h is string => typeof h === "string" && h.length > 0,
  );
  if (clean.length === 0 || tokens.length === 0) return false;

  for (const tok of tokens) {
    for (const hay of clean) {
      const h = hay.toLowerCase();
      if (h.includes(tok) || tok.includes(h)) return true;
    }
  }
  return false;
}

/* ──────────────────────────────────────────────────────────────────────
   Entity matchers — text AND status-aware
────────────────────────────────────────────────────────────────────── */

function matchesClientText(c: Client, tokens: string[]): boolean {
  return anyTokenMatches(tokens, [
    c.full_name,
    c.first_name,
    c.last_name,
    c.phone,
    c.email,
    c.id_number,
    c.dl_number,
  ]);
}

function clientHasStatus(c: Client, statuses: Set<string>): boolean {
  if (statuses.size === 0) return true;
  // Client rows carry `status` (ClientStatus). Verification statuses live
  // in `verification_status` — match against either when the query lists
  // a verification term.
  const verificationStatuses = new Set(
    statusesForEntity("client_verification").map((s) => s.value),
  );
  for (const s of statuses) {
    if (verificationStatuses.has(s) && c.verification_status === s) return true;
    if (c.status === s) return true;
  }
  return false;
}

function matchesBookingText(b: Booking, tokens: string[]): boolean {
  const client = b.client as Client | undefined;
  const vehicle = b.vehicle as Vehicle | undefined;
  return anyTokenMatches(tokens, [
    b.booking_number,
    String(b.id),
    b.destination,
    b.pickup_location,
    b.return_location,
    b.client_name,
    b.client_phone,
    client?.full_name,
    client?.first_name,
    client?.last_name,
    client?.phone,
    b.vehicle_name,
    b.vehicle_plate,
    vehicle?.make,
    vehicle?.model,
    vehicle?.plate_number,
  ]);
}

function bookingHasStatus(b: Booking, statuses: Set<string>): boolean {
  if (statuses.size === 0) return true;
  const cancellationReasons = new Set(
    statusesForEntity("cancellation_reason").map((s) => s.value),
  );
  for (const s of statuses) {
    // Booking statuses
    if (b.status === s) return true;
    // Cancellation reasons — matched against `cancellation_reason`, not status
    if (cancellationReasons.has(s) && b.cancellation_reason === s) return true;
  }
  return false;
}

function matchesVehicleText(v: Vehicle, tokens: string[]): boolean {
  return anyTokenMatches(tokens, [
    v.make,
    v.model,
    v.plate_number,
    v.vin,
  ]);
}

function vehicleHasStatus(v: Vehicle, statuses: Set<string>): boolean {
  if (statuses.size === 0) return true;
  for (const s of statuses) {
    if (v.status === s) return true;
  }
  return false;
}

/* ──────────────────────────────────────────────────────────────────────
   Page matcher — text, alias, or status-keyword
────────────────────────────────────────────────────────────────────── */

function pageMatches(
  entry: ReturnType<typeof getPagesForRole>[number],
  tokens: string[],
  rawLower: string,
  detectedStatuses: Set<string>,
): boolean {
  // 1. Label / description / section / aliases / statusKeywords
  const haystacks: string[] = [
    entry.label,
    entry.description,
    entry.section,
    ...entry.aliases,
    ...(entry.statusKeywords ?? []),
  ];

  if (anyTokenMatches(tokens, haystacks)) return true;
  if (haystacks.some((h) => h.toLowerCase().includes(rawLower))) return true;

  // 2. Status keyword cross-match
  if (detectedStatuses.size > 0 && entry.statusKeywords) {
    for (const k of entry.statusKeywords) {
      if (detectedStatuses.has(k)) return true;
    }
  }

  return false;
}

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

  /* Role-scoped pages — the only gate. Viewport never matters here. */
  const pagesForRole = useMemo(() => getPagesForRole(user?.role), [user?.role]);

  /* Data fetch — unchanged. */
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

  /* Result computation — the interesting part. */
  const results = useMemo<GroupedResults>(() => {
    const raw = query.trim();
    if (!raw) {
      return {
        pages: [],
        clients: [],
        bookings: [],
        vehicles: [],
        total: 0,
        detectedStatuses: [],
      };
    }

    const tokens = tokenize(raw);
    const rawLower = raw.toLowerCase();

    /* 1. Status detection — from typed text. */
    const detectedStatuses = statusesInText(raw);
    const isPureStatus = isPureStatusQuery(raw);

    /* 2. Filter to statuses that make sense for each entity. */
    const clientStatuses = new Set(
      Array.from(detectedStatuses).filter((s) =>
        statusesForEntity("client").some((d) => d.value === s) ||
        statusesForEntity("client_verification").some((d) => d.value === s),
      ),
    );
    const bookingStatuses = new Set(
      Array.from(detectedStatuses).filter(
        (s) =>
          statusesForEntity("booking").some((d) => d.value === s) ||
          statusesForEntity("cancellation_reason").some((d) => d.value === s),
      ),
    );
    const vehicleStatuses = new Set(
      Array.from(detectedStatuses).filter((s) =>
        statusesForEntity("vehicle").some((d) => d.value === s),
      ),
    );

    /* 3. Pages — role-scoped, status-aware, weighted. */
    const pages: PageResult[] = [];
    const pageWeights: Array<{ result: PageResult; weight: number }> = [];

    for (const entry of pagesForRole) {
      if (!pageMatches(entry, tokens, rawLower, detectedStatuses)) continue;

      let weight = entry.weight ?? 0;
      // Pure-status query → boost pages whose statusKeywords matched
      if (
        isPureStatus &&
        (entry.statusKeywords ?? []).some((k) => detectedStatuses.has(k))
      ) {
        weight += STATUS_ONLY_PAGE_BOOST;
      }
      pageWeights.push({ result: toPageResult(entry), weight });
    }

    pageWeights.sort((a, b) => b.weight - a.weight);
    for (const { result } of pageWeights) pages.push(result);

    /* 4. Data rows — text match AND status match. */
    const textTokensForEntities = isPureStatus ? [] : tokens;

    const clientsOut: ClientResult[] = clients
      .filter(
        (c) =>
          (textTokensForEntities.length === 0 ||
            matchesClientText(c, textTokensForEntities)) &&
          clientHasStatus(c, clientStatuses),
      )
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

    const bookingsOut: BookingResult[] = bookings
      .filter(
        (b) =>
          (textTokensForEntities.length === 0 ||
            matchesBookingText(b, textTokensForEntities)) &&
          bookingHasStatus(b, bookingStatuses),
      )
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

    const vehiclesOut: VehicleResult[] = vehicles
      .filter(
        (v) =>
          (textTokensForEntities.length === 0 ||
            matchesVehicleText(v, textTokensForEntities)) &&
          vehicleHasStatus(v, vehicleStatuses),
      )
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
      pages,
      clients: clientsOut,
      bookings: bookingsOut,
      vehicles: vehiclesOut,
      total:
        pages.length +
        clientsOut.length +
        bookingsOut.length +
        vehiclesOut.length,
      detectedStatuses: Array.from(detectedStatuses),
    };
  }, [query, pagesForRole, clients, bookings, vehicles]);

  return { loading, error, results, refetch: fetchAll };
}

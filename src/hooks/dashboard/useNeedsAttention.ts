// src/hooks/dashboard/useNeedsAttention.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { vehiclesApi } from "@/lib/api/vehicles";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import type { Vehicle, Booking, Client } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────────────
   Public shapes
────────────────────────────────────────────────────────────────────── */

export interface ServiceDueAlert {
  id: number;
  plate_number: string;
  make: string;
  model: string;
  current_mileage: number;
  next_service_km: number | null;
  /** Positive = over by N km, negative = N km remaining */
  delta_km: number;
}

export interface OverdueReturnAlert {
  id: number;
  client_name: string | null;
  client_phone: string | null;
  vehicle_plate: string | null;
  vehicle_name: string | null;
  scheduled_return_at: string;
  overdue_minutes: number;
}

export interface ExpiringDocAlert {
  id: number;
  title: string;
  subtitle: string | null;
  expiry_date: string;
  days_until_expiry: number;
  is_expired: boolean;
}

export interface NeedsAttentionData {
  serviceDue: ServiceDueAlert[];
  overdueReturns: OverdueReturnAlert[];
  expiringClientDls: ExpiringDocAlert[];
  expiringVehicleInsurance: ExpiringDocAlert[];
  totalCount: number;
  loading: boolean;
  refetch: () => Promise<void>;
}

/* ──────────────────────────────────────────────────────────────────────
   Config
────────────────────────────────────────────────────────────────────── */

const REFRESH_COOLDOWN_MS = 2000;
const EXPIRY_WINDOW_DAYS = 7;
const MS_PER_DAY = 86_400_000;

/* ──────────────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────────────── */

const parseDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Days from now to the given date. Negative = past.
 * Uses floor of calendar days in UTC so "7 days" reads consistently.
 */
const daysUntil = (date: Date): number => {
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / MS_PER_DAY);
};

/* ──────────────────────────────────────────────────────────────────────
   Hook
────────────────────────────────────────────────────────────────────── */

export function useNeedsAttention(): NeedsAttentionData {
  const [serviceDue, setServiceDue] = useState<ServiceDueAlert[]>([]);
  const [overdueReturns, setOverdueReturns] = useState<OverdueReturnAlert[]>([]);
  const [expiringClientDls, setExpiringClientDls] = useState<ExpiringDocAlert[]>([]);
  const [expiringVehicleInsurance, setExpiringVehicleInsurance] = useState<
    ExpiringDocAlert[]
  >([]);
  const [loading, setLoading] = useState(true);

  const lastFetchAt = useRef<number>(0);
  const inFlight = useRef<boolean>(false);

  const fetchAll = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchAt.current < REFRESH_COOLDOWN_MS) return;
    if (inFlight.current) return;

    inFlight.current = true;
    setLoading(true);
    try {
      // ✅ Parallel fetch — backend caches per tenant, marginal cost is small
      const [vehicles, bookings, clients] = await Promise.all([
        vehiclesApi.list({ page_size: 200 }),
        bookingsApi.list({ page_size: 200 }),
        clientsApi.list({ page_size: 200 }),
      ]);

      // ── Service due ────────────────────────────────────────────────
      const dueList: ServiceDueAlert[] = vehicles
        .filter((v: Vehicle) => {
          if (v.mileage_due) return true;
          if (v.next_service_km === null || v.next_service_km === undefined)
            return false;
          return v.current_mileage >= v.next_service_km;
        })
        .map((v: Vehicle) => {
          const next = v.next_service_km ?? v.current_mileage;
          return {
            id: v.id,
            plate_number: v.plate_number,
            make: v.make,
            model: v.model,
            current_mileage: v.current_mileage,
            next_service_km: v.next_service_km ?? null,
            delta_km: v.current_mileage - next,
          };
        })
        .sort((a, b) => b.delta_km - a.delta_km);

      // ── Overdue returns ────────────────────────────────────────────
      const nowMs = Date.now();
      const overdueList: OverdueReturnAlert[] = bookings
        .filter((b: Booking) => {
          if (b.status !== "active") return false;
          const ret = parseDate(b.scheduled_return_at ?? b.end_date);
          if (!ret) return false;
          return ret.getTime() < nowMs;
        })
        .map((b: Booking) => {
          const ret = parseDate(b.scheduled_return_at ?? b.end_date)!;
          return {
            id: b.id,
            client_name: b.client_name ?? b.client?.full_name ?? null,
            client_phone: b.client_phone ?? b.client?.phone ?? null,
            vehicle_plate: b.vehicle_plate ?? b.vehicle?.plate_number ?? null,
            vehicle_name:
              b.vehicle_name ??
              (b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : null),
            scheduled_return_at: ret.toISOString(),
            overdue_minutes: Math.floor((nowMs - ret.getTime()) / 60_000),
          };
        })
        .sort((a, b) => b.overdue_minutes - a.overdue_minutes);

      // ── Expiring client DLs ────────────────────────────────────────
      const dlList: ExpiringDocAlert[] = clients
        .filter((c: Client) => {
          if (c.is_archived) return false;
          const dlExpiry = parseDate(c.dl_expiry);
          if (!dlExpiry) return false;
          return daysUntil(dlExpiry) <= EXPIRY_WINDOW_DAYS;
        })
        .map((c: Client) => {
          const dlExpiry = parseDate(c.dl_expiry)!;
          const days = daysUntil(dlExpiry);
          return {
            id: c.id,
            title: c.full_name,
            subtitle: c.phone ?? null,
            expiry_date: dlExpiry.toISOString(),
            days_until_expiry: days,
            is_expired: days < 0,
          };
        })
        .sort((a, b) => a.days_until_expiry - b.days_until_expiry);

      // ── Expiring vehicle insurance ─────────────────────────────────
      const insuranceList: ExpiringDocAlert[] = vehicles
        .filter((v: Vehicle) => {
          const expiry = parseDate(v.insurance_expiry);
          if (!expiry) return false;
          return daysUntil(expiry) <= EXPIRY_WINDOW_DAYS;
        })
        .map((v: Vehicle) => {
          const expiry = parseDate(v.insurance_expiry)!;
          const days = daysUntil(expiry);
          return {
            id: v.id,
            title: `${v.make} ${v.model}`,
            subtitle: v.plate_number ?? null,
            expiry_date: expiry.toISOString(),
            days_until_expiry: days,
            is_expired: days < 0,
          };
        })
        .sort((a, b) => a.days_until_expiry - b.days_until_expiry);

      setServiceDue(dueList);
      setOverdueReturns(overdueList);
      setExpiringClientDls(dlList);
      setExpiringVehicleInsurance(insuranceList);
      lastFetchAt.current = Date.now();
    } catch (err) {
      console.error("Failed to load needs-attention data:", err);
      // Fail soft — keep the previous state, don't wipe
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  // Initial load (forced — bypasses cooldown on mount)
  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  // ✅ Focus + visibility refresh (self-throttled by cooldown)
  useLiveRefresh(() => fetchAll());

  // ✅ Cross-tab / modal-driven refresh + network reconnect
  useEffect(() => {
    const handle = () => fetchAll();
    const handleForce = () => fetchAll(true);

    window.addEventListener("booking:created", handle);
    window.addEventListener("booking:updated", handle);
    window.addEventListener("vehicle:updated", handle);
    window.addEventListener("client:updated", handle);
    window.addEventListener("online", handleForce);

    return () => {
      window.removeEventListener("booking:created", handle);
      window.removeEventListener("booking:updated", handle);
      window.removeEventListener("vehicle:updated", handle);
      window.removeEventListener("client:updated", handle);
      window.removeEventListener("online", handleForce);
    };
  }, [fetchAll]);

  const totalCount =
    serviceDue.length +
    overdueReturns.length +
    expiringClientDls.length +
    expiringVehicleInsurance.length;

  return {
    serviceDue,
    overdueReturns,
    expiringClientDls,
    expiringVehicleInsurance,
    totalCount,
    loading,
    refetch: () => fetchAll(true),
  };
}

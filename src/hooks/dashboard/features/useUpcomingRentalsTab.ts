// src/hooks/dashboard/features/useUpcomingRentalsTab.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import type { Booking } from "@/lib/types";

/**
 * ✅ UPCOMING RENTALS — pending + confirmed bookings only.
 *
 * Scope: rentals that haven't started yet. Excludes `active` (in progress),
 * `completed`, and `cancelled`. Sorted by start date ascending (soonest first).
 *
 * Live refresh:
 *   - focus / visibilitychange (via useLiveRefresh)
 *   - booking:created / booking:updated window events
 *   - online (network reconnect)
 *
 * Cooldown: rapid focus+visibility fires are collapsed to one fetch.
 */

const REFRESH_COOLDOWN_MS = 2000;

export function useUpcomingRentalsTab() {
  const [rentals, setRentals] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Cooldown guard — collapses focus+visibility burst into one fetch.
  const lastFetchAt = useRef<number>(0);
  const inFlight = useRef<boolean>(false);

  const fetchRentals = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchAt.current < REFRESH_COOLDOWN_MS) return;
    if (inFlight.current) return;

    inFlight.current = true;
    setLoading(true);
    try {
      const items = await bookingsApi.list({ page_size: 50 });

      const upcoming = items
        .filter((b) => b.status === "pending" || b.status === "confirmed")
        .sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );

      setRentals(upcoming);
      lastFetchAt.current = Date.now();
    } catch (error) {
      console.error("Failed to load upcoming rentals:", error);
      setRentals([]);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  // Initial load (forced — bypasses cooldown on mount)
  useEffect(() => {
    fetchRentals(true);
  }, [fetchRentals]);

  // ✅ Focus + visibility refresh (self-throttled by cooldown above)
  useLiveRefresh(() => fetchRentals());

  // ✅ Cross-tab / modal-driven refresh + network reconnect
  useEffect(() => {
    const handleBookingEvent = () => fetchRentals();
    const handleOnline = () => fetchRentals(true); // force on reconnect

    window.addEventListener("booking:created", handleBookingEvent);
    window.addEventListener("booking:updated", handleBookingEvent);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("booking:created", handleBookingEvent);
      window.removeEventListener("booking:updated", handleBookingEvent);
      window.removeEventListener("online", handleOnline);
    };
  }, [fetchRentals]);

  return { rentals, loading, refetch: () => fetchRentals(true) };
}

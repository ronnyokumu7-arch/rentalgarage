// src/hooks/dashboard/features/useReturningTodayTab.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import type { Booking } from "@/lib/types";

/**
 * ✅ RETURNING TODAY — active trips due back within the next 24 hours.
 *
 * Trip clock: anchored to the scheduled return timestamp, NOT calendar midnight.
 *     (scheduled_return_at ?? end_date) - now <= 24h
 *
 * Negative diffs (return time already passed) are INCLUDED — those are overdue
 * returns and belong on this surface, flagged rose by the consumer.
 *
 * Live refresh:
 *   - focus / visibilitychange (via useLiveRefresh)
 *   - booking:created / booking:updated window events
 *   - online (network reconnect)
 *
 * Cooldown: rapid focus+visibility fires are collapsed to one fetch.
 */

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const REFRESH_COOLDOWN_MS = 2000;

export function useReturningTodayTab() {
  const [returns, setReturns] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const lastFetchAt = useRef<number>(0);
  const inFlight = useRef<boolean>(false);

  const fetchReturns = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchAt.current < REFRESH_COOLDOWN_MS) return;
    if (inFlight.current) return;

    inFlight.current = true;
    setLoading(true);
    try {
      const items = await bookingsApi.list({ page_size: 50 });
      const nowMs = Date.now();

      const dueSoon = items
        .filter((b) => {
          if (b.status !== "active") return false;
          const returnAt = new Date(
            b.scheduled_return_at ?? b.end_date
          ).getTime();
          if (Number.isNaN(returnAt)) return false;
          return returnAt - nowMs <= WINDOW_MS;
        })
        .sort((a, b) => {
          const aAt = new Date(a.scheduled_return_at ?? a.end_date).getTime();
          const bAt = new Date(b.scheduled_return_at ?? b.end_date).getTime();
          return aAt - bAt;
        });

      setReturns(dueSoon);
      lastFetchAt.current = Date.now();
    } catch (error) {
      console.error("Failed to load returning rentals:", error);
      setReturns([]);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns(true);
  }, [fetchReturns]);

  // ✅ Focus + visibility refresh (self-throttled by cooldown above)
  useLiveRefresh(() => fetchReturns());

  // ✅ Cross-tab / modal-driven refresh + network reconnect
  useEffect(() => {
    const handleBookingEvent = () => fetchReturns();
    const handleOnline = () => fetchReturns(true);

    window.addEventListener("booking:created", handleBookingEvent);
    window.addEventListener("booking:updated", handleBookingEvent);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("booking:created", handleBookingEvent);
      window.removeEventListener("booking:updated", handleBookingEvent);
      window.removeEventListener("online", handleOnline);
    };
  }, [fetchReturns]);

  /**
   * ✅ Overdue helper — true when the scheduled return has already passed.
   */
  const isOverdue = useCallback((rental: Booking): boolean => {
    const returnAt = new Date(
      rental.scheduled_return_at ?? rental.end_date
    ).getTime();
    if (Number.isNaN(returnAt)) return false;
    return returnAt < Date.now();
  }, []);

  return { returns, loading, isOverdue, refetch: () => fetchReturns(true) };
}

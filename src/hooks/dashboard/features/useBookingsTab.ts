// src/hooks/dashboard/features/useBookingsTab.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

export function useBookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingBookingId, setActingBookingId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const items = await bookingsApi.list({ page_size: 50 });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter: Include Pending, Confirmed, and Active (but hide active trips that are NOT ending today)
      const filtered = items.filter((b) => {
        if (!["pending", "confirmed", "active"].includes(b.status)) return false;
        if (b.status === "active") {
          const endDate = new Date(b.end_date);
          endDate.setHours(0, 0, 0, 0);
          return endDate <= today;
        }
        return true;
      });

      // Auto-organize: Pending -> Confirmed -> Active (Ending Today)
      const statusOrder: Record<string, number> = { pending: 0, confirmed: 1, active: 2 };
      const sorted = filtered.sort((a, b) => {
        const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        if (statusDiff !== 0) return statusDiff;
        
        const dateA = new Date(a.status === "active" ? a.end_date : a.start_date).getTime();
        const dateB = new Date(b.status === "active" ? b.end_date : b.start_date).getTime();
        return dateA - dateB;
      });

      setBookings(sorted.slice(0, 8));
    } catch (e) {
      console.error("Failed to load upcoming bookings:", e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleAction = async (id: number, action: "activate" | "complete" | "cancel") => {
    setActingBookingId(id);
    setOpenMenuId(null);
    const successMessages = {
      activate: "Trip started — vehicle is now active",
      complete: "Trip completed",
      cancel: "Booking cancelled",
    };
    try {
      if (action === "cancel") {
        await bookingsApi.cancel(id, { reason: "agency_cancelled" });
      } else {
        await bookingsApi[action](id);
      }
      toast.success(successMessages[action]);
      await fetchBookings();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Action failed. Try again.");
    } finally {
      setActingBookingId(null);
    }
  };

  const closeMenu = () => setOpenMenuId(null);

  return {
    bookings,
    loading,
    actingBookingId,
    openMenuId,
    setOpenMenuId,
    handleAction,
    closeMenu,
    refetch: fetchBookings,
  };
}

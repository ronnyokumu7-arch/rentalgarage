// src/hooks/bookings/useBookingsList.ts
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking, BookingStatus } from "@/lib/types";

export type ViewMode = "active" | "vault";

export function useBookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      // If vault, we might need a specific endpoint or parameter. 
      // For now, we fetch all and filter client-side or via API params.
      const data = await bookingsApi.list({ include_archived: view === "vault" });
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings;

    if (view === "active") {
      result = result.filter(b => b.status !== "cancelled" && b.status !== "completed");
    } else {
      result = result.filter(b => b.status === "completed" || b.status === "cancelled");
    }

    if (statusFilter) {
      result = result.filter(b => b.status === statusFilter);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(b => 
        b.id.toString().includes(lowerSearch) || 
        b.destination?.toLowerCase().includes(lowerSearch) ||
        b.pickup_location?.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [bookings, view, statusFilter, search]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  return {
    loading, view, setView, search, setSearch, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, filteredBookings, paginatedBookings, totalPages,
    refetch: fetchBookings
  };
}

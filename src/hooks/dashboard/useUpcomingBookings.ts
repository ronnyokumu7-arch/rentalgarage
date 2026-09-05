import { useState, useEffect, useCallback } from "react";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";

export function useUpcomingBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const allBookings = await bookingsApi.list();
      const upcoming = allBookings
        .filter(b => b.status === 'confirmed' || b.status === 'active')
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .slice(0, 5);
      setBookings(upcoming);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ LIVE REFRESH: focus + visibility listeners for cross-tab changes
  useLiveRefresh(fetchBookings);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ✅ AUTO-REFRESH: listen for booking creation + updates from modals / inline contexts
  useEffect(() => {
    const handleBookingEvent = () => fetchBookings();
    window.addEventListener('booking:created', handleBookingEvent);
    window.addEventListener('booking:updated', handleBookingEvent);
    
    return () => {
      window.removeEventListener('booking:created', handleBookingEvent);
      window.removeEventListener('booking:updated', handleBookingEvent);
    };
  }, [fetchBookings]);

  return { bookings, loading };
}

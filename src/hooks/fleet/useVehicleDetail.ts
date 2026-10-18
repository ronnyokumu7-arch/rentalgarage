import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Booking, Vehicle } from "@/lib/types";

export interface VehicleDerivedStats {
  activeTrip: Booking | null;
  bookings: Booking[];
  totalBookings: number;
  last30dBookings: number;
  utilizationPct: number;
  kmToService: number | null;
  isDueForService: boolean;
  serviceThresholdKm: number | null;
  daysSinceLastService: number | null;
}

export function useVehicleDetail(id: number) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [v, b] = await Promise.all([
        vehiclesApi.get(id),
        vehiclesApi.getBookings(id).catch(() => [] as Booking[]),
      ]);
      setVehicle(v);
      setBookings(b);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail || "Failed to load vehicle");
      toast.error("Failed to load vehicle");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stats = useMemo<VehicleDerivedStats>(() => {
    if (!vehicle) {
      return {
        activeTrip: null,
        bookings: [],
        totalBookings: 0,
        last30dBookings: 0,
        utilizationPct: 0,
        kmToService: null,
        isDueForService: false,
        serviceThresholdKm: null,
        daysSinceLastService: null,
      };
    }

    const activeTrip =
      bookings.find((b) => b.status === "active") ||
      bookings.find((b) => b.status === "confirmed") ||
      null;

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const last30dBookings = bookings.filter(
      (b) => new Date(b.start_date).getTime() >= cutoff
    ).length;

    // Simple utilization: 30-day booking count as % of 30 days (capped).
    // A booking that spans N days counts as N toward the cap.
    const utilizationDays = bookings
      .filter((b) => new Date(b.start_date).getTime() >= cutoff)
      .reduce((sum, b) => {
        const s = new Date(b.start_date).getTime();
        const e = new Date(b.end_date).getTime();
        const days = Math.max(1, Math.ceil((e - s) / 86_400_000));
        return sum + days;
      }, 0);
    const utilizationPct = Math.min(100, Math.round((utilizationDays / 30) * 100));

    const kmToService =
      vehicle.next_service_km !== null
        ? vehicle.next_service_km - vehicle.current_mileage
        : null;
    const isDueForService = kmToService !== null && kmToService <= 500;

    const daysSinceLastService = (() => {
      // Approximate: last time the vehicle was updated (mileage update / maintenance).
      const updated = new Date(vehicle.updated_at).getTime();
      if (Number.isNaN(updated)) return null;
      return Math.max(0, Math.floor((Date.now() - updated) / 86_400_000));
    })();

    return {
      activeTrip,
      bookings,
      totalBookings: bookings.length,
      last30dBookings,
      utilizationPct,
      kmToService,
      isDueForService,
      serviceThresholdKm: vehicle.next_service_km,
      daysSinceLastService,
    };
  }, [vehicle, bookings]);

  return { vehicle, bookings, loading, error, stats, refetch: fetchAll };
}

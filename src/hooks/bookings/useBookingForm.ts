"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { bookingsApi } from "@/lib/api/bookings";
import { clientsApi } from "@/lib/api/clients";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Client, Vehicle } from "@/lib/types";

export function useBookingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [formData, setFormData] = useState({
    client_id: "",
    vehicle_id: "",
    start_date: "",
    end_date: "",
    pickup_location: "",
    return_location: "",
    destination: "",
    daily_rate: "",
    currency_code: "KES",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, vehiclesRes] = await Promise.all([
          clientsApi.list(),
          vehiclesApi.list({ status: "available" }),
        ]);
        setClients(clientsRes);
        setVehicles(vehiclesRes);
      } catch (error) {
        console.error("Failed to load form data:", error);
        toast.error("Failed to load clients or vehicles.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.vehicle_id && vehicles.length > 0) {
      const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id));
      if (selectedVehicle && selectedVehicle.daily_rate) {
        setFormData(prev => ({
          ...prev,
          daily_rate: selectedVehicle.daily_rate.toString()
        }));
      }
    }
  }, [formData.vehicle_id, vehicles]);

  const calculations = useMemo(() => {
    const start = formData.start_date ? new Date(formData.start_date) : null;
    const end = formData.end_date ? new Date(formData.end_date) : null;
    const rate = parseFloat(formData.daily_rate) || 0;

    let days = 0;
    if (start && end && end > start) {
      days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      days,
      daily_rate: rate,
      total_amount: days * rate,
    };
  }, [formData.start_date, formData.end_date, formData.daily_rate]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id || !formData.vehicle_id || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (calculations.daily_rate <= 0 || calculations.total_amount <= 0 || calculations.days <= 0) {
      toast.error("Invalid pricing or dates. Ensure the vehicle has a daily rate and dates are correct.");
      return;
    }

    setLoading(true);
    try {
      const newBooking = await bookingsApi.create({
        client_id: parseInt(formData.client_id),
        vehicle_id: parseInt(formData.vehicle_id),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        pickup_location: formData.pickup_location,
        return_location: formData.return_location,
        destination: formData.destination || undefined,
        daily_rate: calculations.daily_rate,
        total_amount: calculations.total_amount,
        currency_code: formData.currency_code,
      });

      toast.success("Booking created! You can now generate a quotation.");

      if (newBooking && newBooking.id) {
        router.push(`/dashboard/bookings/${newBooking.id}`);
      } else {
        router.push("/dashboard/bookings");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail;
      console.error("Booking Creation Failed:", errorMsg);
      toast.error(Array.isArray(errorMsg) ? errorMsg.map((e: any) => e.msg).join(', ') : errorMsg || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    updateField,
    handleSubmit,
    loading,
    clients,
    vehicles,
    calculations
  };
}

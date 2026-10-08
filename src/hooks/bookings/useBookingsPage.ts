// src/hooks/bookings/useBookingsPage.ts
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useBookingsList } from "@/hooks/bookings/useBookingsList";
import { useBookingsReferenceData } from "@/hooks/bookings/useBookingsReferenceData";
import { useExtendBooking } from "@/hooks/bookings/useExtendBooking";
import { bookingsApi } from "@/lib/api/bookings";
import { BookingCreate } from "@/lib/types";
import { differenceInDays } from "date-fns";
import { getApiErrorMessage } from "@/lib/api-error";

export type TabMode = "list" | "calendar";

export function useBookingsPage() {
  const [activeTab, setActiveTab] = useState<TabMode>("list");

  const bookingsData = useBookingsList();
  const { clientMap, vehicleMap, isLoading: isRefDataLoading } = useBookingsReferenceData();
  
  const {
    isOpen: isExtendModalOpen,
    selectedBooking,
    isLoading: isExtending,
    openModal: openExtendModal,
    closeExtendModal,
    handleExtend,
  } = useExtendBooking(bookingsData.refetch || (() => {}));

  const handleCreateBookingFromCalendar = async (payload: {
    vehicleId: number;
    startDate: string;
    endDate: string;
    clientId: number;
  }) => {
    try {
      const days = Math.max(1, differenceInDays(new Date(payload.endDate), new Date(payload.startDate)) + 1);

      // Safely extract vehicle regardless of whether vehicleMap is Array, Map, or Object
      const targetVehicle = Array.isArray(vehicleMap)
        ? vehicleMap.find((v) => v.id === payload.vehicleId)
        : vehicleMap instanceof Map
        ? vehicleMap.get(payload.vehicleId)
        : (vehicleMap as Record<number, any>)?.[payload.vehicleId];

      const dailyRate = Number(targetVehicle?.daily_rate || 0);

      // ✅ Strictly aligned with BookingCreate interface (snake_case)
      const bookingPayload: BookingCreate = {
        vehicle_id: payload.vehicleId,
        client_id: payload.clientId,
        start_date: `${payload.startDate}T00:00:00Z`,
        end_date: `${payload.endDate}T23:59:59Z`,
        total_amount: days * dailyRate,
        currency_code: "KES",
        // Note: Removed 'notes' as it&apos;s not in the BookingCreate interface. 
        // If your backend accepts it, add `notes?: string` to BookingCreate in src/lib/types.ts
      };

      await bookingsApi.create(bookingPayload);
      toast.success("Booking created successfully from calendar!");

      // Refresh the list to update the Gantt chart immediately
      if (bookingsData.refetch) {
        await bookingsData.refetch();
      }
    } catch (error: any) {
      const serverMessage = getApiErrorMessage(error, "Unable to reach the server. Please try again.");
      console.error("Booking creation failed:", serverMessage);
      if (!error.response?.data?.message) toast.error(serverMessage);
    }
  };

  return {
    activeTab,
    setActiveTab,
    bookingsData,
    clientMap,
    vehicleMap,
    isRefDataLoading,
    isExtendModalOpen,
    selectedBooking,
    isExtending,
    openExtendModal,
    closeExtendModal,
    handleExtend,
    handleCreateBookingFromCalendar,
  };
}

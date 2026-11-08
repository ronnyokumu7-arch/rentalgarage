// src/lib/api/bookings.ts
import apiClient from "@/lib/api-client";
import type { Booking } from "@/lib/types";

export interface BookingCreatePayload {
  client_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  pickup_location?: string;
  return_location?: string;
  destination?: string;
  daily_rate: number;
  total_amount: number;
  currency_code?: string;
}

export interface BookingListParams {
  include_archived?: boolean;
  vehicle_id?: number;
  client_id?: number;
}

export const bookingsApi = {
  // 1. List all active bookings
  list: async (params?: BookingListParams): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>("/bookings", { params });
    return res.data;
  },

  // 2. List archived (vault) bookings
  listArchived: async (): Promise<Booking[]> => {
    const res = await apiClient.get<Booking[]>("/bookings/archived");
    return res.data;
  },

  // 3. Get single booking by ID
  getById: async (id: number): Promise<Booking> => {
    const res = await apiClient.get<Booking>(`/bookings/${id}`);
    return res.data;
  },

  // 4. Create new booking
  create: async (payload: BookingCreatePayload): Promise<Booking> => {
    const res = await apiClient.post<Booking>("/bookings", payload);
    return res.data;
  },

  // 5. Update booking
  update: async (id: number, payload: Partial<BookingCreatePayload>): Promise<Booking> => {
    const res = await apiClient.patch<Booking>(`/bookings/${id}`, payload);
    return res.data;
  },

  // 6. Generate quotation link
  generateQuotation: async (id: number): Promise<{ share_url: string; token: string; expires_at: string }> => {
    const res = await apiClient.post(`/bookings/${id}/generate-quotation`);
    return res.data;
  },

  // 7. Lifecycle transitions
  transitionStatus: async (id: number, action: "confirm" | "activate" | "complete" | "cancel"): Promise<Booking> => {
    const res = await apiClient.post<Booking>(`/bookings/${id}/${action}`);
    return res.data;
  },
};

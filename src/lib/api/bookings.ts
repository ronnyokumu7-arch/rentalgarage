import apiClient from "@/lib/api-client";
import type {
  Booking,
  BookingCreate,
  BookingUpdate,
  BookingQuote,
  PricingResult,
  PaginatedResponse,
  CancellationReason,
} from "@/lib/types";

export interface ExtendBookingPayload {
  new_end_date: string;
  extension_reason?: string;
}

export interface GenerateInvoicePayload {
  custom_amount?: number;
  due_date?: string;
  notes?: string;
}

// ✅ LIFECYCLE: cancel-with-reason payload (replaces removed no_show status)
export interface CancelBookingPayload {
  reason: CancellationReason;
  note?: string;
}

export const bookingsApi = {
  get: (id: number) =>
    apiClient.get<Booking>(`/bookings/${id}`).then((r) => r.data),

  list: (params?: { vehicle_id?: number; client_id?: number; page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Booking>>("/bookings/", { params }).then((r) => r.data.items),

  listArchived: (params?: { page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Booking>>("/bookings/archived", { params }).then((r) => r.data.items),

  quote: (data: BookingQuote) =>
    apiClient.post<PricingResult>("/bookings/quote", data).then((r) => r.data),

  create: (data: BookingCreate) =>
    apiClient.post<Booking>("/bookings", data).then((r) => r.data),

  update: (id: number, data: BookingUpdate) =>
    apiClient.patch<Booking>(`/bookings/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/bookings/${id}`),

  generateInvoice: (id: number, payload?: GenerateInvoicePayload) =>
    apiClient.post<{ share_token: string; token: string; expires_at: string }>(
      `/bookings/${id}/generate-invoice`,
      payload || {}
    ).then((r) => r.data),

  confirm: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/confirm`).then((r) => r.data),

  activate: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/activate`).then((r) => r.data),

  complete: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/complete`).then((r) => r.data),

  // ✅ LIFECYCLE: cancel with reason (new requirement)
  cancel: (id: number, payload?: CancelBookingPayload) =>
    apiClient.post<Booking>(`/bookings/${id}/cancel`, payload || {}).then((r) => r.data),

  // ⚠️ DEPRECATED: no_show is now a cancel shortcut (reason=no_show).
  // Backend endpoint kept for backward compat; new code should call cancel directly.
  noShow: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/no-show`).then((r) => r.data),

  archive: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/archive`).then((r) => r.data),

  restore: (id: number) =>
    apiClient.post<Booking>(`/bookings/${id}/restore`).then((r) => r.data),

  extend: (id: number, payload: ExtendBookingPayload) =>
    apiClient.post<{
      message: string;
      booking_id: number;
      extra_days: number;
      additional_cost: number;
      new_end_date: string;
      invoice_updated: boolean;
    }>(`/bookings/${id}/extend`, payload).then((r) => r.data),
};

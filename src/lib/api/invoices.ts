import apiClient from "@/lib/api-client";
import type { Invoice, InvoiceCreate, InvoiceUpdate, InvoiceStatus, PaymentMethod, PaginatedResponse } from "@/lib/types";

export interface RecordPaymentPayload {
  amount: number;
  currency_code?: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface PublicPaymentPayload {
  amount: number;
  currency_code?: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export const invoicesApi = {
  // ✅ FIXED: Unwrap .items from PaginatedResponse, added page/page_size params
  list: (params?: { status?: InvoiceStatus; booking_id?: number; page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Invoice>>("/invoices/", { params }).then((r) => r.data.items),

  getById: (id: number) =>
    apiClient.get<Invoice>(`/invoices/${id}`).then((r) => r.data),

  create: (payload: InvoiceCreate) =>
    apiClient.post<Invoice>("/invoices/", payload).then((r) => r.data),

  update: (id: number, payload: InvoiceUpdate) =>
    apiClient.patch<Invoice>(`/invoices/${id}`, payload).then((r) => r.data),

  void: (id: number) =>
    apiClient.post<Invoice>(`/invoices/${id}/void`).then((r) => r.data),

  downloadPdf: (id: number) =>
    apiClient.get(`/invoices/${id}/pdf`, { responseType: "blob" }),

  // ✅ FIXED: Added share_url to the return type to match the backend response
  generateShareLink: (id: number) =>
    apiClient.post<{ share_token: string; share_url: string; expires_at: string }>(
      `/invoices/${id}/share-link`
    ).then((r) => r.data),

  getByToken: (token: string) =>
    apiClient.get(`/invoices/public/${token}`).then((r) => r.data),

  recordPayment: (invoiceId: number, payload: RecordPaymentPayload) =>
    apiClient.post(`/invoices/${invoiceId}/record-payment`, payload).then((r) => r.data),

  recordPaymentByToken: (token: string, payload: PublicPaymentPayload) =>
    apiClient.post<Invoice>(`/invoices/public/${token}/pay`, payload).then((r) => r.data),

  downloadPdfByToken: (token: string) =>
    apiClient.get(`/invoices/public/${token}/pdf`, { responseType: "blob" }),

  // =============================================================================
  // ✅ LIFECYCLE: Public quotation actions (client-driven, token-scoped, no auth)
  // =============================================================================
  
  /**
   * ✅ Client accepts the quotation:
   *   quotation→invoice (due=start) + booking pending→confirmed +
   *   auto-contract (+ background PDF). ONE atomic commit.
   */
  acceptPublic: (token: string) =>
    apiClient.post<Invoice>(`/invoices/public/${token}/accept`).then((r) => r.data),

  /**
   * ✅ Client cancels: booking→cancelled (reason=client_cancelled) + invoice void.
   */
  cancelPublic: (token: string) =>
    apiClient.post<Invoice>(`/invoices/public/${token}/cancel`).then((r) => r.data),

  /**
   * ✅ Client reschedules: re-prices server-side + resets to quotation for re-accept.
   */
  reschedulePublic: (token: string, payload: { pickup_at: string; scheduled_return_at: string }) =>
    apiClient.post<Invoice>(`/invoices/public/${token}/reschedule`, payload).then((r) => r.data),
};

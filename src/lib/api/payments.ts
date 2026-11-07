import apiClient from "@/lib/api-client";
import type { Payment, PaymentStatus, PaymentMethod, PaginatedResponse } from "@/lib/types";

export interface PaymentVoidPayload {
  reason: string;
}

export const paymentsApi = {
  // ✅ FIXED: Unwrap .items from PaginatedResponse, added page/page_size params
  list: async (params?: {
    invoice_id?: number;
    status?: PaymentStatus;
    method?: PaymentMethod;
    page?: number;
    page_size?: number;
  }): Promise<Payment[]> => {
    const res = await apiClient.get<PaginatedResponse<Payment>>("/payments/", { params });
    return res.data.items;
  },

  void: async (id: number, payload: PaymentVoidPayload): Promise<Payment> => {
    const res = await apiClient.post<Payment>(`/payments/${id}/void`, payload);
    return res.data;
  },

  confirm: async (id: number): Promise<Payment> => {
    const res = await apiClient.post<Payment>(`/payments/${id}/confirm`);
    return res.data;
  },

  exportCsv: async (params?: { start_date?: string; end_date?: string }) => {
    return apiClient.get("/payments/export/csv", {
      params,
      responseType: "blob",
    });
  },
};

// src/lib/api/quotations.ts
import apiClient from "@/lib/api-client";
import type { Quotation, PublicQuotationView } from "@/lib/types";

export interface QuotationCreatePayload {
  client_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  pickup_location: string;
  return_location: string;
  destination?: string;
  daily_rate: number;
  total_amount: number;
  currency_code?: string;
  terms_and_conditions?: string;
  admin_notes?: string;
}

export const quotationsApi = {
  // ── DASHBOARD / AUTHENTICATED ENDPOINTS ────────────────────────────────
  
  list: async (status?: string): Promise<Quotation[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<Quotation[]>("/quotations", { params });
    return res.data;
  },

  getById: async (id: number): Promise<Quotation> => {
    const res = await apiClient.get<Quotation>(`/quotations/${id}`);
    return res.data;
  },

  create: async (payload: QuotationCreatePayload): Promise<Quotation> => {
    const res = await apiClient.post<Quotation>("/quotations", payload);
    return res.data;
  },

  generateShareLink: async (id: number): Promise<{ share_url: string; share_token: string; expires_at: string }> => {
    const res = await apiClient.post(`/quotations/${id}/share-link`);
    return res.data;
  },

  // ── PUBLIC PORTAL ENDPOINTS (NO AUTH REQUIRED) ─────────────────────────

  // 1. Fetch quotation details via public share token
  getByToken: async (token: string): Promise<PublicQuotationView> => {
    const res = await apiClient.get<PublicQuotationView>(`/quotations/public/${token}`);
    return res.data;
  },

  // 2. Client accepts the quote (Triggers Booking + Contract + Invoice creation on backend)
  acceptByToken: async (token: string): Promise<{ message: string }> => {
    const res = await apiClient.post(`/quotations/public/${token}/accept`);
    return res.data;
  },

  // 3. Client declines the quote
  declineByToken: async (token: string): Promise<{ message: string }> => {
    const res = await apiClient.post(`/quotations/public/${token}/decline`);
    return res.data;
  },
};

// src/lib/api/invoices.ts
import apiClient from "@/lib/api-client";
import type { Invoice, InvoiceUpdatePayload, PublicInvoiceView } from "@/lib/types";

export interface InvoiceCreatePayload {
  booking_id: number;
  due_date: string;
  notes?: string;
}

export const invoicesApi = {
  // ── DASHBOARD / AUTHENTICATED ENDPOINTS ────────────────────────────────
  
  list: async (status?: string): Promise<Invoice[]> => {
    const params = status ? { status } : {};
    const res = await apiClient.get<Invoice[]>("/invoices", { params });
    return res.data;
  },

  getById: async (id: number): Promise<Invoice> => {
    const res = await apiClient.get<Invoice>(`/invoices/${id}`);
    return res.data;
  },

  create: async (payload: InvoiceCreatePayload): Promise<Invoice> => {
    const res = await apiClient.post<Invoice>("/invoices", payload);
    return res.data;
  },

  update: async (id: number, payload: InvoiceUpdatePayload): Promise<Invoice> => {
    const res = await apiClient.patch<Invoice>(`/invoices/${id}`, payload);
    return res.data;
  },

  void: async (id: number): Promise<Invoice> => {
    const res = await apiClient.post<Invoice>(`/invoices/${id}/void`);
    return res.data;
  },

  generateShareLink: async (id: number): Promise<{ share_url: string; share_token: string; expires_at: string }> => {
    const res = await apiClient.post(`/invoices/${id}/share-link`);
    return res.data;
  },

  // ── PUBLIC PORTAL ENDPOINTS (NO AUTH REQUIRED) ─────────────────────────

  // 1. Fetch invoice details via public share token
  getByToken: async (token: string): Promise<PublicInvoiceView> => {
    const res = await apiClient.get<PublicInvoiceView>(`/invoices/public/${token}`);
    return res.data;
  },

  // 2. Simulate offline payment (marks invoice as paid via public token)
  // In production, this would be replaced by a Stripe/M-Pesa webhook endpoint.
  markAsPaidByToken: async (token: string): Promise<PublicInvoiceView> => {
    const res = await apiClient.post<PublicInvoiceView>(`/invoices/public/${token}/pay`);
    return res.data;
  },

  // 3. Download PDF via public share token
  downloadPdf: async (token: string): Promise<Blob> => {
    const res = await apiClient.get(`/invoices/public/${token}/pdf`, {
      responseType: "blob",
    });
    return res.data;
  },
};

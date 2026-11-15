// src/lib/api/contracts.ts
import apiClient from "@/lib/api-client";
import type { Contract, PublicContractView, PaginatedResponse } from "@/lib/types";

export const contractsApi = {
  // ✅ Unwrap .items from PaginatedResponse, added page/page_size params
  list: (params?: { booking_id?: number; contract_status?: string; page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<Contract>>("/contracts/", { params }).then((r) => r.data.items),

  // ✅ Correct backend route /contracts/bookings/{id}/regenerate
  generateForBooking: (bookingId: number) =>
    apiClient.post<Contract>(`/contracts/bookings/${bookingId}/regenerate`, {}, { timeout: 60000 }).then((r) => r.data),

  // ✅ RENAMED: getById -> get (for consistency with other API files)
  get: (id: number) =>
    apiClient.get<Contract>(`/contracts/${id}`).then((r) => r.data),

  void: (id: number) =>
    apiClient.post<Contract>(`/contracts/${id}/void`).then((r) => r.data),

  // ✅ FIXED: Added 60s timeout to prevent premature timeout during PDF generation
  regenerate: (bookingId: number) =>
    apiClient.post<Contract>(`/contracts/bookings/${bookingId}/regenerate`, {}, { timeout: 60000 }).then((r) => r.data),

  // ✅ 60s timeout so slow PDF regeneration isn't killed at 15s
  downloadPdf: (id: number) =>
    apiClient.get(`/contracts/${id}/pdf`, { responseType: "blob", timeout: 60000 }),

  // ✅ share_url typed so the hook can build the full link
  generateShareLink: (id: number) =>
    apiClient.post<{ share_token: string; share_url: string; expires_at: string }>(
      `/contracts/${id}/share-link`
    ).then((r) => r.data),

  sendToClient: (id: number) =>
    apiClient.post<Contract>(`/contracts/${id}/send-to-client`).then((r) => r.data),

  publicView: (token: string) =>
    apiClient.get<PublicContractView>(`/contracts/public/${token}`).then((r) => r.data),

  publicSign: (token: string, signature?: string) =>
    apiClient.post<{ message: string }>(`/contracts/public/${token}/sign`, { signature }).then((r) => r.data),

  // ✅ 60s timeout for the public PDF as well
  publicDownloadPdf: (token: string) =>
    apiClient.get(`/contracts/public/${token}/pdf`, { responseType: "blob", timeout: 60000 }),
};

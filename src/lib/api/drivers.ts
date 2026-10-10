import apiClient from "@/lib/api-client";
import type { Driver, DriverCreate, DriverListItem, DriverUpdate, PaginatedResponse } from "@/lib/types";

export const driversApi = {
  // ── Core CRUD ──────────────────────────────────────────────────────────────
  list: (params?: {
    status?: string;
    include_archived?: boolean;
    search?: string;
    page?: number;
    page_size?: number;
  }) =>
    apiClient
      .get<PaginatedResponse<DriverListItem>>("/drivers/", { params })
      .then((r) => r.data.items),

  get: (id: number) =>
    apiClient.get<Driver>(`/drivers/${id}`).then((r) => r.data),

  create: (data: DriverCreate) =>
    apiClient.post<Driver>("/drivers/", data).then((r) => r.data),

  update: (id: number, data: DriverUpdate) =>
    apiClient.patch<Driver>(`/drivers/${id}`, data).then((r) => r.data),

  archive: (id: number) =>
    apiClient.post<Driver>(`/drivers/${id}/archive`).then((r) => r.data),

  restore: (id: number) =>
    apiClient.post<Driver>(`/drivers/${id}/restore`).then((r) => r.data),

  // ── Vetting & Verification (NEW) ───────────────────────────────────────────
  startVerification: (id: number) =>
    apiClient.post<{ verification_link: string; channels_sent: string[]; expires_at: string }>(`/drivers/${id}/start-verification`).then((r) => r.data),

  reviewDriver: (id: number, data: { decision: "approve" | "reject"; rejection_notes?: string }) =>
    apiClient.post<{ type: string; message: string }>(`/drivers/${id}/review`, data).then((r) => r.data),
};

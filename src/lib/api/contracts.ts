// src/lib/api/contracts.ts
import apiClient from "@/lib/api-client";
import type { Contract, PublicContractView } from "@/lib/types";

// ✅ Extracted helper to avoid TypeScript 'this' context errors in object literals
const _generateShareLink = async (id: number) => {
  const res = await apiClient.post(`/contracts/${id}/share-link`);
  return res.data;
};

export const contractsApi = {
  list: async (params?: { booking_id?: number; contract_status?: string }): Promise<Contract[]> => {
    const res = await apiClient.get<Contract[]>("/contracts", { params });
    return res.data;
  },

  getById: async (id: number): Promise<Contract> => {
    const res = await apiClient.get<Contract>(`/contracts/${id}`);
    return res.data;
  },

  publicView: async (token: string): Promise<PublicContractView> => {
    const res = await apiClient.get<PublicContractView>(`/contracts/public/${token}`);
    return res.data;
  },

  getByToken: async (token: string): Promise<PublicContractView> => {
    return contractsApi.publicView(token);
  },

  signByToken: async (token: string, signatureData: string): Promise<PublicContractView> => {
    const res = await apiClient.post<PublicContractView>(
      `/contracts/public/${token}/sign`,
      { signature_data: signatureData }
    );
    return res.data;
  },

  publicSign: async (token: string): Promise<{ message: string }> => {
    const res = await apiClient.post(`/contracts/public/${token}/sign`);
    return res.data;
  },

  publicDownloadPdf: async (token: string) => {
    const res = await apiClient.get(`/contracts/public/${token}/pdf`, { responseType: "blob" });
    return res;
  },

  // Returns full Axios response so page.tsx can access response.data for the blob
  downloadPdf: async (id: number) => {
    const res = await apiClient.get(`/contracts/${id}/pdf`, { responseType: "blob" });
    return res; 
  },

  void: async (id: number): Promise<Contract> => {
    const res = await apiClient.post<Contract>(`/contracts/${id}/void`);
    return res.data;
  },

  // ✅ Now using the extracted helper directly
  generateShareLink: _generateShareLink,

  // ✅ Alias used in your page.tsx, pointing to the exact same helper
  shareLink: _generateShareLink, 

  sendToClient: async (id: number): Promise<Contract> => {
    const res = await apiClient.post<Contract>(`/contracts/${id}/send-to-client`);
    return res.data;
  },

  // Matches backend POST /contracts/bookings/{booking_id}/regenerate
  regenerate: async (bookingId: number): Promise<Contract> => {
    const res = await apiClient.post<Contract>(`/contracts/bookings/${bookingId}/regenerate`);
    return res.data;
  },
};

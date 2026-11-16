// src/lib/api/tenant-profile.ts
import apiClient from "@/lib/api-client";
import type { TenantProfile } from "@/lib/types";

// These keys match the backend's explicit mapping in tenant_profile.py
export interface TenantProfilePayload {
  company_name?: string;
  business_location?: string; // Maps to DB 'address'
  phone?: string;
  email?: string;
  website?: string;
  kra_pin?: string;           // Maps to DB 'tax_number'
  logo_url?: string;
  contract_terms?: string;    // Maps to DB 'contract_terms'
  contract_footer?: string;   // Maps to DB 'contract_footer'
}

export const tenantProfileApi = {
  get: async (): Promise<TenantProfile> => {
    return apiClient.get<TenantProfile>("/tenant-profile/").then((r) => r.data);
  },
  create: async (payload: TenantProfilePayload): Promise<TenantProfile> => {
    return apiClient.post<TenantProfile>("/tenant-profile/", payload).then((r) => r.data);
  },
  update: async (payload: TenantProfilePayload): Promise<TenantProfile> => {
    return apiClient.patch<TenantProfile>("/tenant-profile/", payload).then((r) => r.data);
  },
};

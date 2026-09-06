// src/lib/api/policies.ts
import apiClient from "@/lib/api-client";

export type PolicyCategory =
  | "agency_policies"
  | "statutory_declaration"
  | "general_conditions";

export interface CategoryLabel {
  value: PolicyCategory;
  label: string;
}

/** Merged clause view — what the contract renders and the settings page previews. */
export interface PolicyClauseDTO {
  category: PolicyCategory;
  clause_key: string | null;
  title: string;
  content: string;
  display_order: number;
  is_custom: boolean;
  policy_id: number | null;
}

/** Full policy document response (defaults or effective). */
export interface PolicyDocumentDTO {
  categories: CategoryLabel[];
  document: Record<PolicyCategory, PolicyClauseDTO[]>;
}

/** Raw tenant override/custom row. */
export interface TenantPolicyRow {
  id: number;
  tenant_id: number;
  category: PolicyCategory;
  clause_key: string | null;
  title: string;
  content: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PolicyCreatePayload {
  category: PolicyCategory;
  clause_key?: string | null;
  title: string;
  content: string;
  is_active?: boolean;
  display_order?: number;
}

export interface PolicyUpdatePayload {
  title?: string;
  content?: string;
  is_active?: boolean;
  display_order?: number;
}

export const policiesApi = {
  /** Platform default document (single source of truth). */
  getDefaults: () =>
    apiClient.get<PolicyDocumentDTO>("/policies/defaults").then((r) => r.data),

  /** Merged effective document in contract order. */
  getEffective: () =>
    apiClient.get<PolicyDocumentDTO>("/policies/effective").then((r) => r.data),

  /** Tenant's override + custom rows (paginated backend — unwrap defensively). */
  list: async (): Promise<TenantPolicyRow[]> => {
    const res = await apiClient.get("/policies/", { params: { page: 1, page_size: 200 } });
    const data: any = res.data;
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  create: (payload: PolicyCreatePayload) =>
    apiClient.post<TenantPolicyRow>("/policies/", payload).then((r) => r.data),

  update: (id: number, payload: PolicyUpdatePayload) =>
    apiClient.patch<TenantPolicyRow>(`/policies/${id}`, payload).then((r) => r.data),

  toggle: (id: number) =>
    apiClient.post<TenantPolicyRow>(`/policies/${id}/toggle`).then((r) => r.data),

  remove: (id: number) => apiClient.delete(`/policies/${id}`),
};

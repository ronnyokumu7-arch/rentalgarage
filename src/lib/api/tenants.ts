// src/lib/api/tenants.ts
import apiClient from "@/lib/api-client";
import type { AgencyHealthData, SubscriptionOut } from '@/lib/types';
import type {
  Tenant,
  CreateTenantPayload,
  UpdateTenantPayload,
  PaymentGatewayConfig,
  PaymentGatewayPayload,
  GatewayType,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Recovery & Security Interfaces
// ---------------------------------------------------------------------------
export interface AdminRecoveryOptions {
  admin_email_masked: string;
  admin_phone_masked: string | null;
  phone_verified: boolean;
  reset_attempts_remaining: number;
  email_change_cooldown_minutes: number;
  last_reset_request_at: string | null;
}

export interface ChangeAdminEmailPayload {
  new_email: string;
  verification_method: "email" | "phone" | "manual_override";
  reason: string;
  otp?: string;
}

export interface SendResetLinkPayload {
  send_to_email: boolean;
  send_to_phone: boolean;
  custom_message?: string;
}

// ---------------------------------------------------------------------------
// ✅ Lifecycle Action Payloads (typed, audited)
// ---------------------------------------------------------------------------
export interface SuspendPayload {
  reason: string; // min 10 chars enforced by backend
}

export interface UnsuspendPayload {
  note?: string; // optional reinstatement note
}

export interface ArchivePayload {
  reason: string; // min 10 chars enforced by backend
}

export interface RestorePayload {
  note?: string; // optional restore note
}

// ---------------------------------------------------------------------------
// ✅ Subscription Management Payloads (Super Admin)
// ---------------------------------------------------------------------------
export interface ExtendTrialPayload {
  days: number; // 1-365 days to extend
}

export interface BulkExtendTrialsPayload {
  days: number; // 1-365 days to extend all active trials
}

export interface BulkExtendTrialsResponse {
  updated: number;
  days_added: number;
}

// ---------------------------------------------------------------------------
// Tenant List Response
// ---------------------------------------------------------------------------
export interface TenantListResponse {
  data?: Tenant[];
  items?: Tenant[];
  total?: number;
  page?: number;
  page_size?: number;
}

export interface TenantListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: "ACTIVE" | "SUSPENDED" | "VAULTED" | "ATTENTION" | null;
  show_archived?: boolean;
}

export const tenantsApi = {
  /**
   * GET /tenants/
   * Returns paginated list of tenants with effective-status scoping.
   * Handles both array and paginated object responses.
   */
  list: async (params: TenantListParams = {}): Promise<Tenant[]> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", String(params.page));
    if (params.page_size) queryParams.set("page_size", String(params.page_size));
    if (params.search) queryParams.set("search", params.search);
    if (params.status) queryParams.set("status", params.status);
    if (params.show_archived) queryParams.set("show_archived", "true");

    const res = await apiClient
      .get<Tenant[] | TenantListResponse>(`/tenants/?${queryParams.toString()}`)
      .then((r) => r.data);

    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  },

  /**
   * GET /tenants/me
   * Fetches active tenant context for current authenticated tenant admin.
   */
  getMe: async (): Promise<Tenant> => {
    return apiClient.get<Tenant>("/tenants/me").then((r) => r.data);
  },

  /**
   * PATCH /tenants/me
   * Self-service update for active tenant admin.
   */
  updateMe: async (payload: UpdateTenantPayload): Promise<Tenant> => {
    return apiClient.patch<Tenant>("/tenants/me", payload).then((r) => r.data);
  },

  /**
   * GET /tenants/{tenant_id}
   * Retrieves full details for a single tenant by ID.
   */
  getById: async (id: number | string): Promise<Tenant> => {
    return apiClient.get<Tenant>(`/tenants/${id}`).then((r) => r.data);
  },

  /**
   * POST /tenants/
   * Provisions a new tenant workspace and initial admin account.
   */
  create: async (payload: CreateTenantPayload): Promise<Tenant> => {
    return apiClient.post<Tenant>("/tenants/", payload).then((r) => r.data);
  },

  /**
   * PATCH /tenants/{tenant_id}
   * Super Admin update for specific tenant configuration.
   * ⚠️ CONTRACT RULE: lifecycle fields (is_active, is_archived) are rejected.
   */
  update: async (
    id: number | string,
    payload: UpdateTenantPayload
  ): Promise<Tenant> => {
    return apiClient.patch<Tenant>(`/tenants/${id}`, payload).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/transition-to-payg
   */
  transitionToPayg: async (id: number | string): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/transition-to-payg`).then((r) => r.data);
  },

  // ---------------------------------------------------------------------------
  // ✅ Lifecycle Endpoints (typed, audited, self-guarded)
  // ---------------------------------------------------------------------------

  /**
   * POST /tenants/{tenant_id}/suspend
   * Manual super-admin suspension. Reason is mandatory (min 10 chars).
   * ⚠️ Self-guard: cannot suspend your own tenant.
   */
  suspend: async (id: number | string, payload: SuspendPayload): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/suspend`, payload).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/activate
   * Restores agency access (unsuspends). Optional note for audit trail.
   */
  activate: async (id: number | string, payload?: UnsuspendPayload): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/activate`, payload || {}).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/activate (alias for unsuspend)
   * Restores agency access after manual suspension.
   */
  unsuspend: async (id: number | string, payload?: UnsuspendPayload): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/activate`, payload || {}).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/archive
   * Moves tenant to Vault (soft delete). Reason is mandatory (min 10 chars).
   * ⚠️ Self-guard: cannot vault your own tenant.
   */
  archive: async (id: number | string, payload: ArchivePayload): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/archive`, payload).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/restore
   * ✅ NEW: Restores tenant from Vault. Optional note for audit trail.
   * Allowed on own tenant (recovery path while session lives).
   */
  restore: async (id: number | string, payload?: RestorePayload): Promise<Tenant> => {
    return apiClient.post<Tenant>(`/tenants/${id}/restore`, payload || {}).then((r) => r.data);
  },

  /**
   * DELETE /tenants/{tenant_id}
   */
  delete: async (id: number | string, hardDelete = false): Promise<void> => {
    return apiClient.delete(`/tenants/${id}`, { params: { hard_delete: hardDelete } });
  },

  // ---------------------------------------------------------------------------
  // 🛡️ Recovery & Security Endpoints
  // ---------------------------------------------------------------------------

  /**
   * GET /tenants/{tenant_id}/admin-recovery-options
   * Returns masked contacts and rate limit status for recovery UI.
   */
  getRecoveryOptions: async (id: number | string): Promise<AdminRecoveryOptions> => {
    return apiClient.get<AdminRecoveryOptions>(`/tenants/${id}/admin-recovery-options`).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/change-admin-email
   * High-security dual-channel email change with OTP verification.
   */
  changeAdminEmail: async (
    id: number | string,
    payload: ChangeAdminEmailPayload
  ): Promise<{ message: string; new_email: string; notification_sent_to: string }> => {
    return apiClient.post(`/tenants/${id}/change-admin-email`, payload).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/send-reset-link
   * Triggers password reset instructions via email and/or SMS.
   */
  sendResetLink: async (
    id: number | string,
    payload: SendResetLinkPayload
  ): Promise<{ message: string }> => {
    return apiClient.post(`/tenants/${id}/send-reset-link`, payload).then((r) => r.data);
  },

  // ---------------------------------------------------------------------------
  // 💳 Payment Gateway Endpoints (Strictly Typed)
  // ---------------------------------------------------------------------------

  /**
   * GET /tenants/{tenant_id}/payment-gateways
   * Lists all configured gateways with masked credentials.
   */
  getPaymentGateways: async (
    id: number | string
  ): Promise<{ gateways: PaymentGatewayConfig[] }> => {
    return apiClient.get<{ gateways: PaymentGatewayConfig[] }>(`/tenants/${id}/payment-gateways`).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/payment-gateways/{gateway_type}
   * Creates a new gateway configuration.
   */
  createPaymentGateway: async (
    id: number | string,
    gatewayType: GatewayType | string,
    payload: PaymentGatewayPayload
  ): Promise<PaymentGatewayConfig> => {
    return apiClient.post<PaymentGatewayConfig>(`/tenants/${id}/payment-gateways/${gatewayType}`, payload).then((r) => r.data);
  },

  /**
   * PATCH /tenants/{tenant_id}/payment-gateways/{gateway_type}/{config_id}
   * Updates an existing gateway configuration.
   * ⚠️ CRITICAL: The payload MUST NOT contain masked credentials (e.g., "****1234"),
   * or the backend will overwrite the real secrets with the masked strings.
   */
  updatePaymentGateway: async (
    id: number | string,
    gatewayType: GatewayType | string,
    configId: number,
    payload: PaymentGatewayPayload
  ): Promise<PaymentGatewayConfig> => {
    return apiClient.patch<PaymentGatewayConfig>(`/tenants/${id}/payment-gateways/${gatewayType}/${configId}`, payload).then((r) => r.data);
  },

  /**
   * POST /tenants/{tenant_id}/payment-gateways/{gateway_type}/test
   * Tests connectivity to a gateway without saving credentials.
   */
  testPaymentGateway: async (
    id: number | string,
    gatewayType: GatewayType | string,
    payload: PaymentGatewayPayload
  ): Promise<{ gateway_type: string; status: string; message: string }> => {
    return apiClient.post(`/tenants/${id}/payment-gateways/${gatewayType}/test`, payload).then((r) => r.data);
  },

  /**
   * DELETE /tenants/{tenant_id}/payment-gateways/{gateway_type}/{config_id}
   * Deletes a gateway configuration.
   */
  deletePaymentGateway: async (
    id: number | string,
    gatewayType: GatewayType | string,
    configId: number
  ): Promise<void> => {
    return apiClient.delete(`/tenants/${id}/payment-gateways/${gatewayType}/${configId}`).then((r) => r.data);
  },

  // ---------------------------------------------------------------------------
  // 📊 Agency Health Endpoints
  // ---------------------------------------------------------------------------

  /**
   * GET /tenants/{tenant_id}/health
   * Get privacy-safe aggregate health metrics for an agency.
   * Only accessible by Super Admins.
   */
  getHealthMetrics: async (tenantId: number | string): Promise<AgencyHealthData> => {
    return apiClient.get<AgencyHealthData>(`/tenants/${tenantId}/health`).then((r) => r.data);
  },

  // ---------------------------------------------------------------------------
  // 🎯 Subscription Management (Super Admin)
  // ---------------------------------------------------------------------------

  /**
   * GET /subscriptions/?tenant_id={tenantId}
   * Fetches all subscriptions for a specific tenant.
   * Returns the first (most recent) subscription, or null if none exist.
   */
  getSubscriptionsForTenant: async (tenantId: number | string): Promise<SubscriptionOut | null> => {
    const res = await apiClient.get<{ items: SubscriptionOut[] }>(`/subscriptions/?tenant_id=${tenantId}`).then((r) => r.data);
    return res.items && res.items.length > 0 ? res.items[0] : null;
  },

  /**
   * POST /subscriptions/{subscriptionId}/extend-trial
   * Extends a single active trial by N days (1-365).
   * Only works on subscriptions with status 'trial' or 'starter_trial'.
   */
  extendTrial: async (subscriptionId: number, payload: ExtendTrialPayload): Promise<SubscriptionOut> => {
    return apiClient.post<SubscriptionOut>(`/subscriptions/${subscriptionId}/extend-trial`, payload).then((r) => r.data);
  },

  /**
   * POST /subscriptions/admin/bulk-extend-trials
   * Extends ALL active trials by N days (1-365) in one operation.
   * Returns the count of updated subscriptions.
   */
  bulkExtendTrials: async (payload: BulkExtendTrialsPayload): Promise<BulkExtendTrialsResponse> => {
    return apiClient.post<BulkExtendTrialsResponse>("/subscriptions/admin/bulk-extend-trials", payload).then((r) => r.data);
  },

  /**
   * POST /subscriptions/{subscriptionId}/cancel
   * Cancels a subscription immediately.
   * Super Admin only.
   */
  cancelSubscription: async (subscriptionId: number): Promise<SubscriptionOut> => {
    return apiClient.post<SubscriptionOut>(`/subscriptions/${subscriptionId}/cancel`).then((r) => r.data);
  },
};

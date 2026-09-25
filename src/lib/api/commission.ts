// src/lib/api/commission.ts
import apiClient from "@/lib/api-client";

export interface CommissionSummary {
  currency_code: string;
  today_count: number;
  today_total: string;
  outstanding_count: number;
  outstanding_balance: string;
  oldest_unpaid_at: string | null;
  grace_days: number;
  days_until_lock: number | null;
  soft_locked: boolean;
}

export interface CommissionEvent {
  id: number;
  booking_id: number;
  amount: string;
  currency_code: string;
  status: "unpaid" | "paid" | "waived";
  trip_started_at: string;
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
}

export interface CommissionPayment {
  id: number;
  tenant_id: number;
  amount: string;
  currency_code: string;
  reference: string;
  status: "pending" | "verified" | "rejected";
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface CommissionPaymentInfo {
  currency_code: string;

  // What they owe right now (ALL unpaid events, including today's)
  outstanding_balance: string;
  outstanding_count: number;

  // ✅ M-PESA PLATFORM PAYBILL TRIPLE — the paybill agencies pay COMMISSIONS to.
  // Deliberately distinct from a tenant's own customer-facing paybill
  // (which lives in payment-gateway config, not here).
  platform_paybill: string | null;          // Business number (e.g., 400200)
  platform_account_number: string | null;   // Account behind the Paybill
  platform_account_name: string | null;     // Registered name — tenant confirms recipient

  // Record keeping
  platform_phone: string | null;
  platform_email: string | null;

  // The reference the tenant should quote when paying (your matching key)
  payment_reference_hint: string | null;

  // Latest submission awaiting verification (if any)
  pending_payment: CommissionPayment | null;
}

export interface CommissionPaymentVerifyResult {
  payment: CommissionPayment;
  events_marked_paid: number;
  unapplied_amount: string;
}

export interface PlatformSettings {
  id: number;

  // PAYG engine knobs
  commission_amount: string;
  grace_period_days: number;

  // M-PESA PAYBILL TRIPLE
  platform_paybill: string | null;
  platform_account_number: string | null;
  platform_account_name: string | null;

  // Record keeping
  platform_phone: string | null;
  platform_email: string | null;

  updated_at: string;
}

export interface PlatformSettingsUpdatePayload {
  commission_amount: number;
  grace_period_days: number;
  platform_paybill: string | null;
  platform_account_number: string | null;
  platform_account_name: string | null;
  platform_phone: string | null;
  platform_email: string | null;
}

export const commissionApi = {
  /** Daily-resetting commission summary for the dashboard. */
  getSummary: () => apiClient.get<CommissionSummary>("/commission/summary"),

  /** Commission event history (ledger). */
  getEvents: (limit: number = 50) =>
    apiClient.get<CommissionEvent[]>("/commission/events", { params: { limit } }),

  /** What's owed + platform Paybill triple + pending submission (if any). */
  getPaymentInfo: () => apiClient.get<CommissionPaymentInfo>("/commission/payment-info"),

  /** Tenant self-reports a commission payment (M-Pesa code). */
  submitPayment: (payload: { amount: number; reference: string; notes?: string }) =>
    apiClient.post<CommissionPayment>("/commission/payments", payload),

  /** Tenant&apos;s commission payment history. */
  getPayments: (limit: number = 20) =>
    apiClient.get<CommissionPayment[]>("/commission/payments", { params: { limit } }),
};

export const commissionAdminApi = {
  /** Verification queue (super admin). Filter: pending | verified | rejected */
  listPayments: (status: "pending" | "verified" | "rejected" = "pending", limit = 100) =>
    apiClient.get<CommissionPayment[]>("/commission/admin/payments", {
      params: { status, limit },
    }),

  /** Confirm money received → flips events to paid → tenant unlocks instantly. */
  verify: (paymentId: number) =>
    apiClient.post<CommissionPaymentVerifyResult>(
      `/commission/admin/payments/${paymentId}/verify`
    ),

  /** Reject with reason — tenant keeps owing and sees your note. */
  reject: (paymentId: number, notes: string) =>
    apiClient.post<CommissionPayment>(
      `/commission/admin/payments/${paymentId}/reject`,
      { notes }
    ),
};

export const platformSettingsAdminApi = {
  /** Load the Commission Settings form (super admin only). */
  get: () => apiClient.get<PlatformSettings>("/commission/admin/settings"),

  /** Save the form — takes effect immediately for all tenants. */
  update: (payload: PlatformSettingsUpdatePayload) =>
    apiClient.put<PlatformSettings>("/commission/admin/settings", payload),
};

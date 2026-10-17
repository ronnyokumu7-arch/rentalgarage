// src/lib/search/status-registry.ts
"use client";

/**
 * Canonical status registry.
 *
 * Every `value` here MUST match a literal in `src/lib/types.ts`.
 * Aliases are for user-typed search terms only — never for DB values.
 * When a new status is added to `types.ts`, add it here and it becomes
 * searchable automatically (page surfacing + row filtering).
 */

export type StatusEntity =
  | "client"
  | "client_verification"
  | "driver"
  | "driver_verification"
  | "vehicle"
  | "booking"
  | "cancellation_reason"
  | "invoice"
  | "contract"
  | "payment"
  | "task"
  | "user"
  | "investor"
  | "investor_lease"
  | "investor_contract"
  | "investor_earning"
  | "tenant"
  | "subscription"
  | "support";

export interface StatusDefinition {
  /** Canonical value — must match `types.ts`. */
  value: string;
  /** Human-readable label. */
  label: string;
  /** Alternate spellings users might type. */
  aliases: string[];
  /** Which entity types this status applies to. */
  appliesTo: StatusEntity[];
}

/* ──────────────────────────────────────────────────────────────────────
   Registry
────────────────────────────────────────────────────────────────────── */

export const STATUS_REGISTRY: StatusDefinition[] = [
  /* ════════════════════════════════════════════════════════════════
     CLIENT — ClientStatus + ClientVerificationStatus
  ════════════════════════════════════════════════════════════════ */
  {
    value: "active",
    label: "Active",
    aliases: ["active", "live", "current", "running"],
    appliesTo: ["client", "driver", "vehicle", "booking", "user", "investor", "tenant"],
  },
  {
    value: "pending",
    label: "Pending",
    aliases: ["pending", "awaiting", "queued", "submitted"],
    appliesTo: ["client", "driver", "booking", "payment", "task", "user", "investor", "investor_lease"],
  },
  {
    value: "inactive",
    label: "Inactive",
    aliases: ["inactive", "dormant", "idle"],
    appliesTo: ["client", "user"],
  },
  {
    value: "suspended",
    label: "Suspended",
    aliases: ["suspended", "blocked", "banned", "disabled"],
    appliesTo: ["client", "driver", "user", "investor", "tenant", "subscription"],
  },
  {
    value: "unverified",
    label: "Unverified",
    aliases: ["unverified", "not verified", "no kyc", "not vetted"],
    appliesTo: ["client_verification", "driver_verification"],
  },
  {
    value: "sent",
    label: "Link Sent",
    aliases: ["sent", "link sent", "invite sent", "verification sent"],
    appliesTo: ["client_verification", "driver_verification", "invoice", "contract"],
  },
  {
    value: "under_review",
    label: "Under Review",
    aliases: ["under review", "in review", "reviewing", "verification pending"],
    appliesTo: ["client_verification", "driver_verification"],
  },
  {
    value: "verified",
    label: "Verified",
    aliases: ["verified", "approved", "vetted"],
    appliesTo: ["client_verification", "driver_verification"],
  },
  {
    value: "rejected",
    label: "Rejected",
    aliases: ["rejected", "denied", "declined"],
    appliesTo: ["client_verification", "driver_verification"],
  },

  /* ════════════════════════════════════════════════════════════════
     DRIVER — DriverStatus
  ════════════════════════════════════════════════════════════════ */
  {
    value: "available",
    label: "Available",
    aliases: ["available", "free", "ready"],
    appliesTo: ["driver", "vehicle"],
  },
  {
    value: "on_trip",
    label: "On Trip",
    aliases: ["on trip", "on a trip", "driving", "assigned"],
    appliesTo: ["driver"],
  },
  {
    value: "on_leave",
    label: "On Leave",
    aliases: ["on leave", "leave", "vacation", "holiday", "off"],
    appliesTo: ["driver"],
  },

  /* ════════════════════════════════════════════════════════════════
     VEHICLE — VehicleStatus
  ════════════════════════════════════════════════════════════════ */
  {
    value: "rented",
    label: "Rented",
    aliases: ["rented", "on rent", "booked out", "out on rent"],
    appliesTo: ["vehicle"],
  },
  {
    value: "maintenance",
    label: "Maintenance",
    aliases: ["maintenance", "in maintenance", "in service", "in garage", "repair"],
    appliesTo: ["vehicle"],
  },
  {
    value: "pending_activation",
    label: "Pending Activation",
    aliases: ["pending activation", "not activated", "onboarding"],
    appliesTo: ["vehicle"],
  },
  {
    value: "retired",
    label: "Retired",
    aliases: ["retired", "sold", "decommissioned"],
    appliesTo: ["vehicle"],
  },

  /* ════════════════════════════════════════════════════════════════
     BOOKING — BookingStatus (5 states only)
  ════════════════════════════════════════════════════════════════ */
  {
    value: "confirmed",
    label: "Confirmed",
    aliases: ["confirmed", "approved", "scheduled", "booked"],
    appliesTo: ["booking"],
  },
  {
    value: "completed",
    label: "Completed",
    aliases: ["completed", "done", "finished", "closed", "settled"],
    appliesTo: ["booking", "payment", "task"],
  },
  {
    value: "cancelled",
    label: "Cancelled",
    aliases: ["cancelled", "canceled", "aborted"],
    appliesTo: ["booking", "subscription", "tenant"],
  },

  /* ════════════════════════════════════════════════════════════════
     BOOKING — CancellationReason (surfaces Bookings page)
  ════════════════════════════════════════════════════════════════ */
  {
    value: "client_cancelled",
    label: "Client Cancelled",
    aliases: ["client cancelled", "client cancelled", "client aborted"],
    appliesTo: ["cancellation_reason"],
  },
  {
    value: "agency_cancelled",
    label: "Agency Cancelled",
    aliases: ["agency cancelled", "operator cancelled"],
    appliesTo: ["cancellation_reason"],
  },
  {
    value: "no_show",
    label: "No Show",
    aliases: ["no show", "noshow", "no-show", "did not show", "didn't show"],
    appliesTo: ["cancellation_reason"],
  },
  {
    value: "expired_unpaid",
    label: "Expired Unpaid",
    aliases: ["expired unpaid", "lapsed unpaid", "quotation expired"],
    appliesTo: ["cancellation_reason"],
  },

  /* ════════════════════════════════════════════════════════════════
     INVOICE — InvoiceStatus
  ════════════════════════════════════════════════════════════════ */
  {
    value: "draft",
    label: "Draft",
    aliases: ["draft", "drafts", "unsent"],
    appliesTo: ["invoice", "contract", "investor_lease", "investor_contract"],
  },
  {
    value: "paid",
    label: "Paid",
    aliases: ["paid", "settled", "cleared", "received"],
    appliesTo: ["invoice", "investor_earning"],
  },
  {
    value: "overdue",
    label: "Overdue",
    aliases: ["overdue", "past due", "late", "in arrears"],
    appliesTo: ["invoice"],
  },
  {
    value: "void",
    label: "Void",
    aliases: ["void", "voided", "cancelled invoice"],
    appliesTo: ["invoice", "contract", "payment"],
  },
  {
    value: "partially_paid",
    label: "Partially Paid",
    aliases: ["partially paid", "partial payment", "partial"],
    appliesTo: ["invoice"],
  },

  /* ════════════════════════════════════════════════════════════════
     CONTRACT — ContractStatus
  ════════════════════════════════════════════════════════════════ */
  {
    value: "signed",
    label: "Signed",
    aliases: ["signed", "executed", "countersigned"],
    appliesTo: ["contract"],
  },

  /* ════════════════════════════════════════════════════════════════
     PAYMENT — PaymentStatus
  ════════════════════════════════════════════════════════════════ */
  {
    value: "failed",
    label: "Failed",
    aliases: ["failed", "declined", "error"],
    appliesTo: ["payment"],
  },

  /* ════════════════════════════════════════════════════════════════
     TASK — TaskStatus (6 states)
  ════════════════════════════════════════════════════════════════ */
  {
    value: "unassigned",
    label: "Unassigned",
    aliases: ["unassigned", "no owner", "needs owner"],
    appliesTo: ["task"],
  },
  {
    value: "in_progress",
    label: "In Progress",
    aliases: ["in progress", "started", "ongoing", "running"],
    appliesTo: ["task"],
  },
  {
    value: "in_review",
    label: "In Review",
    aliases: ["in review", "under review", "reviewing"],
    appliesTo: ["task"],
  },
  {
    value: "blocked",
    label: "Blocked",
    aliases: ["blocked", "stuck", "waiting"],
    appliesTo: ["task"],
  },

  /* ════════════════════════════════════════════════════════════════
     USER / INVESTOR
  ════════════════════════════════════════════════════════════════ */
  {
    value: "invited",
    label: "Invited",
    aliases: ["invited", "invite sent", "pending invite"],
    appliesTo: ["user", "investor"],
  },

  /* ════════════════════════════════════════════════════════════════
     INVESTOR LEASE — LeaseStatus
  ════════════════════════════════════════════════════════════════ */
  {
    value: "pending_signature",
    label: "Pending Signature",
    aliases: ["pending signature", "awaiting signature", "unsigned"],
    appliesTo: ["investor_lease", "investor_contract"],
  },
  {
    value: "terminated",
    label: "Terminated",
    aliases: ["terminated", "ended", "cancelled lease"],
    appliesTo: ["investor_lease", "investor_contract"],
  },

  /* ════════════════════════════════════════════════════════════════
     INVESTOR EARNING — EarningStatus
  ════════════════════════════════════════════════════════════════ */
  {
    value: "cleared",
    label: "Cleared",
    aliases: ["cleared", "reconciled", "ready for payout"],
    appliesTo: ["investor_earning"],
  },

  /* ════════════════════════════════════════════════════════════════
     TENANT — EffectiveStatus + SubscriptionStatus
  ════════════════════════════════════════════════════════════════ */
  {
    value: "vaulted",
    label: "Vaulted",
    aliases: ["vaulted", "archived tenant", "archived agency"],
    appliesTo: ["tenant"],
  },
  {
    value: "attention",
    label: "Attention",
    aliases: ["attention", "needs attention", "at risk"],
    appliesTo: ["tenant"],
  },
  {
    value: "trial",
    label: "Trial",
    aliases: ["trial", "trialing", "on trial"],
    appliesTo: ["tenant", "subscription"],
  },
  {
    value: "starter_trial",
    label: "Starter Trial",
    aliases: ["starter trial", "starter", "starter plan"],
    appliesTo: ["subscription"],
  },
  {
    value: "pending_verification",
    label: "Pending Verification",
    aliases: ["pending verification", "unverified tenant"],
    appliesTo: ["subscription"],
  },
  {
    value: "past_due",
    label: "Past Due",
    aliases: ["past due", "overdue subscription", "payment failed"],
    appliesTo: ["subscription"],
  },
];

/* ──────────────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────────────── */

/** Map an alias back to its canonical status value. */
export function statusFromAlias(text: string): string | null {
  const q = text.toLowerCase().trim();
  if (!q) return null;
  for (const def of STATUS_REGISTRY) {
    if (def.value.toLowerCase() === q) return def.value;
    if (def.aliases.some((a) => a.toLowerCase() === q)) return def.value;
  }
  return null;
}

/**
 * Detect statuses referenced by a search text.
 * Uses word-boundary matching so `"active"` doesn't accidentally match
 * `"inactive"` via a substring collision.
 */
export function statusesInText(text: string): Set<string> {
  const q = text.toLowerCase().trim();
  if (!q) return new Set();

  const hits = new Set<string>();
  const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const def of STATUS_REGISTRY) {
    // Direct canonical match
    if (def.value.toLowerCase() === q) {
      hits.add(def.value);
      continue;
    }

    // Alias match — whole word or phrase, both directions
    for (const alias of def.aliases) {
      const a = alias.toLowerCase();
      if (!a) continue;
      const boundaryRegex = new RegExp(`\\b${escaped(a)}\\b`, "i");
      if (boundaryRegex.test(q) || a === q) {
        hits.add(def.value);
        break;
      }
    }
  }

  return hits;
}

/** Filter statuses that apply to a specific entity type. */
export function statusesForEntity(entity: StatusEntity): StatusDefinition[] {
  return STATUS_REGISTRY.filter((s) => s.appliesTo.includes(entity));
}

/**
 * Check if a query is *only* a status word — useful for "pending" → show
 * Bookings/Clients/Drivers/Tasks pages ranked by relevance.
 */
export function isPureStatusQuery(text: string): boolean {
  const q = text.toLowerCase().trim();
  if (!q) return false;
  return STATUS_REGISTRY.some(
    (d) =>
      d.value.toLowerCase() === q ||
      d.aliases.some((a) => a.toLowerCase() === q),
  );
}

// src/lib/search/query-parser.ts
"use client";

import {
  STATUS_REGISTRY,
  statusesForEntity,
  type StatusEntity,
} from "@/lib/search/status-registry";

/* ──────────────────────────────────────────────────────────────────────
   Public types
────────────────────────────────────────────────────────────────────── */

/**
 * A resolved scope target. `entity` is what we filter rows by (if we
 * have data for it); `pageId` is the target page when the user submits.
 */
export interface ResolvedScope {
  /** The user-typed word that triggered this scope (post-strip). */
  raw: string;
  /**
   * Which entity's rows to filter, if we have data for it.
   * `null` means we don't fetch this entity — fall back to page-only.
   */
  entity: "client" | "booking" | "vehicle" | null;
  /** The page registry id this scope maps to. */
  pageId: string | null;
  /** Page registry section — used to restrict other page results. */
  section: string | null;
}

export interface ParsedQuery {
  /** Free text tokens left after status/scope extraction. */
  text: string;
  /** Statuses detected anywhere in the query. */
  statuses: Set<string>;
  /** Scope resolved from `:`, `+`, `-`, or space syntax. */
  scope: ResolvedScope | null;
  /** True if the query is only a filter (`pending`, `clients:pending`). */
  isPureFilter: boolean;
}

/* ──────────────────────────────────────────────────────────────────────
   Scope vocabulary
────────────────────────────────────────────────────────────────────── */

/**
 * Map of user-typed scope word → resolved scope metadata.
 * Add new entries here to expand the query language.
 */
const SCOPE_MAP: Record<string, Omit<ResolvedScope, "raw">> = {
  /* ── Top-level entities (we have data) ──────────────────────── */
  client:      { entity: "client",  pageId: "clients",  section: "clients" },
  clients:     { entity: "client",  pageId: "clients",  section: "clients" },
  customer:    { entity: "client",  pageId: "clients",  section: "clients" },
  customers:   { entity: "client",  pageId: "clients",  section: "clients" },
  crm:         { entity: "client",  pageId: "clients",  section: "clients" },

  booking:     { entity: "booking", pageId: "bookings", section: "bookings" },
  bookings:    { entity: "booking", pageId: "bookings", section: "bookings" },
  reservation: { entity: "booking", pageId: "bookings", section: "bookings" },
  reservations:{ entity: "booking", pageId: "bookings", section: "bookings" },
  trip:        { entity: "booking", pageId: "bookings", section: "bookings" },
  trips:       { entity: "booking", pageId: "bookings", section: "bookings" },

  vehicle:     { entity: "vehicle", pageId: "fleet",    section: "fleet" },
  vehicles:    { entity: "vehicle", pageId: "fleet",    section: "fleet" },
  fleet:       { entity: "vehicle", pageId: "fleet",    section: "fleet" },
  car:         { entity: "vehicle", pageId: "fleet",    section: "fleet" },
  cars:        { entity: "vehicle", pageId: "fleet",    section: "fleet" },

  /* ── Sub-tab scopes (page-only — no data rows fetched) ──────── */
  driver:      { entity: null, pageId: "drivers",           section: "drivers" },
  drivers:     { entity: null, pageId: "drivers",           section: "drivers" },
  contract:    { entity: null, pageId: "drivers-contract",  section: "drivers" },
  contracts:   { entity: null, pageId: "drivers-contract",  section: "drivers" },

  investor:    { entity: null, pageId: "investors", section: "investors" },
  investors:   { entity: null, pageId: "investors", section: "investors" },

  invoice:     { entity: null, pageId: "financials-invoices", section: "financials" },
  invoices:    { entity: null, pageId: "financials-invoices", section: "financials" },
  payment:     { entity: null, pageId: "financials-payments", section: "financials" },
  payments:    { entity: null, pageId: "financials-payments", section: "financials" },
  finance:     { entity: null, pageId: "financials",          section: "financials" },
  financials:  { entity: null, pageId: "financials",          section: "financials" },
  money:       { entity: null, pageId: "financials",          section: "financials" },

  user:        { entity: null, pageId: "users",           section: "users" },
  users:       { entity: null, pageId: "users",           section: "users" },
  team:        { entity: null, pageId: "users",           section: "users" },
  staff:       { entity: null, pageId: "users",           section: "users" },
  scheduler:   { entity: null, pageId: "users-scheduler", section: "users" },
  roles:       { entity: null, pageId: "users-roles",     section: "users" },

  task:        { entity: null, pageId: "tasks", section: "tasks" },
  tasks:       { entity: null, pageId: "tasks", section: "tasks" },
  todo:        { entity: null, pageId: "tasks", section: "tasks" },

  setting:     { entity: null, pageId: "settings",            section: "settings" },
  settings:    { entity: null, pageId: "settings",            section: "settings" },
  billing:     { entity: null, pageId: "settings-billing",    section: "settings" },
  integrations:{ entity: null, pageId: "settings-integrations", section: "settings" },
  audit:       { entity: null, pageId: "settings-audit",      section: "settings" },

  report:      { entity: null, pageId: "reports", section: "reports" },
  reports:     { entity: null, pageId: "reports", section: "reports" },
  analytics:   { entity: null, pageId: "reports", section: "reports" },

  garage:      { entity: null, pageId: "fleet-garage",      section: "fleet" },
  maintenance: { entity: null, pageId: "fleet-garage",      section: "fleet" },
  performance: { entity: null, pageId: "fleet-performance", section: "fleet" },

  invite:      { entity: null, pageId: "clients-invites", section: "clients" },
  invites:     { entity: null, pageId: "clients-invites", section: "clients" },

  support:     { entity: null, pageId: "super-admin-support", section: "support" },
  platform:    { entity: null, pageId: "super-admin",         section: "platform" },
};

/* ──────────────────────────────────────────────────────────────────────
   Status + scope lookups
────────────────────────────────────────────────────────────────────── */

function resolveStatus(word: string): string | null {
  const w = restoreHyphenProtection(word).toLowerCase().trim();
  if (!w) return null;
  for (const def of STATUS_REGISTRY) {
    if (def.value.toLowerCase() === w) return def.value;
    if (def.aliases.some((a) => a.toLowerCase() === w)) return def.value;
  }
  return null;
}

function resolveScope(word: string): Omit<ResolvedScope, "raw"> | null {
  const w = restoreHyphenProtection(word).toLowerCase().trim();
  if (!w) return null;
  return SCOPE_MAP[w] ?? null;
}

/* ──────────────────────────────────────────────────────────────────────
   Hyphen alias protection
   Aliases like "no-show" and "past-due" must survive hyphen splitting
   intact. We swap the hyphen for a zero-width space (\u200B) before
   splitting, and restore it when resolving a word.
────────────────────────────────────────────────────────────────────── */

const HYPHEN_STATUS_ALIASES: string[] = STATUS_REGISTRY
  .flatMap((d) => d.aliases)
  .filter((a) => a.includes("-"))
  .sort((a, b) => b.length - a.length);

const HYPHEN_SCOPE_WORDS: string[] = Object.keys(SCOPE_MAP).filter((k) =>
  k.includes("-"),
);

const ALL_HYPHEN_WORDS = [...HYPHEN_STATUS_ALIASES, ...HYPHEN_SCOPE_WORDS].sort(
  (a, b) => b.length - a.length,
);

const ZWSP = "\u200B";

function protectHyphenWords(input: string): string {
  if (!input.includes("-")) return input;
  let out = input;
  for (const word of ALL_HYPHEN_WORDS) {
    const escaped = word.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "gi");
    out = out.replace(re, word.split("-").join(ZWSP));
  }
  return out;
}

function restoreHyphenProtection(word: string): string {
  return word.split(ZWSP).join("-");
}

/* ──────────────────────────────────────────────────────────────────────
   Hash marker support ("fleet#" = explicitly scope to fleet)
────────────────────────────────────────────────────────────────────── */

function stripHash(part: string): { value: string; explicit: boolean } {
  if (part.endsWith("#")) {
    return { value: part.slice(0, -1), explicit: true };
  }
  return { value: part, explicit: false };
}

/* ──────────────────────────────────────────────────────────────────────
   Parser
────────────────────────────────────────────────────────────────────── */

/**
 * Precedence:
 *   1. Exact whole-string status alias (e.g. "no-show" → no_show).
 *   2. Exact whole-string scope word (e.g. "fleet" → scope fleet).
 *   3. Colon split: "status:scope" or "scope:status" (either order).
 *   4. Plus split: "a+b+c" — any mix of status/scope/free-text.
 *   5. Hyphen split: "a-b-c" — any mix, with alias-protection.
 *   6. Space split: two-token form "a b" — only if BOTH recognized.
 *   7. Fallback: free text + status detection anywhere.
 */
export function parseQuery(rawQuery: string): ParsedQuery {
  const raw = rawQuery.trim();
  const empty: ParsedQuery = {
    text: "",
    statuses: new Set(),
    scope: null,
    isPureFilter: false,
  };
  if (!raw) return empty;

  /* 1. Whole-string status alias */
  {
    const s = resolveStatus(raw);
    if (s) {
      return {
        text: "",
        statuses: new Set([s]),
        scope: null,
        isPureFilter: true,
      };
    }
  }

  /* 2. Whole-string scope word */
  {
    const sc = resolveScope(raw);
    if (sc) {
      return {
        text: "",
        statuses: new Set(),
        scope: { raw, ...sc },
        isPureFilter: true,
      };
    }
  }

  /* Protect hyphenated aliases before any splitting. */
  const protectedRaw = protectHyphenWords(raw);

  /* 3. Colon */
  if (protectedRaw.includes(":")) {
    const colonParts = protectedRaw.split(":");
    const rawA = colonParts[0]?.trim() ?? "";
    const rawB = colonParts[1]?.trim() ?? "";
    const rest = colonParts.slice(2).join(" ").trim();

    const aHash = stripHash(rawA);
    const bHash = stripHash(rawB);

    const aStatus = resolveStatus(aHash.value);
    const bStatus = resolveStatus(bHash.value);
    const aScope = resolveScope(aHash.value);
    const bScope = resolveScope(bHash.value);

    // Both sides are statuses — treat as OR
    if (aStatus && bStatus && !aScope && !bScope) {
      return {
        text: rest,
        statuses: new Set([aStatus, bStatus]),
        scope: null,
        isPureFilter: rest.length === 0,
      };
    }

    // status:scope OR scope:status
    if (aStatus && bScope) {
      return {
        text: rest,
        statuses: new Set([aStatus]),
        scope: { raw: restoreHyphenProtection(bHash.value), ...bScope },
        isPureFilter: rest.length === 0,
      };
    }
    if (aScope && bStatus) {
      return {
        text: rest,
        statuses: new Set([bStatus]),
        scope: { raw: restoreHyphenProtection(aHash.value), ...aScope },
        isPureFilter: rest.length === 0,
      };
    }

    // scope:free-text  →  "fleet:john"
    if (aScope && !bStatus && !bScope && rawB.length > 0) {
      return {
        text: restoreHyphenProtection(rawB),
        statuses: new Set(),
        scope: { raw: restoreHyphenProtection(aHash.value), ...aScope },
        isPureFilter: false,
      };
    }

    // status:free-text  →  "pending:boaz"
    if (aStatus && !bStatus && !bScope && rawB.length > 0) {
      return {
        text: restoreHyphenProtection(rawB),
        statuses: new Set([aStatus]),
        scope: null,
        isPureFilter: false,
      };
    }

    // free-text:scope  →  "john:fleet"
    if (!aStatus && bScope) {
      return {
        text: restoreHyphenProtection(rawA),
        statuses: new Set(),
        scope: { raw: restoreHyphenProtection(bHash.value), ...bScope },
        isPureFilter: false,
      };
    }

    // Unrecognized colon usage — fall through to hyphen/space/fallback.
  }

  /* 4. Plus split — any mix of status/scope/free-text */
  if (protectedRaw.includes("+")) {
    const parts = protectedRaw
      .split("+")
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      const statuses = new Set<string>();
      let scope: ResolvedScope | null = null;
      const textParts: string[] = [];

      for (const rawPart of parts) {
        const { value: part } = stripHash(rawPart);
        if (!part) continue;

        const s = resolveStatus(part);
        if (s) {
          statuses.add(s);
          continue;
        }
        const sc = resolveScope(part);
        if (sc && !scope) {
          scope = { raw: restoreHyphenProtection(part), ...sc };
          continue;
        }
        textParts.push(restoreHyphenProtection(part));
      }

      if (statuses.size > 0 || scope || textParts.length > 0) {
        return {
          text: textParts.join(" ").trim(),
          statuses,
          scope,
          isPureFilter: textParts.length === 0,
        };
      }
    }
  }

  /* 5. Hyphen split — flexible, first-scope-wins */
  if (protectedRaw.includes("-")) {
    const parts = protectedRaw
      .split("-")
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      const statuses = new Set<string>();
      let scope: ResolvedScope | null = null;
      const textParts: string[] = [];

      for (const rawPart of parts) {
        const { value: part, explicit } = stripHash(rawPart);
        if (!part) continue;

        const s = resolveStatus(part);
        if (s) {
          statuses.add(s);
          continue;
        }
        const sc = resolveScope(part);
        if (sc) {
          if (!scope || explicit) {
            scope = { raw: restoreHyphenProtection(part), ...sc };
          }
          continue;
        }
        textParts.push(restoreHyphenProtection(part));
      }

      if (statuses.size > 0 || scope || textParts.length > 0) {
        return {
          text: textParts.join(" ").trim(),
          statuses,
          scope,
          isPureFilter: textParts.length === 0,
        };
      }
    }
  }

  /* 6. Space split — two-token form only, both must be recognized */
  {
    const words = protectedRaw.split(/\s+/).filter(Boolean);
    if (words.length === 2) {
      const aHash = stripHash(words[0]);
      const bHash = stripHash(words[1]);

      const aStatus = resolveStatus(aHash.value);
      const bStatus = resolveStatus(bHash.value);
      const aScope = resolveScope(aHash.value);
      const bScope = resolveScope(bHash.value);

      if (aStatus && bScope) {
        return {
          text: "",
          statuses: new Set([aStatus]),
          scope: { raw: restoreHyphenProtection(bHash.value), ...bScope },
          isPureFilter: true,
        };
      }
      if (aScope && bStatus) {
        return {
          text: "",
          statuses: new Set([bStatus]),
          scope: { raw: restoreHyphenProtection(aHash.value), ...aScope },
          isPureFilter: true,
        };
      }
    }
  }

  /* 7. Fallback — free text + status detection anywhere */
  const words = raw.split(/\s+/).filter(Boolean);
  const detected = new Set<string>();
  const textTokens: string[] = [];

  for (const word of words) {
    const s = resolveStatus(word);
    if (s) {
      detected.add(s);
      continue;
    }
    textTokens.push(word);
  }

  return {
    text: textTokens.join(" ").trim(),
    statuses: detected,
    scope: null,
    isPureFilter: false,
  };
}

/* ──────────────────────────────────────────────────────────────────────
   Convenience helpers
────────────────────────────────────────────────────────────────────── */

/** Returns the statuses for a specific entity given a parsed query. */
export function statusesForEntityInQuery(
  parsed: ParsedQuery,
  entity: StatusEntity,
): Set<string> {
  const out = new Set<string>();
  for (const s of parsed.statuses) {
    if (statusesForEntity(entity).some((d) => d.value === s)) out.add(s);
  }
  return out;
}

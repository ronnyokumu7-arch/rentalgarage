// src/components/contracts/public/PublicContractCompanyHeader.tsx
"use client";

import { FileText, MapPin, Phone, Envelope as Mail } from "@phosphor-icons/react/ssr";
import { brand } from "@/lib/brand";
import type { TenantProfile } from "@/lib/types";

interface Props {
  tenant: TenantProfile;
  // ✅ Document meta (right column). Was `bookingNumber` (never rendered).
  contractNumber: string;
}

// The agreement's human-readable title — now the right-column headline.
const DOC_TITLE = "Vehicle Rental Agreement";

export default function PublicContractCompanyHeader({ tenant, contractNumber }: Props) {
  const hasContact = !!(tenant.business_location || tenant.phone || tenant.email);

  return (
    // ✅ Letterhead lives INSIDE the document card: padding + bottom rule,
    //    company identity left, document meta right.
    <div
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 px-4 sm:px-6 py-5 sm:py-6 border-b"
      style={{ borderColor: brand.colors.light.surfaceBorder }}
    >
      {/* ── Left: company identity ONLY (logo + name + contacts) ── */}
      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
        {tenant.logo_url ? (
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0"
            style={{
              background: brand.colors.light.surface,
              border: `1px solid ${brand.colors.light.surfaceBorder}`,
              boxShadow: brand.colors.shadows.sm,
            }}
          >
            <img
              src={tenant.logo_url}
              alt={`${tenant.company_name} Logo`}
              className="w-full h-full object-contain p-2"
            />
          </div>
        ) : (
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: brand.colors.primaryMuted,
              border: `1px solid ${brand.colors.primaryMuted}`,
            }}
          >
            <FileText size={26} style={{ color: brand.colors.primary }} aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0">
          <h1
            className="text-lg sm:text-xl font-bold tracking-tight leading-tight"
            style={{ color: brand.colors.ink.primary }}
          >
            {tenant.company_name}
          </h1>

          {hasContact && (
            <div className="mt-2 space-y-1 text-xs">
              {tenant.business_location && (
                <p className="flex items-center gap-1.5" style={{ color: brand.colors.ink.muted }}>
                  <MapPin size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{tenant.business_location}</span>
                </p>
              )}
              {tenant.phone && (
                <p className="flex items-center gap-1.5" style={{ color: brand.colors.ink.muted }}>
                  <Phone size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" aria-hidden="true" />
                  {tenant.phone}
                </p>
              )}
              {tenant.email && (
                <p className="flex items-center gap-1.5 min-w-0" style={{ color: brand.colors.ink.muted }}>
                  <Mail size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{tenant.email}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: document meta (title headline + number) ── */}
      <div className="text-left sm:text-right shrink-0">
        <p
          className="text-lg sm:text-xl font-bold tracking-tight leading-tight"
          style={{ color: brand.colors.ink.primary }}
        >
          {DOC_TITLE}
        </p>

        {contractNumber && (
          <p className="mt-1 text-xs font-mono" style={{ color: brand.colors.ink.muted }}>
            {contractNumber}
          </p>
        )}
      </div>
    </div>
  );
}

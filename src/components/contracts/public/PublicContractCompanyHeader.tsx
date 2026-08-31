// src/components/contracts/public/PublicContractCompanyHeader.tsx
"use client";

import { FileText, MapPin, Phone, Mail } from "lucide-react";
import { brand } from "@/lib/brand";
import type { TenantProfile } from "@/lib/types";

interface Props {
  tenant: TenantProfile;
  // Kept so the parent page compiles without changes (no longer rendered)
  bookingNumber: string;
}

export default function PublicContractCompanyHeader({ tenant }: Props) {
  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-start gap-3 sm:gap-4">
        
        {/* Company Logo */}
        {tenant.logo_url ? (
          <div 
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0"
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
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: brand.colors.primaryMuted,
              border: `1px solid ${brand.colors.primaryMuted}`,
            }}
          >
            <FileText size={28} style={{ color: brand.colors.primary }} />
          </div>
        )}

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <h1 
            className="text-lg sm:text-2xl font-bold tracking-tight"
            style={{ color: brand.colors.ink.primary }}
          >
            {tenant.company_name}
          </h1>
          <p 
            className="text-xs sm:text-sm mt-1"
            style={{ color: brand.colors.ink.muted }}
          >
            Vehicle Rental Agreement
          </p>
          
          {/* Contact Info - Same structure as invoice header */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {tenant.business_location && (
              <span 
                className="flex items-center gap-1.5"
                style={{ color: brand.colors.ink.muted }}
              >
                <MapPin size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" />
                {tenant.business_location}
              </span>
            )}
            {tenant.phone && (
              <span 
                className="flex items-center gap-1.5"
                style={{ color: brand.colors.ink.muted }}
              >
                <Phone size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" />
                {tenant.phone}
              </span>
            )}
            {tenant.email && (
              <span 
                className="flex items-center gap-1.5 min-w-0"
                style={{ color: brand.colors.ink.muted }}
              >
                <Mail size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" />
                <span className="truncate">{tenant.email}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

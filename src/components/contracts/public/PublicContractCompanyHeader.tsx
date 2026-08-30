// src/components/contracts/public/PublicContractCompanyHeader.tsx
"use client";

import { FileText, MapPin, Phone, Mail } from "lucide-react";
import type { TenantProfile } from "@/lib/types";

interface Props {
  tenant: TenantProfile;
  // Kept so the parent page compiles without changes (no longer rendered)
  bookingNumber: string;
}

export default function PublicContractCompanyHeader({ tenant }: Props) {
  return (
    <div className="mb-8 sm:mb-12">
      {/* ✅ Badge removed — company info gets full width on all screens */}
      <div className="flex items-start gap-3 sm:gap-4">
        
        {/* Company Logo */}
        {tenant.logo_url ? (
          <div 
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(28, 25, 23, 0.10)',
              boxShadow: '0 1px 3px rgba(28, 25, 23, 0.08)',
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
              background: 'rgba(109, 40, 217, 0.05)',
              border: '1px solid rgba(109, 40, 217, 0.15)',
            }}
          >
            <FileText size={28} style={{ color: '#6D28D9' }} />
          </div>
        )}

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <h1 
            className="text-lg sm:text-2xl font-bold tracking-tight"
            style={{ color: '#1C1917' }}
          >
            {tenant.company_name}
          </h1>
          <p 
            className="text-xs sm:text-sm mt-1"
            style={{ color: '#57534E' }}
          >
            Vehicle Rental Agreement
          </p>
          
          {/* Premium lucide icons */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {tenant.business_location && (
              <span 
                className="flex items-center gap-1.5"
                style={{ color: '#57534E' }}
              >
                <MapPin size={12} style={{ color: '#78716C' }} className="shrink-0" />
                {tenant.business_location}
              </span>
            )}
            {tenant.phone && (
              <span 
                className="flex items-center gap-1.5"
                style={{ color: '#57534E' }}
              >
                <Phone size={12} style={{ color: '#78716C' }} className="shrink-0" />
                {tenant.phone}
              </span>
            )}
            {tenant.email && (
              <span 
                className="flex items-center gap-1.5 min-w-0"
                style={{ color: '#57534E' }}
              >
                <Mail size={12} style={{ color: '#78716C' }} className="shrink-0" />
                <span className="truncate">{tenant.email}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

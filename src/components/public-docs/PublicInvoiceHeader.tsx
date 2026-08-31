// src/components/public-docs/PublicInvoiceHeader.tsx
"use client";

import { FileText, MapPin, Phone, Mail } from "lucide-react";
import { brand } from "@/lib/brand";


interface InvoiceLike {
  doc_type?: string;
  invoice_number?: string;
  tenant_name?: string | null;
  tenant_logo_url?: string | null;
  tenant_address?: string | null;
  tenant_phone?: string | null;
  tenant_email?: string | null;
  [key: string]: any;
}

interface Props {
  invoice: InvoiceLike;
}

export default function PublicInvoiceHeader({ invoice }: Props) {
  const isQuotation = invoice.doc_type === "quotation";
  const docLabel = isQuotation ? "Quotation" : "Invoice";

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-start gap-3 sm:gap-4">
        
        {/* Company Logo — same box as contract header */}
        {invoice.tenant_logo_url ? (
          <div 
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0"
            style={{
              background: brand.colors.light.surface,
              border: `1px solid ${brand.colors.light.surfaceBorder}`,
              boxShadow: brand.colors.shadows.sm,
            }}
          >
            <img 
              src={invoice.tenant_logo_url} 
              alt={`${invoice.tenant_name || "Company"} Logo`}
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

        {/* Company Info — left-aligned, mirrors contract header */}
        <div className="flex-1 min-w-0">
          <h1 
            className="text-lg sm:text-2xl font-bold tracking-tight"
            style={{ color: brand.colors.ink.primary }}
          >
            {invoice.tenant_name || "Rental Company"}
          </h1>
          <p 
            className="text-xs sm:text-sm mt-1"
            style={{ color: brand.colors.ink.muted }}
          >
            {docLabel}
          </p>
          
          {/* Contact Info — same row structure as contract header */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {invoice.tenant_address && (
              <span 
                className="flex items-center gap-1.5"
                style={{ color: brand.colors.ink.muted }}
              >
                <MapPin size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" />
                {invoice.tenant_address}
              </span>
            )}
            {invoice.tenant_phone && (
              <span 
                className="flex items-center gap-1.5"
                style={{ color: brand.colors.ink.muted }}
              >
                <Phone size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" />
                {invoice.tenant_phone}
              </span>
            )}
            {invoice.tenant_email && (
              <span 
                className="flex items-center gap-1.5 min-w-0"
                style={{ color: brand.colors.ink.muted }}
              >
                <Mail size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" />
                <span className="truncate">{invoice.tenant_email}</span>
              </span>
            )}
          </div>

          {/* ✅ Document number badge — kept, now left-aligned */}
          <div 
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: brand.colors.primaryMuted,
              color: brand.colors.primary,
              border: `1px solid ${brand.colors.primaryMuted}`,
            }}
          >
            <FileText size={12} />
            {invoice.invoice_number}
          </div>
        </div>
      </div>
    </div>
  );
}

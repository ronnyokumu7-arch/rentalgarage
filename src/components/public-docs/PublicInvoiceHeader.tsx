// src/components/public-docs/PublicInvoiceHeader.tsx
"use client";

import { Receipt, Phone, Mail } from "lucide-react";
import type { PublicInvoiceView } from "@/lib/types";

interface PublicInvoiceHeaderProps {
  invoice: PublicInvoiceView;
}

export default function PublicInvoiceHeader({ invoice }: PublicInvoiceHeaderProps) {
  const companyNameStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1C1917',
    letterSpacing: '-0.02em',
  };

  const contactLinkStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: '#57534E',
    transition: 'color 0.2s ease',
  };

  const invoiceBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    background: '#FAF9F7',
    border: '1px solid rgba(28, 25, 23, 0.06)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#57534E',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <div className="text-center mb-6 sm:mb-10">
      {invoice.tenant_logo_url ? (
        <img 
          src={invoice.tenant_logo_url} 
          alt="Logo" 
          className="h-16 mx-auto mb-4 object-contain" 
        />
      ) : (
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            background: '#F5F3F0',
            color: '#57534E',
          }}
        >
          <Receipt size={24} />
        </div>
      )}
      <h1 
        className="text-2xl sm:text-3xl font-bold tracking-tight"
        style={companyNameStyle}
      >
        {invoice.tenant_name}
      </h1>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {invoice.tenant_phone && (
          <a 
            href={`tel:${invoice.tenant_phone}`} 
            className="flex items-center gap-1"
            style={contactLinkStyle}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1C1917'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#57534E'}
          >
            <Phone size={12} /> {invoice.tenant_phone}
          </a>
        )}
        {invoice.tenant_email && (
          <a 
            href={`mailto:${invoice.tenant_email}`} 
            className="flex items-center gap-1"
            style={contactLinkStyle}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1C1917'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#57534E'}
          >
            <Mail size={12} /> {invoice.tenant_email}
          </a>
        )}
      </div>

      <div 
        className="mt-4 inline-flex items-center gap-2"
        style={invoiceBadgeStyle}
      >
        <Receipt size={14} />
        {invoice.invoice_number}
      </div>
    </div>
  );
}

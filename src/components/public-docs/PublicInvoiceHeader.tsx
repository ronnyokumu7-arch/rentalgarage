// src/components/public-docs/PublicInvoiceHeader.tsx
"use client";

import { FileText, MapPin, Phone, Envelope as Mail } from "@phosphor-icons/react/ssr";
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

  const hasContact = !!(invoice.tenant_address || invoice.tenant_phone || invoice.tenant_email);

  return (
    // ✅ Letterhead lives INSIDE the document card: padding + bottom rule,
    //    company identity left, document meta right.
    <div
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 px-4 sm:px-6 py-5 sm:py-6 border-b"
      style={{ borderColor: brand.colors.light.surfaceBorder }}
    >
      {/* ── Left: company identity (logo + name + contacts as ONE block) ── */}
      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
        {invoice.tenant_logo_url ? (
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0"
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
            {invoice.tenant_name || "Rental Company"}
          </h1>

          {/* ✅ Contact details are part of the company block (letterhead style) */}
          {hasContact && (
            <div className="mt-2 space-y-1 text-xs">
              {invoice.tenant_address && (
                <p className="flex items-center gap-1.5" style={{ color: brand.colors.ink.muted }}>
                  <MapPin size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{invoice.tenant_address}</span>
                </p>
              )}
              {invoice.tenant_phone && (
                <p className="flex items-center gap-1.5" style={{ color: brand.colors.ink.muted }}>
                  <Phone size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" aria-hidden="true" />
                  {invoice.tenant_phone}
                </p>
              )}
              {invoice.tenant_email && (
                <p className="flex items-center gap-1.5 min-w-0" style={{ color: brand.colors.ink.muted }}>
                  <Mail size={12} style={{ color: brand.colors.ink.subtle }} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{invoice.tenant_email}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: document meta (the word INVOICE + number) ── */}
      <div className="text-left sm:text-right shrink-0">
        <p
          className="text-xl sm:text-2xl font-bold uppercase tracking-[0.14em] leading-tight"
          style={{ color: brand.colors.ink.primary }}
        >
          {docLabel}
        </p>
        {invoice.invoice_number && (
          <p
            className="mt-1 text-xs font-mono"
            style={{ color: brand.colors.ink.muted }}
          >
            {invoice.invoice_number}
          </p>
        )}
      </div>
    </div>
  );
}

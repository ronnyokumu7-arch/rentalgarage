"use client";

import { Receipt, Phone, Mail } from "lucide-react";
import type { PublicInvoiceView } from "@/lib/types";

interface PublicInvoiceHeaderProps {
  invoice: PublicInvoiceView;
}

export default function PublicInvoiceHeader({ invoice }: PublicInvoiceHeaderProps) {
  return (
    <div className="text-center mb-6 sm:mb-10">
      {invoice.tenant_logo_url ? (
        <img src={invoice.tenant_logo_url} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
      ) : (
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
          <Receipt size={24} />
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{invoice.tenant_name}</h1>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-500">
        {invoice.tenant_phone && (
          <a href={`tel:${invoice.tenant_phone}`} className="hover:text-slate-700 transition-colors flex items-center gap-1">
            <Phone size={12} /> {invoice.tenant_phone}
          </a>
        )}
        {invoice.tenant_email && (
          <a href={`mailto:${invoice.tenant_email}`} className="hover:text-slate-700 transition-colors flex items-center gap-1">
            <Mail size={12} /> {invoice.tenant_email}
          </a>
        )}
      </div>

      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wide">
        <Receipt size={14} />
        {invoice.invoice_number}
      </div>
    </div>
  );
}

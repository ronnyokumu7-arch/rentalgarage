// src/components/public-docs/PublicInvoiceDetails.tsx
"use client";

import { User, Car, Calendar, Banknote, UserCircle } from "lucide-react";
import type { PublicInvoiceView } from "@/lib/types";

interface PublicInvoiceDetailsProps {
  invoice: PublicInvoiceView;
}

export default function PublicInvoiceDetails({ invoice }: PublicInvoiceDetailsProps) {
  const hasDriver = !!(invoice?.driver_name);

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#78716C',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const iconContainerStyle: React.CSSProperties = {
    padding: '0.5rem',
    background: '#FAF9F7',
    borderRadius: '0.5rem',
    flexShrink: 0,
    border: '1px solid rgba(28, 25, 23, 0.06)',
  };

  const iconStyle: React.CSSProperties = {
    color: '#57534E',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#1C1917',
  };

  const subTextStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#57534E',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
      <div className="space-y-2 sm:space-y-4">
        <h3 style={sectionTitleStyle}>Client Details</h3>
        <div className="flex items-start gap-3">
          <div style={iconContainerStyle}>
            <User size={18} style={iconStyle} />
          </div>
          <div>
            <p style={nameStyle}>{invoice.client_name}</p>
            <p style={subTextStyle}>{invoice.client_phone || "Renter"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        <h3 style={sectionTitleStyle}>Vehicle Details</h3>
        <div className="flex items-start gap-3">
          <div style={iconContainerStyle}>
            <Car size={18} style={iconStyle} />
          </div>
          <div>
            <p style={nameStyle}>
              {invoice.vehicle_name || invoice.vehicle_description || "N/A"}
            </p>
            <p 
              className="text-xs font-mono"
              style={{ color: '#57534E' }}
            >
              {invoice.vehicle_plate || "Rental Vehicle"}
            </p>
          </div>
        </div>
      </div>

      {hasDriver && (
        <div className="space-y-2 sm:space-y-4">
          <h3 style={sectionTitleStyle}>Assigned Driver</h3>
          <div className="flex items-start gap-3">
            <div style={iconContainerStyle}>
              <UserCircle size={18} style={iconStyle} />
            </div>
            <div>
              <p style={nameStyle}>{invoice.driver_name}</p>
              <p style={subTextStyle}>{invoice.driver_phone || "—"}</p>
              {invoice.driver_dl_number && (
                <p 
                  className="text-xs font-mono"
                  style={{ color: '#57534E' }}
                >
                  DL {invoice.driver_dl_number}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 sm:space-y-4">
        <h3 style={sectionTitleStyle}>Invoice Dates</h3>
        <div className="flex items-start gap-3">
          <div style={iconContainerStyle}>
            <Calendar size={18} style={iconStyle} />
          </div>
          <div>
            <p style={nameStyle}>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
            <p style={subTextStyle}>Payment deadline</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        <h3 style={sectionTitleStyle}>Total Amount</h3>
        <div className="flex items-start gap-3">
          <div style={iconContainerStyle}>
            <Banknote size={18} style={iconStyle} />
          </div>
          <div>
            <p style={nameStyle}>{invoice.currency_code} {Number(invoice.amount_due).toLocaleString()}</p>
            <p style={subTextStyle}>Total invoice value</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/public-docs/PublicDocParties.tsx
import React from "react";
import { Building2, User } from "lucide-react";

interface PublicDocPartiesProps {
  issuerName: string;
  recipientName: string;
  recipientDetails?: string[]; // e.g., email, phone
}

export default function PublicDocParties({ issuerName, recipientName, recipientDetails }: PublicDocPartiesProps) {
  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px rgba(28, 25, 23, 0.08)',
    border: '1px solid rgba(28, 25, 23, 0.10)',
    padding: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#57534E',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1C1917',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Issuer */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4" style={{ color: '#78716C' }} />
          <span style={labelStyle}>Issued By</span>
        </div>
        <p style={nameStyle}>{issuerName}</p>
      </div>

      {/* Recipient */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4" style={{ color: '#78716C' }} />
          <span style={labelStyle}>Billed To</span>
        </div>
        <p style={{ ...nameStyle, marginBottom: '0.25rem' }}>{recipientName}</p>
        {recipientDetails?.map((detail, idx) => (
          <p 
            key={idx} 
            className="text-sm"
            style={{ color: '#57534E' }}
          >
            {detail}
          </p>
        ))}
      </div>
    </div>
  );
}

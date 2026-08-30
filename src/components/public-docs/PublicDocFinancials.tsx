// src/components/public-docs/PublicDocFinancials.tsx
import React from "react";

interface FinancialRow {
  label: string;
  value: string;
  isTotal?: boolean;
  isHighlight?: boolean; // e.g., Balance Due
}

interface PublicDocFinancialsProps {
  currency: string;
  rows: FinancialRow[];
}

export default function PublicDocFinancials({ currency:_currency, rows }: PublicDocFinancialsProps) {
  return (
    <div 
      className="rounded-2xl p-6 sm:p-8"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(28, 25, 23, 0.08)',
        border: '1px solid rgba(28, 25, 23, 0.10)',
      }}
    >
      <h3 
        className="text-sm font-bold uppercase tracking-wider mb-6 pb-3"
        style={{
          color: '#1C1917',
          borderBottom: '1px solid rgba(28, 25, 23, 0.06)',
        }}
      >
        Financial Summary
      </h3>
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div 
            key={idx} 
            className={`flex justify-between items-center py-2 ${row.isTotal ? 'pt-4 mt-2' : ''}`}
            style={row.isTotal ? { borderTop: '1px solid rgba(28, 25, 23, 0.10)' } : undefined}
          >
            <span 
              className="text-sm"
              style={{
                color: row.isTotal ? '#1C1917' : '#57534E',
                fontWeight: row.isTotal ? 700 : 400,
              }}
            >
              {row.label}
            </span>
            <span 
              className="text-sm font-semibold"
              style={{
                color: row.isHighlight ? '#6D28D9' : '#1C1917',
                fontSize: row.isHighlight || row.isTotal ? '1rem' : '0.875rem',
                fontWeight: row.isHighlight || row.isTotal ? 700 : 600,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

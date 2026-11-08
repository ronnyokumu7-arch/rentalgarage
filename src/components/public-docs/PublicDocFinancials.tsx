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

export default function PublicDocFinancials({ currency, rows }: PublicDocFinancialsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 border-b border-slate-100 pb-3">
        Financial Summary
      </h3>
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div 
            key={idx} 
            className={`flex justify-between items-center py-2 ${row.isTotal ? 'border-t border-slate-200 pt-4 mt-2' : ''}`}
          >
            <span className={`text-sm ${row.isTotal ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
              {row.label}
            </span>
            <span className={`text-sm font-semibold ${row.isHighlight ? 'text-blue-600 text-base' : row.isTotal ? 'text-slate-900 text-base' : 'text-slate-900'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

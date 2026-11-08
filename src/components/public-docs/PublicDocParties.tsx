// src/components/public-docs/PublicDocParties.tsx
import React from "react";
import { Building2, User } from "lucide-react";

interface PublicDocPartiesProps {
  issuerName: string;
  recipientName: string;
  recipientDetails?: string[]; // e.g., email, phone
}

export default function PublicDocParties({ issuerName, recipientName, recipientDetails }: PublicDocPartiesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Issuer */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Issued By</span>
        </div>
        <p className="text-base font-bold text-slate-900">{issuerName}</p>
      </div>

      {/* Recipient */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billed To</span>
        </div>
        <p className="text-base font-bold text-slate-900 mb-1">{recipientName}</p>
        {recipientDetails?.map((detail, idx) => (
          <p key={idx} className="text-sm text-slate-500">{detail}</p>
        ))}
      </div>
    </div>
  );
}

// src/components/public-docs/PublicDocHeader.tsx
import React from "react";
import { BadgeCheck, FileText, Receipt, FileSignature } from "lucide-react";

type DocType = "quotation" | "invoice" | "contract";
type StatusVariant = "pending" | "accepted" | "paid" | "signed" | "expired" | "void";

interface PublicDocHeaderProps {
  companyName: string;
  documentNumber: string;
  docType: DocType;
  status: StatusVariant;
}

const statusStyles: Record<StatusVariant, React.CSSProperties> = {
  pending: {
    background: 'rgba(180, 83, 9, 0.10)',
    color: '#B45309',
    borderColor: 'rgba(180, 83, 9, 0.20)',
  },
  accepted: {
    background: 'rgba(4, 120, 87, 0.10)',
    color: '#047857',
    borderColor: 'rgba(4, 120, 87, 0.20)',
  },
  paid: {
    background: 'rgba(4, 120, 87, 0.10)',
    color: '#047857',
    borderColor: 'rgba(4, 120, 87, 0.20)',
  },
  signed: {
    background: 'rgba(29, 78, 216, 0.10)',
    color: '#1D4ED8',
    borderColor: 'rgba(29, 78, 216, 0.20)',
  },
  expired: {
    background: 'rgba(185, 28, 28, 0.10)',
    color: '#B91C1C',
    borderColor: 'rgba(185, 28, 28, 0.20)',
  },
  void: {
    background: 'rgba(87, 83, 78, 0.10)',
    color: '#57534E',
    borderColor: 'rgba(87, 83, 78, 0.20)',
  },
};

const docIcons: Record<DocType, React.ReactNode> = {
  quotation: <FileText className="w-5 h-5" style={{ color: '#6D28D9' }} />,
  invoice: <Receipt className="w-5 h-5" style={{ color: '#047857' }} />,
  contract: <FileSignature className="w-5 h-5" style={{ color: '#7C3AED' }} />,
};

const docAccentColors: Record<DocType, string> = {
  quotation: '#6D28D9',
  invoice: '#047857',
  contract: '#7C3AED',
};

export default function PublicDocHeader({ companyName, documentNumber, docType, status }: PublicDocHeaderProps) {
  return (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(28, 25, 23, 0.08)',
        border: '1px solid rgba(28, 25, 23, 0.10)',
      }}
    >
      {/* Top Accent Bar */}
      <div 
        className="h-1.5 w-full"
        style={{ background: docAccentColors[docType] }}
      />
      
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: '#FAF9F7',
              border: '1px solid rgba(28, 25, 23, 0.06)',
            }}
          >
            {docIcons[docType]}
          </div>
          <div>
            <p 
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: '#57534E' }}
            >
              {docType}
            </p>
            <h1 
              className="text-lg font-bold"
              style={{ color: '#1C1917' }}
            >
              {documentNumber}
            </h1>
          </div>
        </div>

        <div 
          className="px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5"
          style={statusStyles[status]}
        >
          <BadgeCheck className="w-3.5 h-3.5" />
          {status ? status.toUpperCase() : 'PENDING'}
        </div>
      </div>

      <div 
        className="px-6 sm:px-8 py-4"
        style={{
          background: 'rgba(250, 249, 247, 0.50)',
          borderTop: '1px solid rgba(28, 25, 23, 0.06)',
        }}
      >
        <p 
          className="text-sm font-semibold"
          style={{ color: '#44403C' }}
        >
          {companyName}
        </p>
      </div>
    </div>
  );
}

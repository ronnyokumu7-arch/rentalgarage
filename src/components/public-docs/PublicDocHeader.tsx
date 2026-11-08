import React from "react";
import { BadgeCheck, FileText, Receipt, FileSignature } from "lucide-react";

type DocType = "quotation" | "invoice" | "contract";
type StatusVariant =
  | "pending"
  | "accepted"
  | "declined"
  | "paid"
  | "sent"
  | "signed"
  | "overdue"
  | "expired"
  | "void"
  | "draft";

interface PublicDocHeaderProps {
  companyName: string;
  documentNumber: string;
  docType: DocType;
  status: StatusVariant;
}

const statusStyles: Record<StatusVariant, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  declined: "bg-red-100 text-red-700 border-red-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  sent: "bg-blue-100 text-blue-700 border-blue-200",
  signed: "bg-blue-100 text-blue-700 border-blue-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  expired: "bg-red-100 text-red-700 border-red-200",
  void: "bg-slate-100 text-slate-500 border-slate-200",
  draft: "bg-slate-100 text-slate-500 border-slate-200",
};

const docIcons: Record<DocType, React.ReactNode> = {
  quotation: <FileText className="w-5 h-5 text-blue-600" />,
  invoice: <Receipt className="w-5 h-5 text-emerald-600" />,
  contract: <FileSignature className="w-5 h-5 text-purple-600" />,
};

export default function PublicDocHeader({
  companyName,
  documentNumber,
  docType,
  status,
}: PublicDocHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div
        className={`h-1.5 w-full ${
          docType === "quotation"
            ? "bg-blue-500"
            : docType === "invoice"
              ? "bg-emerald-500"
              : "bg-purple-500"
        }`}
      />
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
            {docIcons[docType]}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {docType}
            </p>
            <h1 className="text-lg font-bold text-slate-900">{documentNumber}</h1>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusStyles[status]}`}
        >
          <BadgeCheck className="w-3.5 h-3.5" />
          {status.toUpperCase()}
        </div>
      </div>
      <div className="px-6 sm:px-8 py-4 bg-slate-50/50 border-t border-slate-100">
        <p className="text-sm font-semibold text-slate-700">{companyName}</p>
      </div>
    </div>
  );
}

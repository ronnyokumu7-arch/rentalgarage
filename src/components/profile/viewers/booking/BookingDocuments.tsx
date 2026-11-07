"use client";

import type { ComponentType } from "react";
import { FileText, Signature as FileSignature, CheckCircle, Clock, WarningCircle as AlertCircle, Eye, Link, Download } from "@phosphor-icons/react/ssr";
import type { IconProps } from "@phosphor-icons/react";

interface BookingDocumentsProps {
  contractStatus: string;
  invoiceStatus: string;
  onViewContract: () => void;
  onCopyContractLink: () => void;
  onDownloadContract: () => void;
  onViewInvoice: () => void;
  onCopyInvoiceLink: () => void;
  onDownloadInvoice: () => void;
}

interface DocumentTileProps {
  title: string;
  status: string;
  onView: () => void;
  onCopy: () => void;
  onDownload: () => void;
  Icon: ComponentType<IconProps>;
}

// ✅ Simple, safe status config matching existing patterns
const getStatusConfig = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "signed" || s === "generated") {
    return { label: "Ready", color: "text-emerald-500", bg: "bg-emerald-500/5 border-emerald-500/20", icon: CheckCircle };
  }
  if (s === "sent" || s === "pending") {
    return { label: "Pending", color: "text-amber-500", bg: "bg-amber-500/5 border-amber-500/20", icon: Clock };
  }
  return { label: "Not Available", color: "text-[var(--color-ink-subtle)]", bg: "bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]", icon: AlertCircle };
};

function DocumentTile({ title, status, onView, onCopy, onDownload, Icon }: DocumentTileProps) {
  const config = getStatusConfig(status);
  const isReady = status?.toLowerCase() === "signed" || status?.toLowerCase() === "generated";

  return (
    <div className={`relative group rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 transition-all ${isReady ? 'border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 hover:border-[var(--color-primary)]/30' : 'border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/10'}`}>
      <div className="flex items-center sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4 min-w-0">
        <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border shrink-0 ${config.bg}`}>
          <Icon size={18} className={`sm:w-5 sm:h-5 ${config.color}`} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h5 className="text-xs sm:text-sm font-bold text-[var(--color-ink)] truncate">{title}</h5>
          <div className={`inline-flex items-center gap-1 sm:gap-1.5 mt-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border ${config.bg} ${config.color}`}>
            <config.icon size={10} className="shrink-0" aria-hidden="true" />
            <span>{config.label}</span>
          </div>
        </div>
      </div>

      {isReady && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 border-t border-[var(--color-surface-border)]/50">
          <button 
            type="button"
            onClick={onView} 
            className="flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/10 active:scale-95 transition-all"
          >
            <Eye size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">View</span>
          </button>
          <button 
            type="button"
            onClick={onCopy} 
            className="flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-surface-border)] active:scale-95 transition-all"
          >
            <Link size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Copy</span>
          </button>
          <button 
            type="button"
            onClick={onDownload} 
            className="flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-surface-border)] active:scale-95 transition-all"
          >
            <Download size={12} className="sm:w-3.5 sm:h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Save</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookingDocuments({ 
  contractStatus, invoiceStatus,
  onViewContract, onCopyContractLink, onDownloadContract,
  onViewInvoice, onCopyInvoiceLink, onDownloadInvoice
}: BookingDocumentsProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Trip Documents</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <DocumentTile 
          title="Rental Contract" 
          status={contractStatus} 
          Icon={FileSignature}
          onView={onViewContract} 
          onCopy={onCopyContractLink} 
          onDownload={onDownloadContract} 
        />
        <DocumentTile 
          title="Invoice" 
          status={invoiceStatus} 
          Icon={FileText}
          onView={onViewInvoice} 
          onCopy={onCopyInvoiceLink} 
          onDownload={onDownloadInvoice} 
        />
      </div>
    </div>
  );
}

"use client";

import { FileText, CheckCircle as CheckCircle2, WarningCircle as AlertCircle, Eye, Link, Download, Clock } from "@phosphor-icons/react/ssr";

interface DocumentCardProps {
  title: string;
  status: string;
  onView: () => void;
  onCopyLink: () => void;
  onDownload: () => void;
}

// ✅ BRAND TOKENS: Semantic status styling with opacity-based backgrounds
const getStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'generated':
    case 'signed':
      return { 
        label: 'Ready',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        icon: CheckCircle2 
      };
    case 'pending':
    case 'draft':
      return { 
        label: 'Pending',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20',
        icon: Clock 
      };
    default:
      return { 
        label: 'Not Available',
        color: 'text-[var(--color-ink-muted)]',
        bg: 'bg-[var(--color-surface-hover)] border-[var(--color-surface-border)]',
        icon: AlertCircle 
      };
  }
};

export default function DocumentCard({ 
  title, 
  status, 
  onView, 
  onCopyLink, 
  onDownload 
}: DocumentCardProps) {

  const config = getStatusConfig(status);
  const isAvailable = status?.toLowerCase() === 'generated' || status?.toLowerCase() === 'signed';

  return (
    <div 
      className={`group relative rounded-xl sm:rounded-2xl border transition-all duration-200 p-2.5 sm:p-3.5 flex flex-row items-center justify-between gap-3 ${
        isAvailable 
          ? 'border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-surface-border)]/80 hover:shadow-xs cursor-pointer' 
          : 'border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/10'
      }`}
      onClick={isAvailable ? onView : undefined}
    >
      {/* Left: Icon & Info */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shrink-0 transition-colors ${config.bg}`}>
          <FileText size={18} className={`sm:w-5 sm:h-5 ${config.color}`} aria-hidden="true" />
        </div>
        
        <div className="min-w-0 space-y-0.5 sm:space-y-1">
          <h5 className="text-xs sm:text-sm font-bold text-[var(--color-ink)] truncate">
            {title}
          </h5>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border ${config.bg} ${config.color}`}>
              <config.icon size={10} className="shrink-0" aria-hidden="true" />
              <span>{config.label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      {isAvailable && (
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onView(); }} 
            className="p-1.5 sm:p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all" 
            title="View Document"
          >
            <Eye size={16} aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onCopyLink(); }} 
            className="p-1.5 sm:p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all" 
            title="Copy Link"
          >
            <Link size={16} aria-hidden="true" />
          </button>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onDownload(); }} 
            className="p-1.5 sm:p-2 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 active:scale-95 transition-all" 
            title="Download PDF"
          >
            <Download size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

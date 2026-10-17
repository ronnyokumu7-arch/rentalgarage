// src/components/fleet/VehicleDocumentsCard.tsx
"use client";

import { FileText, Upload, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import type { Vehicle } from "@/lib/types";

interface VehicleDocumentsCardProps {
  vehicle: Vehicle;
  onViewDocument?: (url: string, label: string) => void;
}

function DocTile({
  title,
  url,
  onView,
}: {
  title: string;
  url: string | null;
  onView?: () => void;
}) {
  const isAvailable = Boolean(url);

  return (
    <div className="bg-[var(--color-bg)]/60 border border-[var(--color-surface-border)] rounded-xl p-3 sm:p-4 flex flex-col justify-between gap-3 hover:border-[var(--color-primary)]/30 transition-all">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isAvailable
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20"
              : "bg-[var(--color-surface-hover)] text-[var(--color-ink-subtle)] border border-[var(--color-surface-border)]"
          }`}>
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--color-ink)] truncate">{title}</h4>
            <span className="text-[9px] font-semibold text-[var(--color-ink-muted)] block">
              {isAvailable ? "PDF / Image File" : "Not uploaded"}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {isAvailable ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
            <CheckCircle2 size={10} /> Active
          </span>
        ) : (
          <span className="inline-flex lg:hidden items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex-shrink-0">
            <AlertCircle size={10} /> Missing
          </span>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="pt-2.5 border-t border-[var(--color-surface-border)]/60 flex items-center justify-end gap-2">
        {isAvailable && url && onView && (
          <button
            type="button"
            onClick={onView}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] active:scale-95 transition-all"
          >
            <Eye size={14} /> View
          </button>
        )}
        <button
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/20 active:scale-95 transition-all"
        >
          <Upload size={14} /> {isAvailable ? "Replace" : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default function VehicleDocumentsCard({
  vehicle,
  onViewDocument,
}: VehicleDocumentsCardProps) {
  const uploadedCount = [
    vehicle.insurance_doc,
    vehicle.registration_doc,
    vehicle.inspection_doc,
  ].filter(Boolean).length;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-card)] space-y-3.5 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
          <FileText size={16} className="text-[var(--color-primary)] flex-shrink-0" /> Compliance Documents
        </h3>
        <span className="text-[10px] font-mono text-[var(--color-ink-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded-md border border-[var(--color-surface-border)]">
          {uploadedCount} / 3 Uploaded
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        <DocTile
          title="Insurance Certificate"
          url={vehicle.insurance_doc}
          onView={
            vehicle.insurance_doc
              ? () => onViewDocument?.(vehicle.insurance_doc!, "Insurance Certificate")
              : undefined
          }
        />
        <DocTile
          title="Registration Book"
          url={vehicle.registration_doc}
          onView={
            vehicle.registration_doc
              ? () => onViewDocument?.(vehicle.registration_doc!, "Registration Book")
              : undefined
          }
        />
        <DocTile
          title="Inspection Report"
          url={vehicle.inspection_doc}
          onView={
            vehicle.inspection_doc
              ? () => onViewDocument?.(vehicle.inspection_doc!, "Inspection Report")
              : undefined
          }
        />
      </div>
    </div>
  );
}

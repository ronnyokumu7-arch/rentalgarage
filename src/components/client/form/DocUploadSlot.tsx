// src/components/client/form/DocUploadSlot.tsx
"use client";

import { CheckCircle, Eye } from "lucide-react";
import type { DocSlotProps } from "./types";

export default function DocUploadSlot({
  label,
  icon: Icon,
  file,
  setFile,
  required = false,
  existingUrl,
  captureMode,
  error,
  fieldId,
}: DocSlotProps) {
  const hasNewFile = !!file;
  const hasExisting = !!existingUrl && !hasNewFile;
  const captureAttr =
    captureMode === "user" || captureMode === "environment"
      ? captureMode
      : undefined;
  const isClickable = !!setFile;

  return (
    <div className="flex flex-col gap-1.5" id={fieldId}>
      <label
        className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all min-h-[90px] ${
          isClickable ? "cursor-pointer hover:bg-[var(--color-primary)]/5" : ""
        } ${
          error
            ? "border-[var(--color-danger)]/60"
            : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
        } bg-[var(--color-surface)]`}
      >
        {isClickable && (
          <input
            type="file"
            accept="image/*"
            capture={captureAttr}
            className="hidden"
            onChange={(e) => setFile?.(e.target.files?.[0] || null)}
          />
        )}

        {hasNewFile ? (
          <>
            <div className="w-8 h-8 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] flex items-center justify-center mb-1.5">
              <CheckCircle size={16} />
            </div>
            <p className="text-xs font-bold text-[var(--color-ink)] truncate w-full text-center px-1">
              {file!.name}
            </p>
          </>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] flex items-center justify-center mb-1.5">
              <Icon size={16} />
            </div>
            <p className="text-xs font-semibold text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] text-center leading-tight">
              {label}{" "}
              {required && <span className="text-[var(--color-danger)]">*</span>}
            </p>
          </>
        )}
      </label>

      {error && (
        <p className="text-[10px] font-medium text-[var(--color-danger)] px-1">
          {error}
        </p>
      )}

      {hasExisting && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            // openLightbox is passed via closure from parent via fieldId pattern
            const event = new CustomEvent("doc-preview", {
              detail: { url: existingUrl, title: label },
            });
            window.dispatchEvent(event);
          }}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold hover:bg-[var(--color-primary)]/20 transition-colors w-full active:scale-[0.98]"
        >
          <Eye size={12} />
          View Document
        </button>
      )}
    </div>
  );
}

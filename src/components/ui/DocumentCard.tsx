"use client";

import React from "react";
import { Download, Eye, Upload, X } from "@phosphor-icons/react/ssr";
import Badge from "./Badge";

interface DocumentCardProps {
  title: string;
  type: "contract" | "invoice" | "receipt" | "report" | "identity" | "license" | "other";
  date?: string;
  amount?: string;
  status?: { label: string; variant: "success" | "warning" | "danger" | "accent" | "neutral" };
  imageUrl?: string;
  onView?: () => void;
  onDownload?: () => void;
  onUpload?: () => void;
  onRemove?: () => void;
  className?: string;
}

export default function DocumentCard({
  title,
  type,
  date,
  amount,
  status,
  imageUrl,
  onView,
  onDownload,
  onUpload,
  onRemove,
  className = "",
}: DocumentCardProps) {

  return (
    <div className={`card !p-0 overflow-hidden ${className}`}>
      {/* Image Preview */}
      {imageUrl && (
        <div className="relative aspect-video bg-surface-hover overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-ink/60 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-ink-muted capitalize">{type}</span>
              {date && (
                <>
                  <span className="text-xs text-ink-subtle">·</span>
                  <span className="text-xs text-ink-muted">{date}</span>
                </>
              )}
            </div>
          </div>
          {status && (
            <Badge variant={status.variant} size="sm">
              {status.label}
            </Badge>
          )}
        </div>

        {amount && (
          <p className="text-lg font-bold text-ink mb-3">{amount}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onView && (
            <button onClick={onView} className="btn btn-ghost btn-sm">
              <Eye size={14} weight="regular" aria-hidden="true" />
              View
            </button>
          )}
          {onDownload && (
            <button onClick={onDownload} className="btn btn-secondary btn-sm">
              <Download size={14} weight="regular" aria-hidden="true" />
              Download
            </button>
          )}
          {onUpload && !imageUrl && (
            <button onClick={onUpload} className="btn btn-primary btn-sm">
              <Upload size={14} weight="regular" aria-hidden="true" />
              Upload
            </button>
          )}
          {onUpload && imageUrl && (
            <button onClick={onUpload} className="btn btn-ghost btn-sm">
              <Upload size={14} weight="regular" aria-hidden="true" />
              Replace
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
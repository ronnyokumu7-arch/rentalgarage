"use client";

import React from "react";
import { X } from "@phosphor-icons/react/ssr";
import OverlayPortal from "./OverlayPortal";

type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: DrawerSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeStyles: Record<DrawerSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-full w-full",
};

export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  className:_className = "",
}: DrawerProps) {
  if (!open) return null;

  const hasHeader = title || subtitle || showCloseButton;

  return (
    <OverlayPortal
      onClose={onClose}
      closeOnEscape={closeOnEsc}
      lockScroll
    >
    <div
      className="fixed inset-0 z-[9999] flex justify-end animate-fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Drawer panel */}
      <div
        className={`relative flex flex-col h-full w-full ${sizeStyles[size]}
          bg-surface-card border-l border-surface-border shadow-[var(--shadow-modal)]
          animate-slide-in`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {hasHeader && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-surface-border flex-shrink-0">
            <div className="min-w-0">
              {title && (
                <h2 className="text-lg font-semibold text-ink leading-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-ink-muted mt-0.5 leading-snug">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                  text-ink-subtle hover:bg-surface-hover hover:text-ink transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={18} weight="regular" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-surface-border bg-surface/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
    </OverlayPortal>
  );
}
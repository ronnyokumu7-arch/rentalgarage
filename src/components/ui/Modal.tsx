"use client";

import { useId, type ReactNode } from "react";
import { X } from "@phosphor-icons/react/ssr";
import OverlayPortal from "./OverlayPortal";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl";
type ModalPresentation = "responsive" | "centered" | "sheet" | "fullscreen";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: ModalSize;
  presentation?: ModalPresentation;
  ariaLabel?: string;
  header?: ReactNode;
  footer?: ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  panelClassName?: string;
  showCloseButton?: boolean;
  closeDisabled?: boolean;
  children: ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  presentation = "responsive",
  ariaLabel,
  header,
  footer,
  headerClassName = "",
  bodyClassName = "",
  panelClassName = "",
  showCloseButton = true,
  closeDisabled = false,
  children,
}: ModalProps) {
  const titleId = useId();
  if (!open) return null;

  const desktopWidth = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-6xl",
    "2xl": "sm:max-w-7xl",
  }[size];
  const placement = {
    responsive: "items-end sm:items-center p-0 sm:p-4",
    centered: "items-center p-4",
    sheet: "items-end p-0",
    fullscreen: "items-stretch p-0",
  }[presentation];
  const panelShape = {
    responsive: "rounded-t-2xl sm:rounded-2xl",
    centered: "rounded-2xl",
    sheet: "rounded-t-2xl",
    fullscreen: "rounded-none",
  }[presentation];
  const isFullscreen = presentation === "fullscreen";
  const showDragHandle = presentation === "responsive" || presentation === "sheet";

  return (
    <OverlayPortal onClose={onClose}>
      <div className={`fixed inset-0 z-[9999] flex justify-center ${placement}`}>
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          className={`
            relative flex w-full flex-col overflow-hidden
            ${isFullscreen ? "h-full max-w-none" : `${desktopWidth} max-h-[90dvh]`}
            bg-[var(--color-bg)] border border-[var(--color-surface-border)]
            ${panelShape} shadow-2xl
            ${showDragHandle ? "pb-[env(safe-area-inset-bottom,0px)]" : ""}
            animate-in slide-in-from-bottom sm:zoom-in-95 sm:slide-in-from-bottom-0 duration-300 ease-out
            ${panelClassName}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={!title ? ariaLabel ?? "Dialog" : undefined}
        >
          {showDragHandle && (
            <div className="sm:hidden flex justify-center pt-3 -mb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--color-surface-border)]" />
            </div>
          )}

          {(header || title || subtitle || showCloseButton) && (
            <div className={`flex shrink-0 items-center justify-between gap-4 px-5 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-bg)] ${panelShape} ${headerClassName}`}>
              <div className="min-w-0 flex-1">
                {header ?? (
                  <>
                    {title && <h3 id={titleId} className="text-base sm:text-lg font-bold text-[var(--color-ink)]">{title}</h3>}
                    {subtitle && <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-0.5">{subtitle}</p>}
                  </>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={closeDisabled}
                  className="p-2 rounded-xl hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all duration-150 active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close dialog"
                >
                  <X size={20} weight="regular" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-4 sm:p-6 ${bodyClassName}`}>
            {children}
          </div>

          {footer && (
            <div className="shrink-0 border-t border-[var(--color-surface-border)]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </OverlayPortal>
  );
}

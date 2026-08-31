"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, subtitle, size = "md", children }: ModalProps) {
  // Handle Escape key and prevent background scrolling
  useEffect(() => {
    if (!open) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  // Responsive width: full-width bottom sheet on mobile, size-limited centered card on desktop
  // Added 'xl' (6xl) and '2xl' (7xl) for wide, complex forms like the Booking Orchestrator
  const desktopWidth = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-6xl",   // ✅ Perfect for 2-column forms with sidebars
    "2xl": "sm:max-w-7xl", // ✅ For ultra-wide dashboards or complex tables
  }[size];

  return (
    // Container: items-end on mobile (slide from bottom), items-center on desktop
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full ${desktopWidth}
          bg-[var(--color-bg)] border border-[var(--color-surface-border)] border-b-0 sm:border-b
          rounded-t-2xl sm:rounded-2xl
          shadow-2xl
          flex flex-col
          max-h-[90vh] sm:max-h-[90vh]
          pb-[env(safe-area-inset-bottom,0px)]
          animate-in slide-in-from-bottom sm:zoom-in-95 sm:slide-in-from-bottom-0 duration-300 ease-out
        `}
      >
        {/* iOS drag handle indicator — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 -mb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--color-surface-border)]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-bg)] rounded-t-2xl sm:rounded-t-none">
          <div className="min-w-0 pr-4">
            {title && <h3 className="text-base sm:text-lg font-bold text-[var(--color-ink)] truncate">{title}</h3>}
            {subtitle && <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] truncate mt-0.5">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all duration-150 active:scale-95 shrink-0"
            aria-label="Close"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

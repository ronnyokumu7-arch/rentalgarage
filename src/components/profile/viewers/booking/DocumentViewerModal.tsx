// src/components/ui/DocumentViewerModal.tsx
"use client";

import { X, Download, ArrowSquareOut as ExternalLink } from "@phosphor-icons/react/ssr";
import OverlayPortal from "@/components/ui/OverlayPortal";

interface DocumentViewerModalProps {
  title: string;
  url: string;
  onClose: () => void;
}

export default function DocumentViewerModal({ 
  title, 
  url, 
  onClose 
}: DocumentViewerModalProps) {
  
  return (
    <OverlayPortal onClose={onClose}>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Premium Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
          <h3 className="text-sm font-bold text-[var(--color-ink)] truncate pr-4">
            {title} Preview
          </h3>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Open in New Tab Button */}
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={16} aria-hidden="true" />
            </a>
            
            {/* Download Button */}
            <a 
              href={url} 
              download 
              className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors"
              title="Download file"
            >
              <Download size={16} aria-hidden="true" />
            </a>
            
            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl text-[var(--color-ink-muted)] hover:bg-rose-500/5 hover:text-rose-500 transition-colors"
              title="Close preview"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Iframe Container with Loading State Fallback */}
        <div className="flex-1 relative bg-white dark:bg-slate-950">
          <iframe 
            src={url} 
            className="w-full h-full border-none" 
            title={`${title} Preview`}
            sandbox="allow-scripts allow-same-origin allow-downloads"
          />
          
          {/* Optional: Add loading skeleton overlay here if needed */}
        </div>
      </div>
    </div>
    </OverlayPortal>
  );
}

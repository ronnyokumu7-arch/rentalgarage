// src/components/ui/SecureLightbox.tsx
"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Loader2, AlertTriangle, RefreshCw, FileText } from "lucide-react";
import { fetchSignedUrl } from "@/components/ui/SecureImage";

interface SecureLightboxProps {
  url: string | null;   // stored API URL; null = closed
  title?: string;
  onClose: () => void;
}

export default function SecureLightbox({ url, title = "Document", onClose }: SecureLightboxProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // ✅ iOS Safari cannot render PDFs inside an iframe — show an open-card instead
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const isPdf = url ? /\.pdf($|\?)/i.test(url) : false;

  // Resolve the signed URL whenever a document is opened or retried.
  // ✅ bustCache=true on retry defeats aggressive mobile carrier proxies that stale-serve lookups.
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setSignedUrl(null);
    setFailed(false);

    fetchSignedUrl(url, attempt > 0)
      .then((u) => {
        if (cancelled) return;
        if (u) {
          setSignedUrl(u);
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => { cancelled = true; };
  }, [url, attempt]);

  // Esc key closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (url) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [url, onClose]);

  if (!url) return null;

  const retry = () => setAttempt((a) => a + 1);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-border)]">
          <h4 className="text-sm font-bold text-[var(--color-ink)] truncate">{title}</h4>
          <div className="flex items-center gap-1">
            {signedUrl && (
              <button
                type="button"
                onClick={() => window.open(signedUrl, "_blank")}
                title="Open in new tab"
                className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <ExternalLink size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-black/40 flex items-center justify-center min-h-[300px]">
          {failed ? (
            <div className="p-8 text-center">
              <AlertTriangle size={28} className="text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-[var(--color-ink-muted)] mb-4">
                Unable to load this document. Check your connection and retry.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={retry}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95"
                >
                  <RefreshCw size={12} /> Retry
                </button>
                <button
                  type="button"
                  onClick={() => window.open(signedUrl || url, "_blank")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--color-surface-border)] text-[var(--color-ink)] text-xs font-semibold hover:bg-[var(--color-surface-hover)] transition-colors active:scale-95"
                >
                  <ExternalLink size={12} /> Open in browser
                </button>
              </div>
            </div>
          ) : !signedUrl ? (
            <Loader2 size={24} className="animate-spin text-[var(--color-ink-muted)]" />
          ) : isPdf ? (
            isIOS ? (
              // ✅ iOS Safari cannot render PDFs in iframes — open-card instead
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center mx-auto mb-3">
                  <FileText size={24} className="text-[var(--color-ink-muted)]" />
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] mb-4">
                  PDF preview is not supported on this device.
                </p>
                <button
                  type="button"
                  onClick={() => window.open(signedUrl, "_blank")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95"
                >
                  <ExternalLink size={12} /> Open PDF
                </button>
              </div>
            ) : (
              <iframe src={signedUrl} title={title} className="w-full h-[70vh] bg-white" />
            )
          ) : (
            <img
              src={signedUrl}
              alt={title}
              className="max-w-full max-h-[70vh] object-contain"
              onError={() => setFailed(true)}   // ✅ dead/expired image → retry UI
            />
          )}
        </div>
      </div>
    </div>
  );
}

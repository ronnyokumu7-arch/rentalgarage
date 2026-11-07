"use client";

import { Toaster as HotToaster, ToastBar, toast } from "react-hot-toast";
import { X, Info } from "@phosphor-icons/react/ssr";

/**
 * Brand-configured Toaster — drop this into your root layout once.
 *
 * Usage in layout.tsx:
 *   import { Toaster } from "@/components/ui/Toast";
 *   <Toaster />
 *
 * Usage anywhere:
 *   import toast from "react-hot-toast";
 *   toast.success("Booking created!");
 *   toast.error("Something went wrong.");
 *   toast.loading("Saving...");
 */
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          fontWeight: 500,
          padding: "0.875rem 1rem",
          borderRadius: "0.75rem",
          border: "1px solid var(--color-surface-border)",
          boxShadow: "var(--shadow-dropdown)",
          background: "var(--color-surface-card)",
          color: "var(--color-ink)",
          maxWidth: "420px",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#dcfce7",
          },
          style: {
            borderColor: "rgba(34, 197, 94, 0.2)",
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fee2e2",
          },
          style: {
            borderColor: "rgba(239, 68, 68, 0.2)",
          },
        },
        loading: {
          duration: Infinity,
          iconTheme: {
            primary: "#1e6fba",
            secondary: "#e8f4fd",
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-start gap-3 w-full">
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0 text-sm leading-snug">
                {message}
              </div>
              {t.type !== "loading" && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center
                    text-ink-subtle hover:bg-surface-hover hover:text-ink transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={14} weight="regular" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </HotToaster>
  );
}

/**
 * Helper toasts — use these for consistent messaging patterns.
 */
export const brandToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  loading: (msg: string) => toast.loading(msg),
  info: (msg: string) =>
    toast(msg, {
      icon: <Info size={18} className="text-accent-dark" aria-hidden="true" />,
    }),

  /** Promise-aware toast — auto handles loading/success/error */
  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => toast.promise(promise, messages),
};

export default toast;
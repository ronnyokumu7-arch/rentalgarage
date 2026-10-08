"use client";

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { toast } from "react-hot-toast";

export interface ToastAction {
  label: string;
  href?: string;
  action: "retry" | "navigate" | "dismiss" | "reload";
}

export interface AppToastResponse {
  type: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  action?: ToastAction;
  field_errors?: Record<string, string>;
  details?: Record<string, unknown>;
}

interface AppToastProps {
  t: { visible: boolean; id: string };
  response: AppToastResponse;
  onAction?: (action: ToastAction) => void | Promise<void>;
}

const SEVERITY_CONFIG = {
  success: {
    Icon: CheckCircle2,
    // Uses your root <Toaster> success.iconTheme via CSS var
    color: "var(--color-success)",
    bg: "var(--color-success-bg, rgba(6, 95, 70, 0.08))",
  },
  error: {
    Icon: AlertCircle,
    color: "var(--color-danger)",
    bg: "var(--color-danger-bg, rgba(153, 27, 27, 0.08))",
  },
  warning: {
    Icon: AlertTriangle,
    color: "var(--color-warning)",
    bg: "var(--color-warning-bg, rgba(146, 64, 14, 0.08))",
  },
  info: {
    Icon: Info,
    color: "var(--color-primary)",
    bg: "var(--color-primary-muted, rgba(67, 56, 202, 0.08))",
  },
};

export function AppToast({ t, response, onAction }: AppToastProps) {
  const config = SEVERITY_CONFIG[response.type];
  const Icon = config.Icon;

  const handleActionClick = async () => {
    if (!response.action) return;

    const { action } = response.action;

    try {
      // Let caller hook retry logic (re-fires the original request)
      if (action === "retry" && onAction) {
        await onAction(response.action);
      } else if (action === "navigate" && response.action.href) {
        window.location.href = response.action.href;
      } else if (action === "reload") {
        window.location.reload();
      }
    } catch (err) {
      console.error("[AppToast] Action failed:", err);
    } finally {
      toast.dismiss(t.id);
    }
  };

  const handleDismiss = () => toast.dismiss(t.id);

  return (
    <div
      className={`
        flex gap-3 items-start p-4 rounded-xl border
        shadow-[var(--shadow-dropdown,0_10px_30px_-10px_rgba(0,0,0,0.15))]
        transition-all duration-200 ease-out
        ${t.visible ? "animate-in fade-in slide-in-from-top-2" : "animate-out fade-out slide-out-to-top-2"}
      `}
      style={{
        background: "var(--color-surface, #FFFFFF)",
        color: "var(--color-ink-primary, #1C1917)",
        borderColor: "var(--color-surface-border, rgba(44, 38, 32, 0.10))",
        maxWidth: "420px",
        minWidth: "320px",
      }}
      role="alert"
      aria-live="assertive"
    >
      {/* Severity Icon */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        <Icon size={18} strokeWidth={2.25} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-bold leading-tight"
          style={{ color: "var(--color-ink-primary, #1C1917)" }}
        >
          {response.title}
        </p>
        <p
          className="text-xs mt-1 leading-relaxed"
          style={{ color: "var(--color-ink-muted, #57534E)" }}
        >
          {response.message}
        </p>

        {/* Action Button */}
        {response.action && (
          <button
            onClick={handleActionClick}
            className="mt-2 text-xs font-semibold underline underline-offset-2 transition-colors hover:opacity-80"
            style={{ color: config.color }}
          >
            {response.action.label}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded-md transition-colors hover:bg-[var(--color-surface-hover,rgba(0,0,0,0.04))]"
        style={{ color: "var(--color-ink-subtle, #78716C)" }}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

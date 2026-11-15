"use client";

import { ArrowLeft } from "@phosphor-icons/react"; // ✅ FIXED: Removed unused ArrowRight
import {
  getNotificationIcon,
  getTimeAgo,
  getContextualActionLabel,
} from "@/lib/notifications/helpers";
import type { Notification } from "@/lib/types";

interface NotificationFocusViewProps {
  notification: Notification;
  onBack: () => void;
  onAction: () => void;
  isMobile?: boolean;
}

export default function NotificationFocusView({
  notification,
  onBack,
  onAction,
  isMobile = false,
}: NotificationFocusViewProps) {
  const { label: ctaLabel, icon: ctaIcon } = getContextualActionLabel(notification);

  return (
    <div
      className="flex flex-col h-full"
      style={{ minHeight: isMobile ? "60vh" : "400px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-surface-border)]">
        <button
          onClick={onBack}
          className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-ink-muted)]"
          aria-label="Go back to list"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
            {notification.type}
          </p>
          <p className="text-xs text-[var(--color-ink-subtle)]">
            {getTimeAgo(notification.created_at)}
          </p>
        </div>
        {!notification.is_read && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: "var(--color-primary)" }}
          />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[var(--color-surface-hover)] text-[var(--color-primary)]">
            {getNotificationIcon(notification.type, 24)}
          </div>
          <h2 className="text-xl font-bold leading-tight text-[var(--color-ink-primary)]">
            {notification.title}
          </h2>
        </div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-ink-primary)]">
          {notification.message}
        </p>

        {notification.payload && Object.keys(notification.payload).length > 0 && (
          <div className="mt-6 p-4 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">
            <p className="font-bold mb-2 uppercase tracking-wide text-[var(--color-ink-subtle)] text-xs">
              Details
            </p>
            {Object.entries(notification.payload).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between py-1.5 border-b border-[var(--color-surface-border)] last:border-0"
              >
                <span className="capitalize text-xs text-[var(--color-ink-muted)]">
                  {key.replace(/_/g, " ")}:
                </span>
                <span className="text-xs font-semibold text-[var(--color-ink-primary)]">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Footer */}
      {notification.action_url && (
        <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface)]">
          <button
            onClick={onAction}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
            }}
          >
            {ctaLabel} {ctaIcon}
          </button>
        </div>
      )}
    </div>
  );
}

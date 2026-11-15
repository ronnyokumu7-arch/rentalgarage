"use client";

import { useRef } from "react";
import { CheckCircle, Circle } from "@phosphor-icons/react";
import { useLongPress } from "@/hooks/notifications/useLongPress";
import {
  getTimeAgo,
  getNotificationIcon,
} from "@/lib/notifications/helpers";
import type { Notification } from "@/lib/types"; // ✅ FIX #1: single source of truth

interface NotificationRowProps {
  notification: Notification;
  isSelected: boolean;
  isSelectionMode: boolean;
  onTap: () => void;
  onLongPress: () => void;
  onToggleSelect: () => void;
}

export default function NotificationRow({
  notification,
  isSelected,
  isSelectionMode,
  onTap,
  onLongPress,
  onToggleSelect,
}: NotificationRowProps) {
  // ✅ FIX #3: synchronous guard so the post-long-press `click`
  // doesn't immediately toggle the row back off.
  const justLongPressed = useRef(false);

  const handleLongPress = () => {
    justLongPressed.current = true;
    onLongPress();
  };

  const longPressHandlers = useLongPress(handleLongPress);

  const handleClick = () => {
    // Swallow the click that follows a long-press.
    if (justLongPressed.current) {
      justLongPressed.current = false;
      return;
    }
    if (isSelectionMode) {
      onToggleSelect();
    } else {
      onTap();
    }
  };

  return (
    <li
      className={`border-b border-[var(--color-surface-border)] last:border-0 transition-all duration-200 ${
        isSelected
          ? "bg-[var(--color-primary-subtle)]"
          : "hover:bg-[var(--color-surface-hover)]"
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        {...(isSelectionMode ? {} : longPressHandlers)}
        aria-pressed={isSelected}
        className="w-full text-left p-4 flex gap-3 items-start"
        style={{
          borderLeft: isSelected
            ? "4px solid var(--color-primary)"
            : !notification.is_read
            ? "3px solid var(--color-primary)"
            : "3px solid transparent",
        }}
      >
        {/* Checkbox / Icon Area */}
        <div className="mt-1 shrink-0">
          {isSelectionMode ? (
            isSelected ? (
              <CheckCircle
                size={22}
                weight="fill"
                className="text-[var(--color-primary)]"
              />
            ) : (
              <Circle
                size={22}
                weight="bold"
                className="text-[var(--color-ink-muted)]"
              />
            )
          ) : (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                notification.is_read
                  ? "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                  : "bg-[var(--color-primary)] text-white shadow-sm"
              }`}
            >
              {/* ✅ FIX #2: real icon from helpers (was a stub returning undefined) */}
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-bold truncate transition-colors ${
                isSelected
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-ink-primary)]"
              }`}
            >
              {notification.title}
            </p>
            {!notification.is_read && !isSelectionMode && (
              <span className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-[var(--color-primary)]" />
            )}
          </div>
          <p className="text-xs mt-1 line-clamp-2 text-[var(--color-ink-muted)]">
            {notification.message}
          </p>
          <p className="text-[10px] mt-2 font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
            {/* ✅ FIX #2: getTimeAgo now imported, not duplicated */}
            {getTimeAgo(notification.created_at)}
          </p>
        </div>
      </button>
    </li>
  );
}

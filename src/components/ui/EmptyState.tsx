import React from "react";
import {  Tray as Inbox } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

interface EmptyStateProps {
  icon?: Icon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`empty-state ${compact ? "py-10" : ""} ${className}`}
    >
      <div
        className={`empty-state-icon ${
          compact ? "w-12 h-12 mb-3" : ""
        }`}
      >
        <Icon
          size={compact ? 22 : 28}
          weight="light"
          className="text-accent-dark" aria-hidden="true"
        />
      </div>

      <h3
        className={`font-semibold text-ink ${
          compact ? "text-sm mb-1" : "text-base mb-1.5"
        }`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`text-ink-muted max-w-sm leading-relaxed ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
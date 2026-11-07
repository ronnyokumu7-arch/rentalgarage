"use client";

import React from "react";
import type { Icon } from "@phosphor-icons/react";

interface QuickAction {
  label: string;
  icon: Icon;
  onClick: () => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const variantStyles = {
  default: "bg-surface hover:bg-surface-hover text-ink border-surface-border",
  primary: "bg-accent-bg hover:bg-accent-bg-hover text-accent-dark border-accent/20",
  danger: "bg-danger-bg hover:bg-danger-bg/70 text-danger border-danger/20",
};

export default function QuickActions({
  actions,
  columns = 3,
  className = "",
}: QuickActionsProps) {
  const colClasses = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-2 ${className}`}>
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <button
            key={i}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl
              border transition-all duration-150
              ${variantStyles[action.variant || "default"]}
              ${action.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}
            `}
          >
            <Icon size={20} weight="light" aria-hidden="true" />
            <span className="text-xs font-medium text-center">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
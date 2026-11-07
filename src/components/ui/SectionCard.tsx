// src/components/ui/SectionCard.tsx
"use client";

import React from "react";
import type { Icon } from "@phosphor-icons/react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  icon?: Icon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  padding?: boolean | string; // Allow custom padding override like "!p-0"
  className?: string;
  variant?: "default" | "dark" | "ghost";
  onClick?: () => void;
}

export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  padding = true,
  className = "",
  variant = "default",
  onClick,
}: SectionCardProps) {
  // ✅ BRAND TOKENS: Uses CSS variables for perfect theme consistency
  const baseStyles: Record<NonNullable<SectionCardProps["variant"]>, string> = {
    default:
      "bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
    dark: "bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] border border-white/5",
    ghost: "bg-transparent border border-dashed border-[var(--color-surface-border)]",
  };

  const dividerColor =
    variant === "dark" ? "border-white/[0.08]" : "border-[var(--color-surface-border)]";

  const hasHeader = title || subtitle || Icon || actions;

  // Handle flexible padding while preserving !important overrides
  const paddingClass = typeof padding === 'string' 
    ? padding 
    : padding 
      ? "p-6" 
      : "";

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl overflow-hidden transition-all duration-200 ${baseStyles[variant]} ${
        onClick ? "cursor-pointer active:scale-[0.995]" : ""
      } ${className}`}
    >
      {hasHeader && (
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${dividerColor} bg-[var(--color-surface-hover)]/30`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  variant === "dark" 
                    ? "bg-white/10 border-white/10 text-[var(--color-primary)]" 
                    : "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/10 text-[var(--color-primary)]"
                }`}
              >
                <Icon size={18} weight="light" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-sm font-bold text-[var(--color-ink)] leading-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5 leading-snug truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={paddingClass}>{children}</div>
    </div>
  );
}

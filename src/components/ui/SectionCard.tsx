"use client";
import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  padding?: boolean;
  className?: string;
  variant?: "default" | "dark" | "ghost";
  onClick?: () => void; // ✅ Added onClick prop for clickable cards
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
  onClick, // ✅ Destructure onClick
}: SectionCardProps) {
  const baseStyles: Record<
    NonNullable<SectionCardProps["variant"]>,
    string
  > = {
    default:
      "bg-surface-card border border-surface-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
    dark: "bg-card-gradient border border-white/5",
    ghost: "bg-surface border border-surface-border",
  };

  const titleColor = variant === "dark" ? "text-white" : "text-ink";
  const subtitleColor =
    variant === "dark" ? "text-white/50" : "text-ink-muted";
  const dividerColor =
    variant === "dark" ? "border-white/[0.08]" : "border-surface-border";

  const hasHeader = title || subtitle || Icon || actions;

  return (
    <div
      onClick={onClick} // ✅ Pass onClick to the root div
      className={`rounded-2xl overflow-hidden transition-shadow duration-200 ${baseStyles[variant]} ${
        onClick ? "cursor-pointer hover:shadow-lg active:scale-[0.99]" : ""
      } ${className}`}
    >
      {hasHeader && (
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${dividerColor}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  variant === "dark" ? "bg-white/10" : "bg-accent-bg"
                }`}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className={
                    variant === "dark" ? "text-accent" : "text-accent-dark"
                  }
                />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3
                  className={`text-sm font-semibold leading-tight truncate ${titleColor}`}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={`text-xs mt-0.5 leading-snug ${subtitleColor}`}
                >
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
      <div className={padding ? "p-6" : ""}>{children}</div>
    </div>
  );
}

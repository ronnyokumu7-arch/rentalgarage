"use client";
import React from "react";
import type { Icon } from "@phosphor-icons/react";

interface Action {
  label: string;
  onClick: () => void;
  icon?: Icon;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: Icon;
  actions?: Action[];
  breadcrumb?: { label: string; href?: string }[];
  children?: React.ReactNode;
}

const actionStyles = {
  primary:   "btn btn-primary",
  secondary: "btn btn-secondary",
  ghost:     "btn btn-ghost",
  danger:    "btn btn-danger",
};

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions = [],
  breadcrumb = [],
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 mb-2">
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span className="text-ink-subtle text-xs">/</span>
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="text-xs text-ink-muted hover:text-accent-dark transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-xs text-ink-subtle">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left — title block */}
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent-bg"
            >
              <Icon size={20} className="text-accent-dark" weight="light" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-ink leading-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-ink-muted mt-0.5 leading-snug">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right — actions */}
        {(actions.length > 0 || children) && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions.map((action, i) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={i}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={actionStyles[action.variant ?? "primary"]}
                >
                  {ActionIcon && <ActionIcon size={16} weight="regular" aria-hidden="true" />}
                  {action.label}
                </button>
              );
            })}
            {children}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mt-4 h-px bg-surface-border" />
    </div>
  );
}

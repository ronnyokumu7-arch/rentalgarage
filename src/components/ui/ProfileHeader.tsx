"use client";

import React from "react";
import type { Icon } from "@phosphor-icons/react";
import Badge from "./Badge";

interface InfoPill {
  label: string;
  value: string;
  icon?: Icon;
}

interface ProfileHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: React.ReactNode;
  icon?: Icon;
  status?: { label: string; variant: "success" | "warning" | "danger" | "accent" | "neutral" | "critical" };
  infoPills?: InfoPill[];
  actions?: React.ReactNode;
  className?: string;
}

export default function ProfileHeader({
  title,
  subtitle,
  avatar,
  icon: Icon,
  status,
  infoPills = [],
  actions,
  className = "",
}: ProfileHeaderProps) {
  return (
    <div className={`card ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        {/* Left — identity block */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Avatar / Icon */}
          {avatar ? (
            <div className="flex-shrink-0">{avatar}</div>
          ) : Icon ? (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-accent-bg">
              <Icon size={28} weight="light" className="text-accent-dark" aria-hidden="true" />
            </div>
          ) : null}

          {/* Title + subtitle + status */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-ink leading-tight truncate">
                {title}
              </h1>
              {status && (
                <Badge variant={status.variant} dot>
                  {status.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-ink-muted mt-1 leading-snug">
                {subtitle}
              </p>
            )}

            {/* Info pills */}
            {infoPills.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-3">
                {infoPills.map((pill, i) => {
                  const PillIcon = pill.icon;
                  return (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1
                        rounded-lg bg-surface text-xs font-medium text-ink-muted
                        border border-surface-border"
                    >
                      {PillIcon && <PillIcon size={12} weight="regular" className="text-ink-subtle" aria-hidden="true" />}
                      <span className="text-ink-subtle">{pill.label}:</span>
                      <span className="text-ink">{pill.value}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right — actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 lg:mt-1">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
import React from "react";
import type { Icon } from "@phosphor-icons/react";

interface InfoItem {
  label: string;
  value: React.ReactNode;
  icon?: Icon;
  copyable?: boolean;
  href?: string;
}

interface InfoGridProps {
  items: InfoItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  compact?: boolean;
}

export default function InfoGrid({
  items,
  columns = 2,
  className = "",
  compact = false,
}: InfoGridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-4 ${className}`}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const content = (
          <div className={`${compact ? "py-2" : "py-3"}`}>
            <div className="flex items-center gap-1.5 mb-1">
              {Icon && <Icon size={13} weight="regular" className="text-ink-subtle" aria-hidden="true" />}
              <span className="text-xs font-medium text-ink-muted uppercase tracking-wide">
                {item.label}
              </span>
            </div>
            <div className="text-sm font-medium text-ink break-words">
              {item.value}
            </div>
          </div>
        );

        if (item.href) {
          return (
            <a
              key={i}
              href={item.href}
              className="block hover:bg-surface-hover rounded-lg transition-colors -mx-2 px-2"
            >
              {content}
            </a>
          );
        }

        return (
          <div key={i} className={compact ? "" : ""}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
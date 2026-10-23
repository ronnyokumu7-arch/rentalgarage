// src/components/layout/topbar/TopBarPageTitle.tsx
"use client";

import { ChevronDown, Info } from "lucide-react";

interface TopBarPageTitleProps {
  title: string;
  expanded: boolean;
  onToggleExpanded: () => void;
  onInfoClick?: () => void;
}

export default function TopBarPageTitle({
  title,
  expanded,
  onToggleExpanded,
  onInfoClick,
}: TopBarPageTitleProps) {
  return (
    <div className="flex items-center gap-1.5 min-w-0 max-w-full w-full">
      <button
        type="button"
        onClick={onToggleExpanded}
        className="flex items-center gap-1.5 min-w-0 flex-1 text-left active:opacity-80 transition-opacity"
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse page details" : "Expand page details"}
      >
        <span className="text-[15px] font-bold text-ink tracking-tight leading-tight truncate">
          {title}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`text-ink-muted flex-shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {onInfoClick && (
        <button
          type="button"
          onClick={onInfoClick}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/15 transition-colors active:scale-95"
          aria-label="About this page"
        >
          <Info size={15} strokeWidth={2.25} />
        </button>
      )}
    </div>
  );
}

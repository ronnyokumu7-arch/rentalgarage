"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { CaretRight as ChevronRight, Wrench } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

interface ActionButtonsProps {
  /** The URL to navigate to when the '>' button is clicked */
  viewUrl: string;
  
  /** Optional callback for the secondary button (e.g., opening a modal) */
  onQuickAction?: () => void;
  
  /** Icon for the secondary button (defaults to Wrench) */
  quickActionIcon?: Icon;
  
  /** Tooltip title for the secondary button */
  quickActionTitle?: string;
  
  /** Custom hover classes for the secondary button (defaults to warning/amber) */
  quickActionHoverClass?: string;
}

export default function ActionButtons({
  viewUrl,
  onQuickAction,
  quickActionIcon: QuickIcon = Wrench,
  quickActionTitle = "Quick Action",
  quickActionHoverClass = "hover:bg-warning-bg hover:text-warning-text",
}: ActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      {/* 1. Premium View Button (with slide animation) */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevents triggering the row's onRowClick
          router.push(viewUrl);
        }}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface-hover text-ink-muted hover:bg-accent-bg hover:text-accent-dark hover:translate-x-0.5 transition-all duration-200"
        title="View Details"
      >
        <ChevronRight size={14} aria-hidden="true" />
      </button>

      {/* 2. Optional Secondary Quick Action Button */}
      {onQuickAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction();
          }}
          className={`w-7 h-7 flex items-center justify-center rounded-lg bg-surface-hover text-ink-muted transition-all duration-200 ${quickActionHoverClass}`}
          title={quickActionTitle}
        >
          <QuickIcon size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

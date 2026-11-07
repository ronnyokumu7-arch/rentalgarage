"use client";

import React from "react";
import type { Icon } from "@phosphor-icons/react";

interface Tab {
  id: string;
  label: string;
  icon?: Icon;
  count?: number;
  disabled?: boolean;
}

interface TabPanelProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: "underline" | "pills";
}

export default function TabPanel({
  tabs,
  activeTab,
  onChange,
  className = "",
  variant = "underline",
}: TabPanelProps) {
  if (variant === "pills") {
    return (
      <div className={`flex items-center gap-1 p-1 rounded-xl bg-surface border border-surface-border ${className}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${
                  isActive
                    ? "bg-surface-card text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }
                ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {Icon && <Icon size={14} weight="regular" aria-hidden="true" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-accent-bg text-accent-dark" : "bg-surface-hover text-ink-subtle"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant (default)
  return (
    <div className={`border-b border-surface-border ${className}`}>
      <div className="flex items-center gap-1 -mb-px overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium
                whitespace-nowrap transition-colors duration-150
                ${
                  isActive
                    ? "text-accent-dark"
                    : "text-ink-muted hover:text-ink"
                }
                ${tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {Icon && <Icon size={15} weight="regular" aria-hidden="true" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-accent-bg text-accent-dark" : "bg-surface-hover text-ink-subtle"
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-dark rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
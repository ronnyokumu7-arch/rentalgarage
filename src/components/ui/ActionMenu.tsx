"use client";

import React, { useState, useRef, useEffect } from "react";
import { DotsThreeVertical as MoreVertical } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";

interface ActionMenuItem {
  label: string;
  icon?: Icon;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: "left" | "right";
}

export default function ActionMenu({ items, align = "right" }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg flex items-center justify-center
          text-ink-muted hover:bg-surface-hover hover:text-ink transition-colors"
      >
        <MoreVertical size={16} weight="regular" aria-hidden="true" />
      </button>

      {open && (
        <div
          className={`dropdown absolute ${
            align === "right" ? "right-0" : "left-0"
          } top-full mt-1 z-50 animate-fade-in`}
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                disabled={item.disabled}
                className={`dropdown-item ${item.variant === "danger" ? "danger" : ""}`}
              >
                {Icon && <Icon size={15} weight="light" aria-hidden="true" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
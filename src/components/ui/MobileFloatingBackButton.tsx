// src/components/ui/MobileFloatingBackButton.tsx
"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────
   Floating back button — fixed bottom-right, inset-surface chrome,
   icon always visible, label expands on desktop hover.
────────────────────────────────────────────────────────────────────── */

interface MobileFloatingBackButtonProps {
  /** Route to navigate to */
  href: string;
  /** Label revealed on hover (desktop only) */
  label: string;
  /** Icon override. Defaults to ArrowLeft. */
  icon?: LucideIcon;
  /** Accessible label for screen readers (falls back to label) */
  ariaLabel?: string;
}

export default function MobileFloatingBackButton({
  href,
  label,
  icon: Icon = ArrowLeft,
  ariaLabel,
}: MobileFloatingBackButtonProps) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={ariaLabel ?? label}
      className="group fixed right-4 sm:right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[0_5px_10px_-5px_rgba(0,0,0,0.8)] hover:shadow-[0_5px_10px_-5px_rgba(0,0,0,0.95)] transition-all duration-300 overflow-hidden min-w-[44px] sm:min-w-[48px]"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)",
      }}
    >
      <Icon
        size={18}
        className="text-[var(--color-ink)] shrink-0 transition-transform group-hover:-translate-x-0.5"
      />
      <span className="text-xs font-bold text-[var(--color-ink)] whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto transition-all duration-300 overflow-hidden">
        {label}
      </span>
    </Link>
  );
}

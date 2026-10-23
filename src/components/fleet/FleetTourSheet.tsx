// src/components/fleet/FleetTourSheet.tsx
"use client";

import { useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";

interface FleetTourSheetProps {
  isOpen: boolean;
  onClose: (remember?: boolean) => void;
}

const STEPS = [
  {
    title: "Searching vehicles",
    description: "Use the search bar to find vehicles by name, plate, or driver.",
  },
  {
    title: "Filter icon",
    description: "Tap the filter to narrow by status, type, or location.",
    icon: SlidersHorizontal,
  },
  {
    title: "Vehicle card actions",
    description: "Tap a card to view details, assign, or service.",
  },
  {
    title: "Pull-up menu",
    description: "Swipe up on a card to access quick actions like assign, share, or maintenance.",
  },
];

export default function FleetTourSheet({ isOpen, onClose }: FleetTourSheetProps) {
  const [remember, setRemember] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* ✅ Backdrop — sibling, not parent, so its blur doesn't affect the sheet */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => onClose(false)}
      />

      {/* ✅ Sheet — anchored to bottom, NOT blurred */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div
          className="bg-[var(--color-surface)] w-full max-w-md rounded-t-[24px] shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-[var(--color-surface-border-strong)]" />
          </div>

          <div className="flex items-start justify-between px-6 pb-4">
            <h2 className="text-2xl font-bold text-[var(--color-ink)] font-display tracking-tight">
              How Fleet Works
            </h2>
            <button
              onClick={() => onClose(false)}
              className="p-2 -mr-2 rounded-full text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-ink)] mb-1 flex items-center gap-2">
                      {step.title}
                      {Icon && <Icon size={14} className="text-[var(--color-primary)]" />}
                    </h4>
                    <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--color-surface-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
                Don't show again
              </span>
            </label>
            <button
              onClick={() => onClose(remember)}
              className="px-6 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-sm font-bold shadow-md shadow-[var(--color-primary)]/20 hover:bg-[var(--color-primary-hover)] transition-all active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/users/UsersHeader.tsx
"use client";

import React from "react";
import { Users, Plus, Envelope as Mail } from "@phosphor-icons/react/ssr";
import type { CategoryMode } from "@/hooks/users/useUsersList";

interface UsersHeaderProps {
  category: CategoryMode;
  onQuickInvite: () => void;
  onAddMember: () => void;
}

export default function UsersHeader({ category, onQuickInvite, onAddMember }: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
      {/* Title & Description */}
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight truncate">
            Team Members
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-0.5 sm:mt-1 leading-snug">
            {category === "executive" 
              ? "Manage your C-suite, directors, and top-level leadership." 
              : "Manage your operational staff, admins, and their access levels."}
          </p>
        </div>
      </div>
      
      {/* Action Buttons: Even side-by-side on mobile, auto-width on desktop */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-shrink-0 pt-1 sm:pt-0">
        <button
          type="button"
          onClick={onQuickInvite}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] active:scale-95 shadow-sm transition-all"
        >
          <Mail size={16} className="flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Quick Invite</span>
        </button>
        <button
          type="button"
          onClick={onAddMember}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] active:scale-95 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all"
        >
          <Plus size={16} className="flex-shrink-0" aria-hidden="true" />
          <span className="truncate">Add Member</span>
        </button>
      </div>
    </div>
  );
}
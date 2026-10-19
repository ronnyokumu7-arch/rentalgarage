// src/components/client/AddClientButton.tsx
"use client";

import { UserPlus } from "lucide-react";

interface AddClientButtonProps {
  onClick: () => void;
}

/**
 * ✅ Pure trigger. Owns no state — the caller provides the modal opener.
 * Both viewports use the same button (styled differently) so behavior is
 * identical: tap → open the AddClientModal from the page.
 */
export default function AddClientButton({ onClick }: AddClientButtonProps) {
  return (
    <>
      {/* 📱 MOBILE: full-width primary action */}
      <button
        onClick={onClick}
        className="md:hidden w-full h-10 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.99]"
        aria-label="Add new client"
      >
        <UserPlus size={16} strokeWidth={2.5} />
        Add Client
      </button>

      {/* 💻 DESKTOP: inline pill */}
      <button
        onClick={onClick}
        className="hidden md:flex h-10 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] shrink-0"
        aria-label="Add new client"
      >
        <UserPlus size={16} strokeWidth={2.5} />
        Add Client
      </button>
    </>
  );
}

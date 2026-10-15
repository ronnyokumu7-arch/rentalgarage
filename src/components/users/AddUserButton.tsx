// src/components/users/AddUserButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { UserPlus, Link2, ChevronDown } from "lucide-react";

interface AddUserButtonProps {
  onQuickAdd: () => void;
  onInvite: () => void;
}

export default function AddUserButton({ onQuickAdd, onInvite }: AddUserButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddManually = () => {
    setMenuOpen(false);
    onQuickAdd();
  };

  const handleInvite = () => {
    setMenuOpen(false);
    onInvite();
  };

  return (
    <div className="relative w-full md:w-auto" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-full md:w-auto h-10 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] shrink-0"
      >
        <UserPlus size={16} strokeWidth={2.5} />
        Add Member
        <ChevronDown size={16} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-full md:w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-lg z-40 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={handleAddManually}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors first:rounded-t-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <UserPlus size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm">Add Manually</div>
              <div className="text-[10px] text-[var(--color-ink-muted)] font-normal">
                You provide all details & password
              </div>
            </div>
          </button>
          <div className="border-t border-[var(--color-surface-border)]" />
          <button
            onClick={handleInvite}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors last:rounded-b-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Link2 size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm">Invite User</div>
              <div className="text-[10px] text-[var(--color-ink-muted)] font-normal">
                Send link — they complete their setup
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

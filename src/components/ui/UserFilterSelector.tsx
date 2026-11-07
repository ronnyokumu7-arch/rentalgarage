"use client";

import { useState, useRef, useEffect } from "react";
import { Users, X, } from "@phosphor-icons/react/ssr";
import type { User } from "@/lib/types";

interface UserFilterSelectorProps {
  users: User[];
  selectedUserId: string;
  onChange: (userId: string) => void;
  placeholder?: string;
}

export default function UserFilterSelector({ users, selectedUserId, onChange, placeholder = "Filter by team member" }: UserFilterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedUser = users.find(u => u.id.toString() === selectedUserId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      {/* ✅ OPTION A: Conditional Rendering */}
      {!selectedUser ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={placeholder}
          className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-all ${
            isOpen ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]" : "border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <Users size={14} aria-hidden="true" />
        </button>
      ) : (
        <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 text-[var(--color-ink)] transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
            {getInitials(selectedUser.full_name)}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium whitespace-nowrap">
            <span className="font-semibold">{selectedUser.full_name}</span>
            <span className="text-[var(--color-ink-subtle)]">•</span>
            <span className="text-[var(--color-ink-muted)]">{selectedUser.job_title || selectedUser.role}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="ml-1 p-0.5 rounded-md text-[var(--color-ink-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Clear filter"
          >
            <X size={12} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !selectedUser && (
        <div className="absolute top-full mt-2 right-0 w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-xl)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => { onChange(user.id.toString()); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors text-left"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[10px] font-bold text-[var(--color-primary)] flex-shrink-0">
                  {getInitials(user.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.full_name}</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)] truncate">{user.job_title || user.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

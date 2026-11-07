// src/components/profile/UserNotificationsCard.tsx
"use client";

import { useState } from "react";
import { Bell, Monitor, Moon, Sun, SquaresFour as LayoutGrid, List } from "@phosphor-icons/react/ssr";
import SectionCard from "@/components/ui/SectionCard";
import type { User } from "@/lib/types";
import type { UserUpdatePayload } from "@/lib/api/users";

interface UserNotificationsCardProps {
  user: User;
  onSave?: (data: UserUpdatePayload) => void;
}

export default function UserNotificationsCard({ user, onSave }: UserNotificationsCardProps) {
  const [theme, setTheme] = useState(user.theme_preference || "system");
  const [density, setDensity] = useState(user.density_preference || "comfortable");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave({ 
        theme_preference: theme, 
        density_preference: density 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard className="!p-0 overflow-hidden">
      {/* Unified Header */}
      <div className="flex items-center gap-3 p-6 pb-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 flex items-center justify-center">
          <Bell size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Preferences</h3>
          <p className="text-[11px] text-[var(--color-ink-muted)]">Customize your workspace appearance and layout</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Theme Preference */}
        <div>
          <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-3">
            Interface Theme
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  theme === option.value
                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 text-[var(--color-primary)]"
                    : "bg-[var(--color-surface-hover)]/30 border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <option.icon size={18} aria-hidden="true" />
                <span className="text-xs font-bold">{option.label}</span>
                {theme === option.value && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Density Preference */}
        <div>
          <h4 className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-3">
            Layout Density
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: "compact", label: "Compact", desc: "More data, less padding", icon: List },
              { value: "comfortable", label: "Comfortable", desc: "Balanced spacing", icon: LayoutGrid },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDensity(option.value)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  density === option.value
                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20 text-[var(--color-primary)]"
                    : "bg-[var(--color-surface-hover)]/30 border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <option.icon size={18} aria-hidden="true" />
                <div className="text-left">
                  <span className="text-xs font-bold block">{option.label}</span>
                  <span className="text-[10px] opacity-70">{option.desc}</span>
                </div>
                {density === option.value && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save Action */}
        <div className="flex justify-end pt-4 border-t border-[var(--color-surface-border)]">
          <button
            onClick={handleSave}
            disabled={isSaving || (theme === user.theme_preference && density === user.density_preference)}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

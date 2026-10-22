// src/components/settings/AppearanceSettings.tsx
"use client";

import { useEffect, useState } from "react";
import { Monitor, Sun, Moon, LayoutGrid, AlignJustify, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { userPreferencesApi, type UserPreferences } from "@/lib/api/user-preferences";

export default function AppearanceSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "system",
    density: "comfortable",
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const data = await userPreferencesApi.get();
        setPreferences(data);
        applyTheme(data.theme);
        applyDensity(data.density);
      } catch (error: any) {
        toast.error(error.response?.data?.detail || "Failed to load preferences");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const applyTheme = (theme: "light" | "dark" | "system") => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  };

  const applyDensity = (density: "comfortable" | "compact") => {
    document.documentElement.setAttribute("data-density", density);
    try {
      localStorage.setItem("density", density);
    } catch {}
  };

  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    if (theme === preferences.theme) return;
    setIsSaving(true);
    try {
      await userPreferencesApi.update({ theme });
      setPreferences((prev) => ({ ...prev, theme }));
      applyTheme(theme);
      toast.success("Theme updated");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update theme");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDensityChange = async (density: "comfortable" | "compact") => {
    if (density === preferences.density) return;
    setIsSaving(true);
    try {
      await userPreferencesApi.update({ density });
      setPreferences((prev) => ({ ...prev, density }));
      applyDensity(density);
      toast.success("Density updated");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update density");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">

      {/* ─── THEME ─────────────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--color-surface-border)]">
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Theme</h3>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            Choose how Rental Garage looks across your devices.
          </p>
        </div>

        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(["light", "dark", "system"] as const).map((t) => {
              const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
              const isActive = preferences.theme === t;
              const label = t === "light" ? "Light" : t === "dark" ? "Dark" : "System";
              return (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`relative flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all active:scale-[0.98] ${
                    isActive
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--color-surface-border)] hover:border-[var(--color-surface-border-strong)] hover:bg-[var(--color-surface-hover)]/40"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isActive ? "text-[var(--color-primary-text)]" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── DENSITY ───────────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-[var(--color-surface-border)]">
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Density</h3>
          <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            Control the spacing and size of UI elements.
          </p>
        </div>

        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {(["comfortable", "compact"] as const).map((d) => {
              const isActive = preferences.density === d;
              const Icon = d === "comfortable" ? LayoutGrid : AlignJustify;
              const label = d === "comfortable" ? "Comfortable" : "Compact";
              const desc = d === "comfortable" ? "More space, relaxed" : "Denser, more content";
              return (
                <button
                  key={d}
                  onClick={() => handleDensityChange(d)}
                  className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${
                    isActive
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--color-surface-border)] hover:border-[var(--color-surface-border-strong)] hover:bg-[var(--color-surface-hover)]/40"
                  }`}
                >
                  <div
                    className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p
                      className={`text-xs font-bold truncate ${
                        isActive ? "text-[var(--color-primary-text)]" : "text-[var(--color-ink)]"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] truncate mt-0.5">
                      {desc}
                    </p>
                  </div>
                  {isActive && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Saving indicator ─────────────────────────────────── */}
      {isSaving && (
        <div className="fixed bottom-6 right-4 sm:right-6 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-lg px-3.5 py-2.5 flex items-center gap-2 animate-in slide-in-from-bottom-2 z-50">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-ink)]">Saving…</span>
        </div>
      )}
    </div>
  );
}

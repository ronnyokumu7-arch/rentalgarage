// src/components/layout/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  const Icon = !mounted
    ? Moon
    : theme === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Sun
        : Moon;

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="flex w-9 h-9 rounded-xl items-center justify-center text-ink-muted hover:bg-surface-hover hover:text-ink transition-all duration-200 active:scale-95"
      aria-label={
        theme === "system"
          ? "Theme: System. Click for light."
          : theme === "light"
            ? "Theme: Light. Click for dark."
            : "Theme: Dark. Click for system."
      }
      title={`Theme: ${theme}`}
    >
      <Icon size={17} strokeWidth={1.8} />
    </button>
  );
}

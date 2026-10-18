// src/components/ThemeColorSync.tsx
"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color = resolvedTheme === "dark" ? "#0E0C0A" : "#F7F4F0";
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => {
        (meta as HTMLMetaElement).content = color;
      });
  }, [resolvedTheme]);

  return null;
}

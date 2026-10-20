// src/components/ThemeColorSync.tsx
"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Keeps `<meta name="theme-color">` in sync with the actual rendered theme
 * (not the OS preference). Without this, toggling light/dark in the app leaves
 * the address bar stuck on the OS-matched color until a scroll or focus.
 *
 * The key trick: only ONE theme-color meta tag can exist in the DOM. If we
 * leave `themeColor` in the `viewport` export, Next.js re-emits media-scoped
 * tags on every render, which take precedence over the JS-managed one. So
 * `layout.tsx` no longer declares `themeColor`, and this component is the
 * sole owner of the tag.
 */
export default function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    const color = resolvedTheme === "dark" ? "#0E0C0A" : "#F7F4F0";

    // Remove any stale media-scoped tags (left over from a previous render
    // before this fix was in place, or from any other source injecting them).
    const stale = document.querySelectorAll<HTMLMetaElement>(
      'meta[name="theme-color"][media]'
    );
    stale.forEach((m) => m.remove());

    // Find or create the single authoritative tag.
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    // Update the color and strip any leftover media attribute.
    meta.content = color;
    meta.removeAttribute("media");

    // iOS Safari quirk: the address-bar tint only re-evaluates on a scroll
    // or focus event. A micro-scroll forces it to pick up the new color
    // without a visible jump.
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      const y = window.scrollY;
      window.scrollTo(0, y + 1);
      window.scrollTo(0, y);
    }
  }, [resolvedTheme]);

  return null;
}
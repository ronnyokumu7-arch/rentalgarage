// src/hooks/useMobileHeaderExpanded.ts
"use client";

import { useEffect, useState } from "react";

const EVENT_NAME = "mobile-header:expanded-change";

/** Reads the current state and subscribes to changes. */
export function useMobileHeaderExpanded() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ expanded: boolean }>).detail;
      setExpanded(Boolean(detail?.expanded));
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  return expanded;
}

/** Fires the change event — called by the TopBar. */
export function emitMobileHeaderExpanded(expanded: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { expanded } }),
  );
}

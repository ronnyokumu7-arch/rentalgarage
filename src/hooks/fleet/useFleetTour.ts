// src/hooks/fleet/useFleetTour.ts
"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hasSeenFleetTour";

export function useFleetTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Auto-open once for first-time users
  useEffect(() => {
    setMounted(true);
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setIsOpen(true);
      }
    } catch {
      // localStorage may be unavailable (private mode) — silently skip
    }
  }, []);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback((remember = false) => {
    setIsOpen(false);
    if (remember) {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {}
    }
  }, []);

  return { isOpen, open, close, mounted };
}

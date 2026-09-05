"use client";

import { useEffect, useCallback } from "react";

/**
 * Reusable hook that adds focus + visibility listeners to trigger refetch.
 * Covers: cross-tab changes, browser tab switching, window focus regain.
 * 
 * @param refetch - Function to call when the app regains focus/visibility
 * @param enabled - Whether to enable the listeners (default: true)
 */
export function useLiveRefresh(refetch: () => void | Promise<void>, enabled = true) {
  const handleFocus = useCallback(() => {
    if (enabled) {
      refetch();
    }
  }, [refetch, enabled]);

  const handleVisibilityChange = useCallback(() => {
    if (enabled && document.visibilityState === "visible") {
      refetch();
    }
  }, [refetch, enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleFocus, handleVisibilityChange, enabled]);
}

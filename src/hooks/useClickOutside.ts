import { useEffect, type RefObject } from "react";

type MaybeRef = RefObject<HTMLElement | null>;

/**
 * Calls `handler` when a click/touch lands outside ALL provided refs.
 * Accepts multiple refs so portaled overlays (mobile sheet) count as "inside".
 */
export function useClickOutside(handler: () => void, refs: MaybeRef[]) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const insideAny = refs.some((r) => r.current?.contains(target));
      if (insideAny) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler, refs]);
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface OverlayPortalProps {
  children: ReactNode;
  onClose?: () => void;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
  inertBackground?: boolean;
  blurClassName?: string;
}

interface ActiveLayer {
  element: HTMLElement;
  inertBackground: boolean;
}

const activeLayers: ActiveLayer[] = [];
const previousInertState = new Map<HTMLElement, boolean>();
let previousBodyOverflow: string | null = null;
let scrollLockCount = 0;

function syncInertBackground() {
  const topLayer = activeLayers.at(-1) ?? null;

  for (const child of Array.from(document.body.children)) {
    const element = child as HTMLElement;
    if (!previousInertState.has(element)) {
      previousInertState.set(element, element.inert);
    }
    element.inert = topLayer?.inertBackground
      ? element !== topLayer.element
      : previousInertState.get(element)!;
  }

  if (activeLayers.length === 0) {
    for (const [element, wasInert] of previousInertState) {
      element.inert = wasInert;
    }
    previousInertState.clear();
  }
}

export default function OverlayPortal({
  children,
  onClose,
  closeOnEscape = true,
  lockScroll = true,
  inertBackground = true,
  blurClassName = "backdrop-blur-sm",
}: OverlayPortalProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    activeLayers.push({ element: layer, inertBackground });
    syncInertBackground();

    if (lockScroll) {
      if (scrollLockCount === 0) {
        previousBodyOverflow = document.body.style.overflow;
      }
      scrollLockCount += 1;
      document.body.style.overflow = "hidden";
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        closeOnEscape &&
        activeLayers.at(-1)?.element === layer
      ) {
        onCloseRef.current?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const index = activeLayers.findIndex((entry) => entry.element === layer);
      if (index >= 0) activeLayers.splice(index, 1);
      syncInertBackground();

      if (lockScroll) {
        scrollLockCount -= 1;
        if (scrollLockCount === 0) {
          document.body.style.overflow = previousBodyOverflow ?? "";
          previousBodyOverflow = null;
        }
      }
    };
  }, [closeOnEscape, inertBackground, lockScroll]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={layerRef}
      className="fixed inset-0 z-[10000]"
      data-overlay-layer
    >
      <div
        className={`absolute inset-0 bg-black/10 pointer-events-auto ${blurClassName}`}
        aria-hidden="true"
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>,
    document.body,
  );
}

"use client";

import type { CSSProperties } from "react";

interface OverlayBackdropProps {
  onDismiss: () => void;
  zIndexClassName?: string;
  className?: string;
  style?: CSSProperties;
  hiddenFromAssistiveTech?: boolean;
}

export default function OverlayBackdrop({
  onDismiss,
  zIndexClassName = "z-40",
  className = "bg-black/10 backdrop-blur-sm",
  style,
  hiddenFromAssistiveTech = false,
}: OverlayBackdropProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label="Dismiss open menu"
      aria-hidden={hiddenFromAssistiveTech}
      onClick={onDismiss}
      style={style}
      className={`fixed inset-0 ${zIndexClassName} border-0 p-0 ${className}`}
    />
  );
}

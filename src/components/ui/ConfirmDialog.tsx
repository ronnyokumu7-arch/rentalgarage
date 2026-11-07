"use client";

import React from "react";
import { Warning as AlertTriangle, Info, Question as HelpCircle } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import Modal from "./Modal";

type ConfirmVariant = "danger" | "warning" | "info" | "neutral" | "success";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: ConfirmVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  icon?: Icon;
}

const variantConfig: Record<
  ConfirmVariant,
  { icon: Icon; iconBg: string; iconColor: string; confirmClass: string }
> = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-danger-bg",
    iconColor: "text-danger",
    confirmClass: "btn btn-danger",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-warning-bg",
    iconColor: "text-warning",
    confirmClass: "btn btn-primary",
  },
  info: {
    icon: Info,
    iconBg: "bg-accent-bg",
    iconColor: "text-accent-dark",
    confirmClass: "btn btn-primary",
  },
  neutral: {
    icon: HelpCircle,
    iconBg: "bg-surface-hover",
    iconColor: "text-ink-muted",
    confirmClass: "btn btn-primary",
  },
  success: {
    icon: Info,
    iconBg: "bg-success-bg",
    iconColor: "text-success",
    confirmClass: "btn btn-success",
  }
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = "danger",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  icon: CustomIcon,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
    >
      <div className="flex flex-col items-center text-center py-2">
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${config.iconBg}`}
        >
          <Icon size={28} weight="light" className={config.iconColor} aria-hidden="true" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-ink-muted leading-relaxed max-w-sm">
          {message}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-6">
        <button
          onClick={onClose}
          disabled={loading}
          className="btn btn-ghost"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={config.confirmClass}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Processing...
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </Modal>
  );
}
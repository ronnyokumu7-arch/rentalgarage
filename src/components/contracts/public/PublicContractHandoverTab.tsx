"use client";

import { useState, useRef } from "react";
import {
  CheckCircle as CheckCircle2,
  CircleNotch as Loader2,
  ClipboardText,
  Eraser,
} from "@phosphor-icons/react/ssr";
import { brand } from "@/lib/brand";
import SignaturePad, { SignaturePadRef } from "@/components/public-docs/SignaturePad";
import toast from "react-hot-toast";

interface HandoverItem {
  name: string;
  checked: boolean;
}

interface PublicContractHandoverTabProps {
  handoverItems: string[];
  initialChecklist?: Record<string, boolean> | null;
  isHandoverSigned: boolean;
  onSubmitHandover: (checklist: Record<string, boolean>, signature: string) => Promise<boolean>;
}

export default function PublicContractHandoverTab({
  handoverItems,
  initialChecklist,
  isHandoverSigned,
  onSubmitHandover,
}: PublicContractHandoverTabProps) {
  const signatureRef = useRef<SignaturePadRef>(null);
  const [checklist, setChecklist] = useState<HandoverItem[]>(() =>
    handoverItems.map((name) => ({
      name,
      checked: initialChecklist?.[name] ?? false,
    }))
  );
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const showSuccess = isHandoverSigned || done;

  const handleToggle = (name: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.name === name ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleClear = () => signatureRef.current?.clear();

  const handleSubmit = async () => {
    if (!confirmed) {
      toast.error("Please confirm the vehicle matches the checklist.");
      return;
    }

    const signature = signatureRef.current?.getSignature();
    if (!signature) {
      toast.error("Please draw your signature in the box above.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = checklist.reduce(
        (acc, item) => ({ ...acc, [item.name]: item.checked }),
        {} as Record<string, boolean>
      );
      const success = await onSubmitHandover(payload, signature);
      if (success) setDone(true);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success / locked state ──────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div
        // ✅ FIXED: Removed negative margins. Applied consistent padding. Added a top border.
        className="w-full px-6 py-8 sm:px-8 border-t space-y-6"
        style={{ backgroundColor: brand.colors.success.bg, borderColor: brand.colors.success.border }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: brand.colors.light.surface }}
          >
            <CheckCircle2 className="h-5 w-5" style={{ color: brand.colors.success.main }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: brand.colors.success.text }}>
              Handover Checklist Signed
            </h3>
            <p className="text-xs" style={{ color: brand.colors.success.text }}>
              You've confirmed the vehicle's condition and available equipment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
          {checklist.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <CheckCircle2
                size={14}
                style={{ color: item.checked ? brand.colors.success.main : brand.colors.ink.faint }}
                aria-hidden="true"
              />
              <span
                className="text-xs"
                style={{
                  color: item.checked ? brand.colors.ink.primary : brand.colors.ink.muted,
                  textDecoration: item.checked ? "none" : "line-through",
                }}
              >
                {item.name}
              </span>
              {!item.checked && (
                <span className="text-[10px] font-semibold ml-auto" style={{ color: brand.colors.ink.faint }}>
                  Absent
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Active state ────────────────────────────────────────────────────────
  return (
    <div
      // ✅ FIXED: Removed negative margins. Applied consistent padding. Added a top border.
      className="w-full px-6 py-8 sm:px-8 space-y-6 border-t"
      style={{ borderColor: brand.colors.light.surfaceBorder, backgroundColor: brand.colors.light.surface }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: brand.colors.info.bg }}
        >
          <ClipboardText size={20} style={{ color: brand.colors.info.main }} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: brand.colors.ink.primary }}>
            Vehicle Handover Checklist
          </h3>
          <p className="text-xs" style={{ color: brand.colors.ink.muted }}>
            Tick each item present in the vehicle. Items left unchecked are recorded as absent.
          </p>
        </div>
      </div>

      {/* 2-column grid for active checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
        {checklist.map((item) => (
          <label
            key={item.name}
            className="flex items-center gap-3 py-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleToggle(item.name)}
              className="w-4 h-4 rounded focus:ring-2 cursor-pointer shrink-0"
              style={{ accentColor: brand.colors.info.main }}
            />
            <span 
              className="text-sm font-medium transition-colors group-hover:opacity-80" 
              style={{ color: brand.colors.ink.primary }}
            >
              {item.name}
            </span>
          </label>
        ))}
      </div>

      {/* Signature Pad */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold" style={{ color: brand.colors.ink.primary }}>
            Handover Signature
          </h4>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-colors active:scale-95"
            style={{ color: brand.colors.ink.muted }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = brand.colors.danger.main;
              e.currentTarget.style.backgroundColor = brand.colors.danger.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = brand.colors.ink.muted;
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="Clear signature and start over"
          >
            <Eraser size={12} aria-hidden="true" />
            Clear Signature
          </button>
        </div>
        <div
          className="border-2 border-dashed rounded-xl overflow-hidden relative group"
          style={{
            borderColor: brand.colors.light.surfaceBorderStrong,
            backgroundColor: brand.colors.light.surface,
          }}
        >
          <SignaturePad ref={signatureRef} />
        </div>
      </div>

      {/* Confirmation checkbox */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl border"
        style={{ backgroundColor: brand.colors.info.bg, borderColor: brand.colors.info.border }}
      >
        <input
          type="checkbox"
          id="handover-confirm"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded focus:ring-2 cursor-pointer shrink-0"
          style={{ accentColor: brand.colors.info.main }}
        />
        <label
          htmlFor="handover-confirm"
          className="text-xs leading-relaxed cursor-pointer select-none"
          style={{ color: brand.colors.info.text }}
        >
          <span className="font-semibold">
            I confirm I have inspected the vehicle and the checklist above accurately reflects the equipment present and its condition at handover.
          </span>
        </label>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!confirmed || submitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-[0.98] active:shadow-inner"
        style={{
          backgroundColor: confirmed && !submitting ? brand.colors.info.main : brand.colors.light.surfaceActive,
          color: confirmed && !submitting ? "#FFFFFF" : brand.colors.ink.faint,
          boxShadow: confirmed && !submitting ? `0 4px 12px ${brand.colors.info.border}` : "none",
          cursor: confirmed && !submitting ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Processing...
          </>
        ) : (
          <>
            <CheckCircle2 size={16} aria-hidden="true" /> Confirm Handover
          </>
        )}
      </button>

      <p className="text-xs text-center" style={{ color: brand.colors.ink.faint }}>
        Your signature is legally binding. A timestamped copy will be generated and available for download.
      </p>
    </div>
  );
}

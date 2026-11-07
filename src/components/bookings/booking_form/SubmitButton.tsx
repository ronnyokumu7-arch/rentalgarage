"use client";

import { CircleNotch as Loader2, CheckCircle } from "@phosphor-icons/react/ssr";

interface SubmitButtonProps {
  loading: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel?: string;
}

export default function SubmitButton({ 
  loading, 
  disabled = false, 
  label, 
  loadingLabel = "Creating..." 
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          {loadingLabel}
        </>
      ) : (
        <>
          <CheckCircle size={16} aria-hidden="true" />
          {label}
        </>
      )}
    </button>
  );
}

// src/components/client/form/SubmitCard.tsx
"use client";

import { CheckCircle, Loader2, Info } from "lucide-react";

interface SubmitCardProps {
  loading: boolean;
  mode: "create" | "edit" | "public_intake";
}

export default function SubmitCard({ loading, mode }: SubmitCardProps) {
  const isPublicIntake = mode === "public_intake";

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5">
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] active:shadow-inner"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {mode === "edit"
              ? "Updating..."
              : mode === "public_intake"
                ? "Submitting..."
                : "Creating..."}
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            {mode === "edit"
              ? "Update Client"
              : mode === "public_intake"
                ? "Submit for Review"
                : "Add Client"}
          </>
        )}
      </button>

      <p className="text-[10px] text-center text-[var(--color-ink-muted)] mt-3 leading-relaxed">
        {mode === "edit"
          ? "Changes will be saved instantly"
          : mode === "public_intake"
            ? "Your details will be reviewed by the agency before activation"
            : "Client will be created and ready for bookings"}
      </p>

      {isPublicIntake && (
        <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-2.5">
          <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-700 leading-relaxed">
            After submission, your profile will be in{" "}
            <span className="font-bold">pending review</span> status. The agency
            will verify your details and activate your account before you can
            book.
          </p>
        </div>
      )}
    </div>
  );
}

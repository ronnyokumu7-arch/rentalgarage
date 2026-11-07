// src/app/verify/page.tsx
"use client";

export const dynamic = 'force-dynamic';         //added for emergencyy deploy

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, WarningCircle as AlertCircle, CircleNotch as Loader2, ArrowRight } from "@phosphor-icons/react/ssr";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const channel = searchParams.get("channel") as "email" | "phone" | null;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const verify = async () => {
      if (!token || !channel) {
        setStatus("error");
        setErrorMessage("Invalid verification link. Missing token or channel.");
        return;
      }

      try {
        await usersApi.verifyToken({ token, channel });
        setStatus("success");
        toast.success(`Your ${channel} has been successfully verified!`);
      } catch (error: any) {
        setStatus("error");
        const detail = error.response?.data?.detail;
        setErrorMessage(
          typeof detail === "string" 
            ? detail 
            : "Failed to verify account. The link may be expired or invalid."
        );
        toast.error("Verification failed");
      }
    };

    verify();
  }, [token, channel]);

  // 1. Loading State
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Verifying Your Account</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Please wait while we securely verify your {channel === "email" ? "email address" : "phone number"}...
          </p>
        </div>
      </div>
    );
  }

  // 2. Success State
  if (status === "success") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-[var(--color-success-text)]" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Verification Successful!</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-8">
            Your {channel === "email" ? "email address" : "phone number"} has been successfully verified. Your account is now fully active.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-[0.98]"
          >
            Proceed to Login <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Error State
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} className="text-[var(--color-danger-text)]" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Verification Failed</h2>
        <p className="text-sm text-[var(--color-ink-muted)] mb-8">
          {errorMessage}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/login")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-[0.98]"
          >
            Go to Login
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

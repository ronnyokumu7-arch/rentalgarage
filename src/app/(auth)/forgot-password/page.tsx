// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import apiClient from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {!submitted ? (
        <>
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-ink tracking-tight">
              Reset your password
            </h1>
            <p className="text-ink-muted text-sm">
              Enter your email and we'll send you a secure reset link.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-danger/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-danger">!</span>
              </div>
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Email address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-surface border border-surface-border text-ink placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint group-focus-within:text-primary transition-colors" size={17} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to login
          </Link>
        </>
      ) : (
        /* Success State */
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-success/10">
            <CheckCircle2 size={30} className="text-success" strokeWidth={1.8} />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2 tracking-tight">
            Check your inbox
          </h2>
          <p className="text-ink-muted text-sm mb-2">
            If <span className="font-semibold text-ink">{email}</span> is registered, you'll receive a link shortly.
          </p>
          <p className="text-ink-subtle text-xs mb-8">
            The link expires in 15 minutes. Check your spam folder if you don't see it.
          </p>
          <Link href="/login" className="btn-primary inline-flex h-10 px-6 rounded-xl items-center justify-center text-sm font-semibold">
            Back to login
          </Link>
        </div>
      )}
    </div>
  );
}

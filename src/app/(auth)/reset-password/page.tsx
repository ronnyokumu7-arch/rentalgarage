// src/app/(auth)/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";
import apiClient from "@/lib/api-client";

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const strengthColors = ["#e2e6f0", "#ef4444", "#f59e0b", "#10b981", "#059669"];
const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(password);
  const isMatch = confirm.length > 0 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || strength < 3) return;
    
    setError("");
    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-danger/10">
          <Lock size={30} className="text-danger" strokeWidth={1.8} />
        </div>
        <h2 className="text-2xl font-bold text-ink mb-2 tracking-tight">
          Invalid Reset Link
        </h2>
        <p className="text-ink-muted text-sm mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/login" className="btn-primary inline-flex h-10 px-6 rounded-xl items-center justify-center text-sm font-semibold">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!success ? (
        <>
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-ink tracking-tight">
              Create new password
            </h1>
            <p className="text-ink-muted text-sm">
              Your new password must be different from previously used passwords.
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
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                New Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-surface border border-surface-border text-ink placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint group-focus-within:text-primary transition-colors" size={17} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1.5 mb-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="h-1.5 flex-1 rounded-full transition-colors" 
                        style={{ 
                          background: i <= strength ? strengthColors[strength] : 'var(--color-surface-border)'
                        }} 
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`
                    w-full h-11 pl-10 pr-3 rounded-xl bg-surface border text-ink placeholder:text-ink-faint focus:outline-none transition-all text-sm
                    ${confirm.length > 0 && !isMatch 
                      ? 'border-danger focus:ring-2 focus:ring-danger/20' 
                      : confirm.length > 0 && isMatch
                        ? 'border-success focus:ring-2 focus:ring-success/20'
                        : 'border-surface-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }
                  `}
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" size={17} />
              </div>
              {confirm.length > 0 && !isMatch && (
                <p className="text-xs text-danger mt-1.5">Passwords do not match.</p>
              )}
              {confirm.length > 0 && isMatch && (
                <p className="text-xs text-success mt-1.5">✓ Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isMatch || strength < 3}
              className="btn-primary w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </>
      ) : (
        /* Success State */
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-success/10">
            <CheckCircle2 size={30} className="text-success" strokeWidth={1.8} />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2 tracking-tight">
            Password Updated
          </h2>
          <p className="text-ink-muted text-sm mb-8">
            Your password has been successfully reset. You can now sign in with your new credentials.
          </p>
          <Link href="/login" className="btn-primary inline-flex h-10 px-6 rounded-xl items-center justify-center text-sm font-semibold">
            Sign in now
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg"><span className="text-ink-muted">Loading...</span></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

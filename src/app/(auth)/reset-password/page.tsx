// src/app/(auth)/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, Lock } from "lucide-react";
import apiClient from "@/lib/api-client";
import "@/app/login.css";

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
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: 'rgba(185, 28, 28, 0.10)' }}
        >
          <Lock size={30} style={{ color: '#B91C1C' }} strokeWidth={1.8} />
        </div>
        <h2 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: '#1C1917' }}>
          Invalid Reset Link
        </h2>
        <p className="text-sm mb-8" style={{ color: '#57534E' }}>
          This password reset link is invalid or has expired.
        </p>
        <Link 
          href="/login" 
          className="inline-flex h-10 px-6 rounded-xl items-center justify-center text-sm font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.30)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.40)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.30)';
          }}
        >
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
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1C1917' }}>
              Create new password
            </h1>
            <p className="text-sm" style={{ color: '#57534E' }}>
              Your new password must be different from previously used passwords.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div 
              className="p-3 rounded-xl text-sm flex items-start gap-2.5"
              style={{
                backgroundColor: 'rgba(185, 28, 28, 0.10)',
                border: '1px solid rgba(185, 28, 28, 0.20)',
                color: '#B91C1C',
              }}
            >
              <div 
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: 'rgba(185, 28, 28, 0.20)' }}
              >
                <span className="text-[10px] font-bold" style={{ color: '#B91C1C' }}>!</span>
              </div>
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div>
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: '#57534E' }}
              >
                New Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-11 pl-10 pr-10 rounded-xl border outline-none transition-all text-sm"
                  style={{
                    backgroundColor: '#F7F4F0',
                    borderColor: '#E8E4DE',
                    color: '#1C1917',
                  }}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7C3AED';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.20)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E8E4DE';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <Lock 
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" 
                  size={17}
                  style={{ color: '#A8A39E' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors focus:outline-none"
                  style={{ color: '#A8A39E' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#57534E'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#A8A39E'}
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
                          background: i <= strength ? strengthColors[strength] : '#E8E4DE'
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
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: '#57534E' }}
              >
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full h-11 pl-10 pr-3 rounded-xl border outline-none transition-all text-sm"
                  style={{
                    backgroundColor: '#F7F4F0',
                    color: '#1C1917',
                    borderColor: confirm.length > 0 && !isMatch 
                      ? '#B91C1C' 
                      : confirm.length > 0 && isMatch
                        ? '#047857'
                        : '#E8E4DE',
                  }}
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  onFocus={(e) => {
                    if (confirm.length === 0 || isMatch) {
                      e.currentTarget.style.borderColor = '#7C3AED';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.20)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <Lock 
                  className="absolute left-3.5 top-1/2 -translate-y-1/2" 
                  size={17}
                  style={{ color: '#A8A39E' }}
                />
              </div>
              {confirm.length > 0 && !isMatch && (
                <p className="text-xs mt-1.5" style={{ color: '#B91C1C' }}>Passwords do not match.</p>
              )}
              {confirm.length > 0 && isMatch && (
                <p className="text-xs mt-1.5" style={{ color: '#047857' }}>✓ Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isMatch || strength < 3}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.30)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading && isMatch && strength >= 3) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.40)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.30)';
              }}
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
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: 'rgba(4, 120, 87, 0.10)' }}
          >
            <CheckCircle2 size={30} style={{ color: '#047857' }} strokeWidth={1.8} />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: '#1C1917' }}>
            Password Updated
          </h2>
          <p className="text-sm mb-8" style={{ color: '#57534E' }}>
            Your password has been successfully reset. You can now sign in with your new credentials.
          </p>
          <Link 
            href="/login" 
            className="inline-flex h-10 px-6 rounded-xl items-center justify-center text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.30)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.40)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.30)';
            }}
          >
            Sign in now
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
          <span style={{ color: '#57534E' }}>Loading...</span>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

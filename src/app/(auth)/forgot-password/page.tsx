// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import "@/app/login.css";

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
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1C1917' }}>
              Reset your password
            </h1>
            <p className="text-sm" style={{ color: '#57534E' }}>
              Enter your email and we'll send you a secure reset link.
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
            <div>
              <label 
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: '#57534E' }}
              >
                Email address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border outline-none transition-all text-sm"
                  style={{
                    backgroundColor: '#F7F4F0',
                    borderColor: '#E8E4DE',
                    color: '#1C1917',
                  }}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
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
                <Mail 
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" 
                  size={17}
                  style={{ color: '#A8A39E' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.30)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
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
            className="inline-flex items-center gap-2 text-sm transition-colors group"
            style={{ color: '#57534E' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1C1917'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#57534E'}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to login
          </Link>
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
            Check your inbox
          </h2>
          <p className="text-sm mb-2" style={{ color: '#57534E' }}>
            If <span className="font-semibold" style={{ color: '#1C1917' }}>{email}</span> is registered, you'll receive a link shortly.
          </p>
          <p className="text-xs mb-8" style={{ color: '#78716C' }}>
            The link expires in 15 minutes. Check your spam folder if you don't see it.
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
      )}
    </div>
  );
}

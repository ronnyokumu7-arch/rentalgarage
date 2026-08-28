// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import axios from "axios";

type ErrorType = "invalid_credentials" | "suspended" | "inactive" | "unknown";

function getErrorType(error: unknown): ErrorType {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || "";
    if (status === 401) return "invalid_credentials";
    if (status === 403 && detail.toLowerCase().includes("suspended")) return "suspended";
    if (status === 403) return "inactive";
  }
  return "unknown";
}

const ERROR_MESSAGES: Record<ErrorType, string> = {
  invalid_credentials: "Invalid email or password. Please try again.",
  suspended: "Your account has been suspended. Contact support.",
  inactive: "Your account is inactive. Contact support.",
  unknown: "Something went wrong. Please try again.",
};

export default function LoginPage() {
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorType | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorType(err));
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="space-y-1.5">
        <h1 className="text-2xl font-bold text-ink tracking-tight font-display">
          Welcome back
        </h1>
        <p className="text-sm text-ink-muted">
          Sign in to manage your fleet operations
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div 
          variants={fadeInUp}
          className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm flex items-start gap-2.5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-4 h-4 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[10px] font-bold text-[#991B1B]">!</span>
          </div>
          <p className="text-xs font-medium">{ERROR_MESSAGES[error]}</p>
        </motion.div>
      )}

      {/* Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-5"
        variants={staggerChildren}
      >
        {/* Email */}
        <motion.div variants={fadeInUp}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
            Email Address
          </label>
          <div className="relative group">
            <input
              type="email"
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F7F4F0] border border-[#E8E4DE] text-ink placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint group-focus-within:text-primary transition-colors" size={17} />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Password
            </label>
            <Link 
              href="/forgot-password" 
              className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#F7F4F0] border border-[#E8E4DE] text-ink placeholder:text-ink-faint focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
        </motion.div>

        {/* Remember Me */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <div 
                className={`
                  w-4 h-4 rounded border transition-all duration-200
                  ${rememberMe 
                    ? 'bg-primary border-primary' 
                    : 'border-[#E8E4DE] bg-white group-hover:border-primary/50'
                  }
                `}
              >
                {rememberMe && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">
              Remember me
            </span>
          </label>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={fadeInUp} className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </motion.div>
      </motion.form>

      {/* Footer */}
      <motion.div variants={fadeInUp} className="pt-1">
        <p className="text-center text-sm text-ink-muted">
          Don't have an account?{' '}
          <Link 
            href="/register" 
            className="font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-0.5 group"
          >
            Get started
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

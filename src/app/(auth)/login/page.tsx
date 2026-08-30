// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import "@/app/login.css";

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

  // ✅ NO self-painted background column anymore — the auth shell owns the
  // white pane. This page renders ONLY the card, so it spreads correctly
  // on desktop and stays perfect on mobile.
  return (
    <motion.div 
      className="w-full rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6 bg-white/90 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800/50 shadow-2xl shadow-purple-500/10"
      initial="initial"
      animate="animate"
      variants={staggerChildren}
      style={{ 
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)',
      }}
    >
      {/* ✅ Mobile Header */}
      <motion.div variants={fadeInUp} className="flex flex-col items-center text-center space-y-4 lg:hidden">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Zap size={22} className="text-white" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight font-display text-gray-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign in to manage your fleet operations
          </p>
        </div>
      </motion.div>

      {/* ✅ Desktop Header */}
      <motion.div variants={fadeInUp} className="hidden lg:block space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight font-display text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your credentials to access the dashboard
        </p>
      </motion.div>

      {/* ✅ Error Message */}
      {error && (
        <motion.div 
          variants={fadeInUp}
          className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/30 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-300">!</span>
          </div>
          <p className="text-xs font-medium leading-relaxed">{ERROR_MESSAGES[error]}</p>
        </motion.div>
      )}

      {/* ✅ Form */}
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-5"
        variants={staggerChildren}
      >
        {/* Email */}
        <motion.div variants={fadeInUp}>
          <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2 text-gray-600 dark:text-gray-400">
            Email Address
          </label>
          <div className="relative group">
            <input
              type="email"
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm text-gray-900 dark:text-white"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Password
            </label>
            <Link 
              href="/forgot-password" 
              className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full h-12 pl-11 pr-11 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all text-sm text-gray-900 dark:text-white"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </motion.div>

        {/* Remember Me */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <div 
                className={`
                  w-5 h-5 rounded-md border-2 transition-all duration-200
                  ${rememberMe 
                    ? 'bg-purple-600 border-purple-600' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-purple-500/50'
                  }
                `}
              >
                {rememberMe && (
                  <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="none">
                    <path d="M5 10L8.5 13.5L15 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Remember me
            </span>
          </label>
        </motion.div>

        {/* Submit Button */}
        <motion.div variants={fadeInUp} className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-white relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.30)',
            }}
          >
            {/* ✅ Shine Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
            </div>
            
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </motion.div>
      </motion.form>

      {/* Footer */}
      <motion.div variants={fadeInUp} className="pt-2">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link 
            href="/register" 
            className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors inline-flex items-center gap-0.5 group"
          >
            Get started
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}

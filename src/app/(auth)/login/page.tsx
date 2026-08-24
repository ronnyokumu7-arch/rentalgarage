// src/app/(auth)/login/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Eye, EyeOff, LogIn, ArrowRight, ArrowLeft, 
  ShieldCheck, Mail, Car, Calendar, TrendingUp, 
  ChevronLeft, ChevronRight, Sparkles, Lock, Globe
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import axios from "axios";

// ── Types & Helpers ─────────────────────────────────────────────────────────
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
  invalid_credentials: "Incorrect email or password. Please try again.",
  suspended: "Your account has been suspended. Contact your administrator.",
  inactive: "Your account is inactive. Contact your administrator.",
  unknown: "Something went wrong. Please try again.",
};

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Car,
    title: "Intelligent Fleet Management",
    shortTitle: "Intelligent Fleet",
    description: "Real-time tracking, maintenance alerts, and utilization analytics",
    gradient: "from-blue-500 to-indigo-500",
    stat: "94%",
    statLabel: "Utilization",
    color: "text-blue-400"
  },
  {
    icon: Calendar,
    title: "Smart Booking Engine",
    shortTitle: "Smart Booking",
    description: "Digital contracts, driver verification, and instant scheduling",
    gradient: "from-emerald-500 to-teal-500",
    stat: "2.5x",
    statLabel: "Faster",
    color: "text-emerald-400"
  },
  {
    icon: TrendingUp,
    title: "Revenue Intelligence",
    shortTitle: "Revenue Intelligence",
    description: "Live financial dashboards and predictive revenue insights",
    gradient: "from-purple-500 to-violet-500",
    stat: "$2.4M",
    statLabel: "Processed",
    color: "text-purple-400"
  }
];

// ── Stats ────────────────────────────────────────────────────────────────────
const MOBILE_STATS = [
  { value: "15k+", label: "Vehicles" },
  { value: "3,200+", label: "Clients" },
  { value: "4.9★", label: "Rating" }
];

export default function LoginPage() {
  const { login } = useAuth();
  
  // Carousel State
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Login State
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);

  // ── Carousel Controls ──────────────────────────────────────────────────────
  const nextSlide = useCallback(() => {
    setSlideIndex((prev) => (prev + 1) % FEATURES.length);
  }, []);

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + FEATURES.length) % FEATURES.length);
    setIsAutoPlaying(false);
    setIsPaused(true);
  };

  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isPaused, nextSlide]);

  // ── Form Handlers ─────────────────────────────────────────────────────────
  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorType(null);
    setStep(2);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorType(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (_err) {
      setErrorType(getErrorType(_err));
    } finally {
      setLoading(false);
    }
  };

  const currentFeature = FEATURES[slideIndex];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] selection:bg-blue-500 selection:text-white">
      
      {/* ── DESKTOP VIEW ────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex min-h-screen">
        
        {/* Left Panel - Brand Experience */}
        <div 
          className="w-[55%] flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => { setIsPaused(false); setIsAutoPlaying(true); }}
        >
          {/* Ambient Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[150px] transition-all duration-1000"
              style={{ background: `radial-gradient(circle, ${currentFeature.gradient.split(' ')[1] || '#6366f1'}20, transparent 70%)` }}
            />
            <div 
              className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[150px] transition-all duration-1000"
              style={{ background: `radial-gradient(circle, ${currentFeature.gradient.split(' ')[3] || '#8b5cf6'}20, transparent 70%)` }}
            />
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30 border border-white/10">
                RG
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Rental<span className="text-blue-400">Garage</span></span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md">
              <Sparkles size={12} className="text-blue-400" /> Enterprise
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-8 max-w-2xl mx-auto w-full">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-12">
              <div className="text-center"><p className="text-2xl font-bold text-white">15k+</p><p className="text-xs text-slate-400 font-medium">Vehicles</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-white">3,200+</p><p className="text-xs text-slate-400 font-medium">Clients</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-white">98.7%</p><p className="text-xs text-slate-400 font-medium">Uptime</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-white">4.9★</p><p className="text-xs text-slate-400 font-medium">Rating</p></div>
            </div>

            {/* Feature Card */}
            <div className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${currentFeature.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8 overflow-hidden">
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentFeature.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <currentFeature.icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1">{currentFeature.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{currentFeature.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-2xl font-bold ${currentFeature.color}`}>{currentFeature.stat}</p>
                    <p className="text-xs text-slate-400 font-medium">{currentFeature.statLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-2">
                {FEATURES.map((_, index) => (
                  <button key={index} onClick={() => { setSlideIndex(index); setIsPaused(true); }}
                    className={`h-1.5 rounded-full transition-all duration-500 ${index === slideIndex ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"}`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevSlide} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => { nextSlide(); setIsPaused(false); }} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-6 text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-blue-400" /> 256-bit SSL</span>
              <span className="flex items-center gap-1.5"><Lock size={13} className="text-emerald-400" /> SOC 2</span>
              <span className="flex items-center gap-1.5"><Globe size={13} className="text-purple-400" /> Global</span>
            </div>
            <span className="text-slate-500">© 2024 Rental Garage</span>
          </div>
        </div>

        {/* Right Panel - Authentication */}
        <div className="w-[45%] flex items-center justify-center p-14 bg-[var(--color-surface)]">
          <div className="w-full max-w-sm">
            {step === 1 ? (
              <div className="space-y-6">
                <div><h1 className="text-2xl font-bold text-ink tracking-tight">Welcome back</h1><p className="text-sm text-ink-muted mt-1">Sign in to manage your fleet operations</p></div>
                <form onSubmit={handleEmailNext} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">Email</label>
                    <div className="relative group">
                      <input type="email" className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface border border-surface-border text-ink focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm placeholder:text-ink-subtle" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle group-focus-within:text-blue-500 transition-colors" />
                    </div>
                  </div>
                  <button type="submit" disabled={!email} className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none">
                    Continue <ArrowRight size={16} />
                  </button>
                </form>
                <p className="text-center text-xs text-ink-muted">Trusted by 3,200+ rental agencies worldwide</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <button onClick={() => { setStep(1); setErrorType(null); }} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink transition-colors mb-3 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back
                  </button>
                  <h1 className="text-2xl font-bold text-ink tracking-tight">Enter password</h1>
                  <p className="text-sm text-ink-muted mt-1 truncate">For <span className="font-semibold text-ink">{email}</span></p>
                </div>
                {errorType && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">!</div>
                    <div><p className="font-semibold text-xs">Error</p><p className="text-xs text-rose-500/90 mt-0.5">{ERROR_MESSAGES[errorType]}</p></div>
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Password</label>
                      <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative group">
                      <input type={showPw ? "text" : "password"} className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface border border-surface-border text-ink focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm placeholder:text-ink-subtle" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle group-focus-within:text-blue-500 transition-colors" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors focus:outline-none">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading || !password} className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none">
                    {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span> : <span className="flex items-center gap-2">Sign In <LogIn size={16} /></span>}
                  </button>
                </form>
              </div>
            )}
            <div className="pt-5 mt-5 border-t border-surface-border text-center">
              <div className="flex items-center justify-center gap-4 text-xs text-ink-muted">
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-blue-400" /> 256-bit</span>
                <span className="flex items-center gap-1"><Lock size={12} className="text-emerald-400" /> SOC 2</span>
                <a href="mailto:support@rentalgarage.co.ke" className="font-semibold text-blue-600 hover:underline">Support</a>
              </div>
              <p className="text-xs text-ink-muted mt-2">© 2024 Rental Garage</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE VIEW ────────────────────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col min-h-screen">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-5 pt-6 pb-6 overflow-hidden flex-shrink-0">
          {/* Ambient glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[100px] opacity-30"
            style={{ background: `radial-gradient(circle, ${currentFeature.gradient.split(' ')[1] || '#6366f1'}40, transparent 70%)` }} />

          {/* Brand */}
          <div className="relative z-10 flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/30">
                RG
              </div>
              <span className="text-white font-bold text-base tracking-tight">Rental<span className="text-blue-400">Garage</span></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-slate-300">
              <Sparkles size={10} className="text-blue-400" /> Enterprise
            </div>
          </div>

          {/* Feature Pills */}
          <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
            {FEATURES.map((feature, index) => (
              <button
                key={index}
                onClick={() => { setSlideIndex(index); setIsPaused(true); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-medium border transition-all ${
                  slideIndex === index 
                    ? `bg-gradient-to-r ${feature.gradient} text-white border-transparent shadow-lg shadow-blue-500/20` 
                    : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                {feature.shortTitle}
              </button>
            ))}
          </div>

          {/* Feature Card */}
          <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentFeature.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <currentFeature.icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white">{currentFeature.title}</h3>
                <p className="text-[11px] text-slate-300 leading-tight">{currentFeature.shortTitle}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-base font-bold ${currentFeature.color}`}>{currentFeature.stat}</p>
                <p className="text-[8px] text-slate-400 font-medium">{currentFeature.statLabel}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
            {MOBILE_STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-base font-bold text-white">{stat.value}</p>
                <p className="text-[9px] text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Authentication Panel */}
        <div className="flex-1 flex items-center justify-center px-5 py-6 bg-[var(--color-surface)] overflow-y-auto">
          <div className="w-full max-w-sm">
            
            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl font-bold text-ink tracking-tight">Welcome back</h1>
                  <p className="text-sm text-ink-muted mt-0.5">Sign in to manage your fleet</p>
                </div>

                <form onSubmit={handleEmailNext} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                      Email
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface border border-surface-border text-ink focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm placeholder:text-ink-subtle"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        autoFocus
                      />
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle group-focus-within:text-blue-500 transition-colors" />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!email}
                    className="w-full h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </form>

                <p className="text-center text-[10px] text-ink-muted">
                  Trusted by 3,200+ rental agencies worldwide
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <button
                    onClick={() => { setStep(1); setErrorType(null); }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink transition-colors mb-3 group"
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back
                  </button>
                  <h1 className="text-xl font-bold text-ink tracking-tight">Enter password</h1>
                  <p className="text-sm text-ink-muted mt-0.5 truncate">
                    For <span className="font-semibold text-ink">{email}</span>
                  </p>
                </div>

                {errorType && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">!</div>
                    <div>
                      <p className="font-semibold text-xs">Error</p>
                      <p className="text-xs text-rose-500/90 mt-0.5">{ERROR_MESSAGES[errorType]}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Password</label>
                      <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">Forgot?</Link>
                    </div>
                    <div className="relative group">
                      <input
                        type={showPw ? "text" : "password"}
                        className="w-full h-10 pl-9 pr-9 rounded-lg bg-surface border border-surface-border text-ink focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm placeholder:text-ink-subtle"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                      />
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle group-focus-within:text-blue-500 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors focus:outline-none"
                      >
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">Sign In <LogIn size={15} /></span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 mt-4 border-t border-surface-border text-center">
              <div className="flex items-center justify-center gap-3 text-[10px] text-ink-muted">
                <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-blue-400" /> 256-bit</span>
                <span className="flex items-center gap-1"><Lock size={11} className="text-emerald-400" /> SOC 2</span>
                <a href="mailto:support@rentalgarage.co.ke" className="font-semibold text-blue-600 hover:underline">Support</a>
              </div>
              <p className="text-[10px] text-ink-muted mt-2">© 2024 Rental Garage</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

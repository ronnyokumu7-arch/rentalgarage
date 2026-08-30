// src/app/(auth)/layout.tsx
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: ReactNode;
}

// ── Premium Background with Enhanced Animation ──────────────
function PremiumBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base dark overlay with depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0E0C0A] via-[#1A1714]/95 to-[#221F1B]/95" />
      
      {/* Premium geometric pattern - replaces the image */}
      <div className="absolute inset-0 opacity-[0.06]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="premium-texture" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L30 60 M0 30 L60 30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <path d="M15 0 L15 60 M45 0 L45 60 M0 15 L60 15 M0 45 L60 45" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              <circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.03)" />
            </pattern>
            <pattern id="diagonal-lines" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="80" stroke="rgba(167,139,250,0.03)" strokeWidth="0.8" />
              <line x1="20" y1="0" x2="20" y2="80" stroke="rgba(167,139,250,0.02)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#premium-texture)" />
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>
      </div>
      
      {/* Subtle noise texture using CSS */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
      
      {/* Premium glow orbs */}
      <motion.div 
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.1, 0.4, 0.1],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />
    </div>
  );
}

// ── Enhanced Floating Particles ──────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/40"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -60, 0, 60, 0],
            x: [0, 40, 0, -40, 0],
            opacity: [particle.opacity, particle.opacity * 2.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Stats Component ───────────────────────────────────────────
function AnimatedStats() {
  const stats = [
    { value: "15K+", label: "Vehicles" },
    { value: "3,200+", label: "Clients" },
    { value: "4.9★", label: "Rating" },
  ];

  return (
    <motion.div 
      className="flex items-center gap-10 pt-6 border-t border-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
    >
      {stats.map((stat, index) => (
        <motion.div 
          key={index}
          className="group cursor-default"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.p 
            className="text-3xl font-bold text-white tracking-tight font-display"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.8 + index * 0.1, 
              duration: 0.5,
              type: "spring",
              stiffness: 200,
            }}
          >
            {stat.value}
          </motion.p>
          <p className="text-sm text-[var(--color-ink-muted)] font-medium group-hover:text-[var(--color-ink-secondary)] transition-colors">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ── Trust Badges ──────────────────────────────────────────────
function TrustBadges() {
  const badges = [
    { icon: ShieldCheck, label: "256-bit SSL" },
    { icon: Lock, label: "SOC 2 Compliant" },
    { icon: Sparkles, label: "99.9% Uptime" },
  ];

  return (
    <motion.div 
      className="flex flex-wrap items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderColor: "rgba(167, 139, 250, 0.2)",
          }}
        >
          <badge.icon size={14} className="text-[var(--color-primary)]" />
          <span className="text-[var(--color-ink-muted)] text-xs font-medium">{badge.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* ── LEFT PANEL - Premium Brand Experience (ALWAYS DARK) ──────────── */}
      <motion.div 
        className="auth-dark hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 relative overflow-hidden"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Premium Background with Enhanced Animation */}
        <PremiumBackground />
        
        {/* Enhanced Floating Particles */}
        <FloatingParticles />

        {/* Brand Header */}
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30 border border-white/10 backdrop-blur-sm"
              whileHover={{ 
                rotate: [-5, 5, -5, 0],
                transition: { duration: 0.5 }
              }}
            >
              RG
            </motion.div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight block">
                Rental<span className="text-[var(--color-primary)]">Garage</span>
              </span>
              <span className="text-[var(--color-ink-muted)] text-[10px] font-medium tracking-[0.15em] uppercase">
                Enterprise Fleet Management
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Content - Premium Typography */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10 max-w-lg">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Main Heading - Bold & Premium */}
            <div>
              <motion.h1 
                className="text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight font-display"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <span className="text-white">Fleet</span>
                <br />
                <span className="text-white">Management</span>
              </motion.h1>
              
              <motion.div 
                className="flex items-center gap-0 mt-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.span 
                  className="text-4xl lg:text-5xl font-bold font-display inline-block"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    textShadow: [
                      '0 0 20px rgba(167, 139, 250, 0)',
                      '0 0 40px rgba(167, 139, 250, 0.3)',
                      '0 0 20px rgba(167, 139, 250, 0)',
                    ],
                  }}
                  transition={{
                    backgroundPosition: {
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    textShadow: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #C4B5FD, #8B5CF6, #A78BFA)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Reimagined
                </motion.span>
                <motion.span 
                  className="text-4xl lg:text-5xl font-bold text-white/80"
                  animate={{
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  .
                </motion.span>
              </motion.div>
              
              <motion.p 
                className="text-[var(--color-ink-muted)] text-base mt-4 leading-relaxed max-w-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                The all-in-one platform for modern rental agencies. 
                Streamline operations, boost revenue, and deliver exceptional service.
              </motion.p>
            </div>

            {/* Trust Badges */}
            <TrustBadges />

            {/* Stats */}
            <AnimatedStats />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div 
          className="relative z-10 flex items-center justify-between text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <span className="text-[var(--color-ink-faint)]">© 2026 Rental Garage. All rights reserved.</span>
          <div className="flex items-center gap-4 text-[var(--color-ink-faint)]">
            <Link href="/privacy" className="hover:text-[var(--color-ink-muted)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--color-ink-muted)] transition-colors">Terms</Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── RIGHT PANEL - Auth Form (ALWAYS LIGHT, full-bleed) ───────────────── */}
      <motion.div 
        className="auth-light flex-1 flex items-center justify-center p-6 lg:p-16 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {/* ✅ max-w-md: proper desktop card width; mobile unchanged */}
        <div className="w-full max-w-md">
          {/* Mobile Brand - FIXED: Using brand light mode colors */}
          <motion.div 
            className="lg:hidden flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
              RG
            </div>
            <span className="text-[#1C1917] font-bold text-xl tracking-tight">
              Rental<span className="text-[#7C3AED]">Garage</span>
            </span>
          </motion.div>

          {children}
        </div>
      </motion.div>
    </div>
  );
}

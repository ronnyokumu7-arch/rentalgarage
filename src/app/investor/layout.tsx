// src/app/(investor)/layout.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import DashboardShell from "@/components/layout/DashboardShell";
import { investorNav } from "@/lib/nav-config";
import AuthGuard from "@/components/AuthGuard";
import { motion } from "framer-motion";

/**
 * @component InvestorLayout
 * @description 
 * The unified shell for all investor portal routes.
 * 
 * Architecture:
 * 1. Wraps children in `AuthGuard` to ensure baseline authentication.
 * 2. Handles investor-specific business logic:
 *    - Redirects non-investors (tenant admins, staff, super admins) away from this portal.
 *    - Blocks inactive or suspended users.
 * 3. Renders the `DashboardShell` with the investor navigation configuration.
 * 4. Provides fast page transitions (enter-only, no blocking exit).
 */
export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // ── Memoized redirect checks for performance ──────────────
  const redirectChecks = useMemo(() => {
    if (isLoading || !isAuthenticated || !user) return null;
    
    // 1. Block non-investors from accessing this portal
    if (user.role !== "investor") {
      return { path: "/dashboard", reason: "not_investor" };
    }
    
    // 2. Block inactive or suspended users
    if (!user.is_active) {
      return { path: "/login?reason=inactive", reason: "inactive_user" };
    }
    
    if (user.is_suspended) {
      return { path: "/login?reason=suspended", reason: "suspended_user" };
    }
    
    return null;
  }, [isLoading, isAuthenticated, user]);

  // ── Handle redirects ──────────────────────────────────────
  useEffect(() => {
    if (redirectChecks) {
      router.replace(redirectChecks.path);
    }
  }, [redirectChecks, router]);

  // ── Page transition variants (FAST: enter-only, no blocking exit) ──
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 8,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  // Show loading state while auth resolves
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <DashboardShell navItems={investorNav}>
        <motion.div
          key={typeof window !== "undefined" ? window.location.pathname : "investor-dashboard"}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          className="min-h-[calc(100vh-theme(spacing.16))]"
        >
          {children}
        </motion.div>
      </DashboardShell>
    </AuthGuard>
  );
}

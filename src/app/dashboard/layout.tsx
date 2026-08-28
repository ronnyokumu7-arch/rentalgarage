// src/app/dashboard/layout.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import DashboardShell from "@/components/layout/DashboardShell";
import { tenantAdminNav } from "@/lib/nav-config";
import AuthGuard from "@/components/AuthGuard";
import { motion } from "framer-motion";

/**
 * @component DashboardLayout
 * @description 
 * The unified shell for all tenant/admin dashboard routes.
 * 
 * Architecture:
 * 1. Wraps children in `AuthGuard` to ensure baseline authentication 
 *    and prevent null-reference crashes from incomplete auth state.
 * 2. Handles tenant-specific business logic:
 *    - Redirects Super Admins to their dedicated shell (`/super-admin`).
 *    - Blocks inactive or suspended users.
 * 3. Renders the `DashboardShell` with the tenant navigation configuration.
 * 4. Provides fast page transitions (enter-only, no blocking exit).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // ── Memoized redirect checks for performance ──────────────
  const redirectChecks = useMemo(() => {
    if (isLoading || !isAuthenticated || !user) return null;
    
    // 1. Redirect super admins to their dedicated environment
    if (user.role === "super_admin") {
      return { path: "/super-admin", reason: "super_admin_redirect" };
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

  return (
    <AuthGuard>
      <DashboardShell navItems={tenantAdminNav}>
        <motion.div
          key={typeof window !== "undefined" ? window.location.pathname : "dashboard"}
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

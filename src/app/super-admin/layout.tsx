// src/app/super-admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import DashboardShell from "@/components/layout/DashboardShell";
import { superAdminNav } from "@/lib/nav-config";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    
    // Redirect non-super-admins to tenant dashboard
    if (user?.role !== "super_admin") {
      router.replace("/dashboard");
      return;
    }
    
    // Block inactive/suspended users
    if (!user?.is_active || user.is_suspended) {
      router.replace("/login");
      return;
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 rounded-full border-2 border-accent-dark border-t-transparent animate-spin" />
      </div>
    );
  }

  // Don't render anything if not authenticated or wrong role (redirecting)
  if (!isAuthenticated || user?.role !== "super_admin") return null;

  return (
    <DashboardShell navItems={superAdminNav}>
      {children}
    </DashboardShell>
  );
}

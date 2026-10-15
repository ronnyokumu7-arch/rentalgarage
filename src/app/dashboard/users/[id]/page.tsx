"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, CheckCircle2, Camera, Layers } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

// ✅ Import the modular components
import UserPersonalInfoCard from "@/components/profile/UserPersonalInfoCard";
import UserStatusCard from "@/components/profile/UserStatusCard";
import OperationsTab from "@/components/profile/OperationsTab";
import MobileFloatingBackButton from "@/components/ui/MobileFloatingBackButton";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "operations", label: "Operations", icon: CheckCircle2 },
];

export default function UserProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  const { user, loading, handleUpdateUser, handleStatusAction } = useUserProfile();

  const getCurrentUserId = () => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("current_user_id");
      if (storedId) return Number(storedId);
    }
    return null;
  };

  const currentUserId = getCurrentUserId();
  const isSelfView = user?.id === currentUserId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">User not found</h2>
        <button
          onClick={() => router.push("/dashboard/users")}
          className="mt-4 text-[var(--color-primary)] hover:underline font-semibold text-sm"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(user.full_name);

  const getRoleBadge = () => {
    switch (user.role) {
      case "super_admin":
        return {
          label: "System",
          class:
            "bg-purple-500/5 text-purple-600 dark:text-purple-400 border border-purple-500/10",
        };
      case "tenant_admin":
        return {
          label: "Admin",
          class:
            "bg-[var(--color-primary)]/5 text-[var(--color-primary)] border border-[var(--color-primary)]/10",
        };
      default:
        return {
          label: "Staff",
          class:
            "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]",
        };
    }
  };

  const roleBadge = getRoleBadge();

  const renderDynamicHeader = () => {
    if (activeTab === "profile") {
      return (
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="relative group cursor-pointer shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-lg ring-2 sm:ring-4 ring-[var(--color-surface)] transition-transform group-hover:scale-105">
              {initials}
            </div>
            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={18} className="text-white sm:w-5 sm:h-5" />
            </div>
            <div
              className={`absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-[var(--color-surface)] ${
                user.is_suspended
                  ? "bg-amber-500"
                  : user.is_active
                  ? "bg-emerald-500"
                  : "bg-[var(--color-ink-subtle)]"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--color-ink)] truncate">
                {user.full_name}
              </h1>
              <span
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wide ${roleBadge.class}`}
              >
                {roleBadge.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] truncate">
              {user.job_title || "Team Member"}{" "}
              {user.department && `• ${user.department}`}
            </p>
            <p className="text-[11px] sm:text-xs text-[var(--color-ink-subtle)] mt-0.5 sm:mt-1 truncate font-mono">
              {user.email}
            </p>
          </div>
        </div>
      );
    } else if (activeTab === "operations") {
      return (
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 items-center justify-center text-[var(--color-primary)] shrink-0">
            <Layers size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[var(--color-ink)]">
              Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-0.5">
              Manage tasks and complete your assignments in real-time.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto relative px-3 sm:px-4">
      {/* ─ FLOATING BACK BUTTON — mobile only ── */}
      <div className="md:hidden">
        <MobileFloatingBackButton
          href="/dashboard/users"
          label="Back to Users"
        />
      </div>

      {/* ─ PAGE HEADER WITH TABS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0 w-full">{renderDynamicHeader()}</div>

        <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-surface-border)] p-1 rounded-xl shrink-0 w-full sm:w-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 min-h-[36px] sm:min-h-0 ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENT AREA (Fluid Height Layout) ── */}
      <div className="w-full h-auto min-h-0">
        {/* TAB 1: PROFILE & SECURITY */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 animate-in fade-in duration-200">
            <div className="lg:col-span-2">
              <UserPersonalInfoCard
                user={user}
                onSave={handleUpdateUser}
                isSelfView={isSelfView}
              />
            </div>
            <div className="lg:col-span-1">
              <UserStatusCard
                user={user}
                onStatusAction={handleStatusAction}
                isSelfView={isSelfView}
              />
            </div>
          </div>
        )}

        {/* TAB 2: OPERATIONS */}
        {activeTab === "operations" && (
          <div className="w-full h-auto animate-in fade-in duration-200">
            <OperationsTab
              userId={user.id}
              currentUserRole={user.role}
              isSelfView={isSelfView}
              hideHeader={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

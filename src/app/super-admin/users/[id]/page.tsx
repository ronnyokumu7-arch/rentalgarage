// src/app/dashboard/users/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Bell, CheckCircle as CheckCircle2, Camera, Stack as Layers } from "@phosphor-icons/react/ssr";
import { useUserProfile } from "@/hooks/useUserProfile"; 

// ✅ Import the modular components
import UserPersonalInfoCard from "@/components/profile/UserPersonalInfoCard";
import UserStatusCard from "@/components/profile/UserStatusCard";
import UserNotificationsCard from "@/components/profile/UserNotificationsCard";
import OperationsTab from "@/components/profile/OperationsTab";

const TABS = [
  { id: "profile", label: "Profile & Security", icon: User },
  { id: "operations", label: "Operations", icon: CheckCircle2 },
  { id: "preferences", label: "Preferences", icon: Bell },
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
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">User not found</h2>
        <button 
          onClick={() => router.push("/dashboard/users")} 
          className="mt-4 text-[var(--color-primary)] hover:underline font-semibold"
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
      case 'super_admin':
        return { label: 'System', class: 'bg-purple-500/5 text-purple-600 dark:text-purple-400 border border-purple-500/10' };
      case 'tenant_admin':
        return { label: 'Admin', class: 'bg-[var(--color-primary)]/5 text-[var(--color-primary)] border border-[var(--color-primary)]/10' };
      default:
        return { label: 'Staff', class: 'bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]' };
    }
  };

  const roleBadge = getRoleBadge();

  const renderDynamicHeader = () => {
    if (activeTab === "profile") {
      return (
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer shrink-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg ring-4 ring-[var(--color-surface)] transition-transform group-hover:scale-105">
              {initials}
            </div>
            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={20} className="text-white" aria-hidden="true" />
            </div>
            <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[var(--color-surface)] ${
              user.is_suspended ? 'bg-amber-500' : user.is_active ? 'bg-emerald-500' : 'bg-[var(--color-ink-subtle)]'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-[var(--color-ink)] truncate">{user.full_name}</h1>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${roleBadge.class}`}>
                {roleBadge.label}
              </span>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] truncate">
              {user.job_title || 'Team Member'} {user.department && `• ${user.department}`}
            </p>
            <p className="text-xs text-[var(--color-ink-subtle)] mt-1 truncate font-mono">{user.email}</p>
          </div>
        </div>
      );
    } else if (activeTab === "operations") {
      return (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
            <Layers size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--color-ink)]">Operations Command Center</h1>
            <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">Manage tasks, assign actions, and execute workflows in real-time.</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <Bell size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--color-ink)]">Preferences</h1>
            <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">Customize your workspace appearance and layout</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="pb-8 max-w-7xl mx-auto relative">
      
      {/* ─ FLOATING BACK BUTTON (Bottom Right) ── */}
      <button
        onClick={() => router.push("/dashboard/users")}
        // ✅ FIX: Added a premium soft dark outer shadow to bring it to life
        className="fixed bottom-10 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[0_5px_10px_-5px_rgba(0,0,0,0.8)] hover:shadow-[0_5px_10px_-5px_rgba(0,0,0,0.95)] transition-all duration-300 group overflow-hidden min-w-[48px]"
        title="Back to Users"
      >
        <ArrowLeft size={18} className="text-[var(--color-ink)] shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
        <span className="text-xs font-bold text-[var(--color-ink)] whitespace-nowrap opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto transition-all duration-300 overflow-hidden">
          Back to Users
        </span>
      </button>

      {/* ─ PAGE HEADER WITH TABS ── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        
        <div className="flex-1 min-w-0">
          {renderDynamicHeader()}
        </div>

        <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-surface-border)] p-1 rounded-xl shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB CONTENT AREA (Aligned with floating button) ── */}
      {/* ✅ FIX: Reduced height by ~16px (approx 4mm) to eliminate page scrolling */}
      <div className="h-[calc(100vh-226px)] overflow-hidden">
        
        {/* TAB 1: PROFILE & SECURITY */}
        {activeTab === "profile" && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
            <div className="lg:col-span-2 h-full overflow-y-auto custom-scrollbar pr-2">
              <UserPersonalInfoCard 
                user={user} 
                onSave={handleUpdateUser} 
                isSelfView={isSelfView} 
              />
            </div>
            <div className="lg:col-span-1 h-full overflow-y-auto custom-scrollbar pr-2">
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
          <div className="h-full animate-in fade-in duration-200">
            <OperationsTab 
              userId={user.id}
              currentUserRole={user.role}
              isSelfView={isSelfView}
              hideHeader={true} 
            />
          </div>
        )}

        {/* TAB 3: PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="h-full overflow-y-auto custom-scrollbar max-w-3xl animate-in fade-in duration-200">
            <UserNotificationsCard 
              user={user} 
              onSave={handleUpdateUser} 
            />
          </div>
        )}

      </div>
    </div>
  );
}

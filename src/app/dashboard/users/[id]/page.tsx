// src/app/dashboard/users/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  User as UserIcon,
  Phone,
  MessageCircle,
  MoreVertical,
  Check,
  Ban,
  Key,
  Shield,
  LayoutGrid,
  CheckCircle2,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

import ProfileLayout, { ProfileField } from "@/components/profile/ProfileLayout";
import UserPersonalInfoCard from "@/components/profile/UserPersonalInfoCard";
import UserStatusCard from "@/components/profile/UserStatusCard";
import OperationsTab from "@/components/profile/OperationsTab";
import SectionCard from "@/components/ui/SectionCard";

import { useUserProfile } from "@/hooks/useUserProfile";
import { usersApi } from "@/lib/api/users";

/* ── Profile Action Group ── */
type ActionItem = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger" | "primary" | "success";
  disabled?: boolean;
  hidden?: boolean;
};

function ProfileActionGroup({
  actions,
  compact = [],
}: {
  actions: ActionItem[];
  compact?: Array<{ icon: React.ElementType; label: string; href: string; tone?: "default" | "success" | "primary" }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visibleActions = actions.filter((a) => !a.hidden);

  return (
    <div className="flex items-center gap-2">
      {compact.map((btn) => {
        const Icon = btn.icon;
        const toneClass =
          btn.tone === "success" ? "text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/30"
          : btn.tone === "primary" ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30"
          : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]";
        return (
          <a key={btn.label} href={btn.href} target={btn.href.startsWith("http") ? "_blank" : undefined} rel={btn.href.startsWith("http") ? "noopener noreferrer" : undefined} title={btn.label} aria-label={btn.label} className={`w-10 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-center transition-all active:scale-95 ${toneClass}`}>
            <Icon size={18} />
          </a>
        );
      })}

      {visibleActions.length > 0 && (
        <div ref={ref} className="relative">
          <button type="button" onClick={() => setOpen((v) => !v)} title="More actions" aria-label="More actions" aria-haspopup="menu" aria-expanded={open} className="w-10 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95">
            <MoreVertical size={18} />
          </button>

          {open && (
            <div role="menu" className="absolute right-0 top-[calc(100%+6px)] w-56 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="py-1">
                {visibleActions.map((action, i) => {
                  const Icon = action.icon;
                  const toneClass =
                    action.tone === "danger" ? "text-rose-600 hover:bg-rose-500/10"
                    : action.tone === "primary" ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                    : action.tone === "success" ? "text-emerald-600 hover:bg-emerald-500/10"
                    : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]";
                  const separator = action.tone === "danger" && i > 0;
                  return (
                    <div key={action.label}>
                      {separator && <div className="h-px bg-[var(--color-surface-border)] my-1" />}
                      <button type="button" role="menuitem" onClick={() => { setOpen(false); action.onClick(); }} disabled={action.disabled} className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${toneClass}`}>
                        <Icon size={14} className="shrink-0" />
                        <span className="flex-1 text-left">{action.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Tabs ── */
const TABS = [
  { id: "profile",    label: "Profile",    icon: UserIcon },
  { id: "operations", label: "Operations", icon: CheckCircle2 },
];

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "operations">("profile");
  const { user, loading, actionLoading, handleUpdateUser, handleStatusAction, refetch } = useUserProfile();

  const isTenantOwner = (user as any)?.is_tenant_owner === true;

  // ✅ NEW: Avatar upload handler for the hero camera button
  const handleAvatarChange = async (file: File) => {
    try {
      await usersApi.uploadMyAvatar(file);
      toast.success("Avatar updated");
      // Refresh so the hero + card reflect the new avatar
      await refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to upload avatar");
      throw error; // re-throw so ProfileLayout can reset the loading spinner
    }
  };

  if (loading) {
    return <ProfileLayout title="User Profile" subtitle="Loading..." initials=".." status="pending" statusLabel="Loading" backHref="/dashboard/users" backLabel="Users" loading={true}><div /></ProfileLayout>;
  }

  if (!user) {
    return <ProfileLayout title="User Not Found" subtitle="This user does not exist or you don't have permission to view it." initials="?" status="suspended" statusLabel="Not Found" backHref="/dashboard/users" backLabel="Users" notFound={true}><div /></ProfileLayout>;
  }

  const initials = user.full_name
    ? user.full_name.trim().split(/\s+/).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "U";

  const heroStatus = user.is_suspended ? "suspended" : user.is_active ? "active" : "pending";
  const heroStatusLabel = user.is_suspended ? "Suspended" : user.is_active ? "Active" : "Inactive";

  const phoneDigits = (user.phone_number || "").replace(/[^\d+]/g, "");
  const compactActions = [];
  if (phoneDigits) {
    compactActions.push({ icon: Phone, label: "Call user", href: `tel:${phoneDigits}`, tone: "primary" as const });
    compactActions.push({ icon: MessageCircle, label: "WhatsApp user", href: `https://wa.me/${phoneDigits.replace(/^\+/, "")}`, tone: "success" as const });
  }

  const menuActions: ActionItem[] = [
    {
      icon: Key,
      label: "Send Reset Link",
      onClick: async () => {
        try {
          await usersApi.sendResetLink(user.id, { send_to_email: true, send_to_phone: false });
          toast.success("Reset link sent to user's email");
        } catch (error: any) {
          toast.error(error.response?.data?.detail || "Failed to send reset link");
        }
      },
    },
    {
      icon: Shield,
      label: "Send Verification",
      onClick: async () => {
        try {
          const res = await usersApi.sendVerification(user.id, { channel: "email" });
          if (res?.verification_link) {
            toast.success("Verification link generated");
            if (typeof navigator !== "undefined" && navigator.clipboard) {
              await navigator.clipboard.writeText(res.verification_link);
            }
          } else {
            toast.success("Verification email sent");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.detail || "Failed to send verification");
        }
      },
    },
    {
      icon: user.is_suspended ? Check : Ban,
      label: user.is_suspended ? "Reactivate User" : "Suspend User",
      onClick: () => handleStatusAction(user.is_suspended ? "reactivate" : "suspend"),
      tone: user.is_suspended ? "success" : "danger",
      disabled: actionLoading || isTenantOwner,
      hidden: isTenantOwner,
    },
  ];

  return (
    <ProfileLayout
      title={user.full_name}
      subtitle={`${user.job_title || "Team Member"}${user.department ? ` · ${user.department}` : ""}`}
      initials={initials}
      avatarSrc={user.avatar_url}
      onAvatarChange={handleAvatarChange}
      status={heroStatus as "active" | "pending" | "suspended"}
      statusLabel={heroStatusLabel}
      backHref="/dashboard/users"
      backLabel="Users"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as "profile" | "operations")}
      actionNode={<ProfileActionGroup actions={menuActions} compact={compactActions} />}
    >
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Identity & Contact" icon={UserIcon}>
              <div className="flex flex-col">
                <ProfileField label="Full Name" value={user.full_name} icon={UserIcon} />
                <ProfileField label="Email Address" value={user.email} icon={Mail} />
                <ProfileField label="Phone Number" value={user.phone_number} icon={Phone} isMono />
                <ProfileField label="Department" value={user.department} icon={LayoutGrid} />
                <ProfileField label="Job Title" value={user.job_title} icon={Shield} />
                <ProfileField label="Role" value={user.role.replace(/_/g, " ")} icon={Shield} />
              </div>
            </SectionCard>

            <UserPersonalInfoCard
              user={user}
              onSave={handleUpdateUser}
              isSelfView={false}
              onAvatarUpdated={() => refetch()}
            />
          </div>

          <div className="lg:col-span-1">
            <UserStatusCard user={user} onStatusAction={handleStatusAction} isSelfView={false} />
          </div>
        </div>
      )}

      {activeTab === "operations" && (
        <OperationsTab userId={user.id} currentUserRole={user.role} isSelfView={false} hideHeader={true} />
      )}
    </ProfileLayout>
  );
}

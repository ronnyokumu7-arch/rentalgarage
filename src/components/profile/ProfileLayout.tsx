// src/components/profile/ProfileLayout.tsx
"use client";

import { ReactNode, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, User as UserIcon, Camera } from "lucide-react";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import MobileFloatingSegment from "@/components/ui/MobileFloatingSegment";
import SecureImage from "@/components/ui/SecureImage";
import toast from "react-hot-toast";

export interface ProfileTab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface ProfileLayoutProps {
  title: string;
  subtitle: string;
  initials: string;
  avatarSrc?: string | null;
  onAvatarChange?: (file: File) => Promise<void>;   // NEW — enables the camera button
  status: "active" | "pending" | "suspended";
  statusLabel: string;
  backHref: string;
  backLabel: string;
  actionNode?: ReactNode;
  tabs?: ProfileTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  children: ReactNode;
  loading?: boolean;
  notFound?: boolean;
}

export default function ProfileLayout({
  title,
  subtitle,
  initials,
  avatarSrc,
  onAvatarChange,
  status,
  statusLabel,
  backHref,
  backLabel,
  actionNode,
  tabs = [],
  activeTab,
  onTabChange,
  children,
  loading,
  notFound,
}: ProfileLayoutProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-ink-muted">
        <Loader2 className="w-6 h-6 animate-spin mr-3 text-primary" />
        Loading profile...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-hover border border-surface-border flex items-center justify-center mb-4">
          <UserIcon size={24} className="text-ink-subtle" />
        </div>
        <h2 className="text-lg font-bold text-ink mb-2">Profile Not Found</h2>
        <p className="text-sm text-ink-muted max-w-md mb-6">
          The record you are looking for does not exist or you do not have permission to view it.
        </p>
        <Link
          href={backHref}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover transition-all"
        >
          <ArrowLeft size={16} /> Back to {backLabel}
        </Link>
      </div>
    );
  }

  const hasTabs = tabs.length > 0 && activeTab && onTabChange;
  const activeIndex = hasTabs ? tabs.findIndex((t) => t.id === activeTab) : -1;
  const nextTabIndex = activeIndex === 0 ? 1 : 0;
  const floatingIcon = hasTabs && activeIndex === 0 ? tabs[nextTabIndex]?.icon : (hasTabs ? tabs[0].icon : UserIcon);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onAvatarChange) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);
    try {
      await onAvatarChange(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to {backLabel}</span>
      </Link>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0 w-full md:w-auto">
          {/* Avatar with camera upload */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg overflow-hidden">
              {avatarSrc ? (
                <SecureImage
                  src={avatarSrc}
                  alt={title}
                  className="w-full h-full object-cover"
                  fallback={<span>{initials}</span>}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Camera upload button — only shows if onAvatarChange is provided */}
            {onAvatarChange && (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={isUploading}
                  title="Change avatar"
                  aria-label="Change avatar"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg hover:bg-[var(--color-primary-hover)] active:scale-95 transition-all border-2 border-[var(--color-bg)] disabled:opacity-60"
                >
                  {isUploading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Camera size={13} />
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
              </>
            )}

            {/* Status dot */}
            <div className={`absolute top-1 right-1 w-5 h-5 rounded-full border-4 border-[var(--color-bg)] ${
              status === "suspended" ? "bg-rose-500" :
              status === "active" ? "bg-emerald-500" : "bg-amber-500"
            }`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight truncate">
                {title}
              </h1>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                status === "suspended" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] truncate">{subtitle}</p>
          </div>
        </div>

        {actionNode && (
          <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
            {actionNode}
          </div>
        )}
      </div>

      {hasTabs && (
        <div className="hidden md:block border-b border-[var(--color-surface-border)] pb-2">
          <PremiumTabSwitcher tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      )}

      <div className="animate-in fade-in duration-200 min-h-[400px]">
        {children}
      </div>

      {hasTabs && tabs.length > 1 && (
        <MobileFloatingSegment
          segments={tabs}
          active={activeTab}
          onChange={onTabChange}
          triggerIcon={floatingIcon || tabs[0].icon}
        />
      )}
    </div>
  );
}

export function ProfileField({ 
  label, 
  value, 
  icon: Icon, 
  isMono = false 
}: { 
  label: string; 
  value: string | number | null | undefined; 
  icon: React.ElementType;
  isMono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--color-surface-border)]/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]/50 flex items-center justify-center text-[var(--color-ink-subtle)]">
          <Icon size={14} />
        </div>
        <span className="text-sm font-medium text-[var(--color-ink-muted)]">{label}</span>
      </div>
      <span className={`text-sm font-semibold text-[var(--color-ink)] text-right pl-4 truncate ${isMono ? "font-mono" : ""}`}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

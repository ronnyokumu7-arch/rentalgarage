// src/components/profile/UserPersonalInfoCard.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  User, Mail, Phone, Building2, Briefcase, 
  Pencil, Save, X, ShieldAlert, Camera, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import SectionCard from "@/components/ui/SectionCard";
import SecureImage from "@/components/ui/SecureImage";
import { filesApi } from "@/lib/api/files";
import type { User as UserType } from "@/lib/types";
import type { UserUpdatePayload } from "@/lib/api/users";

const ADMIN_TITLES = ["Director", "Manager", "HR"];
const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  Finance: ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

interface UserPersonalInfoCardProps {
  user: UserType;
  onSave: (data: UserUpdatePayload) => void;
  isSelfView?: boolean;
  onAvatarUpdated?: (newUser: UserType) => void;   // NEW
}

export default function UserPersonalInfoCard({ 
  user, 
  onSave, 
  isSelfView = false,
  onAvatarUpdated,
}: UserPersonalInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    phone_number: user.phone_number || "",
    department: user.department || "",
    job_title: user.job_title || "",
  });

  useEffect(() => {
    if (!isEditing) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number || "",
        department: user.department || "",
        job_title: user.job_title || "",
      });
    }
  }, [user, isEditing]);

  const handleSave = () => {
    const trimmedName = formData.full_name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone_number.trim();
    
    if (!trimmedName || !trimmedEmail) return;
    
    const payload: UserUpdatePayload = {
      full_name: trimmedName,
      email: trimmedEmail,
      phone_number: trimmedPhone || null,
      department: formData.department.trim() || null,
      job_title: formData.job_title.trim() || null,
    };
    
    const originalEmail = user.email || "";
    const originalPhone = user.phone_number || "";

    if (trimmedEmail !== originalEmail) {
      payload.email_verified = false;
    }
    if (trimmedPhone !== originalPhone) {
      payload.phone_verified = false;
    }
    
    onSave(payload);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number || "",
      department: user.department || "",
      job_title: user.job_title || "",
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    // Local preview immediately
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setIsUploadingAvatar(true);

    try {
      const updatedUser = await filesApi.uploadMyAvatar(file);
      toast.success("Avatar updated");
      onAvatarUpdated?.(updatedUser);
      setAvatarPreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to upload avatar");
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() 
      : name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(user.full_name);
  const isSuperAdmin = user.role === "super_admin";

  const labelClass = "text-[9px] font-mono font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-0.5 block";
  const valueClass = "text-xs font-mono font-bold text-[var(--color-ink)] truncate";
  const emptyClass = "text-xs font-mono text-[var(--color-ink-subtle)] italic truncate";
  
  const inputBase = "w-full min-h-[38px] sm:min-h-0 bg-[var(--color-surface)] text-sm sm:text-xs font-mono font-bold text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] px-2.5 py-1.5 rounded-lg border border-[var(--color-surface-border)] focus:outline-none focus:border-[var(--color-primary)] transition-colors";
  const fieldRow = "min-h-[36px] sm:min-h-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-hover)]/20 border border-[var(--color-surface-border)]/50 transition-all duration-200";

  return (
    <SectionCard className="!p-0 overflow-hidden shadow-2xs border-[var(--color-surface-border)] rounded-xl h-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/10">
        
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar with camera upload */}
          <div className="relative group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] sm:text-xs font-bold text-white shadow-xs overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : user.avatar_url ? (
                <SecureImage
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                  fallback={<span>{initials}</span>}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <label className="absolute inset-0 rounded-lg bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              {isUploadingAvatar ? (
                <Loader2 size={12} className="text-white animate-spin" />
              ) : (
                <Camera size={12} className="text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                  e.target.value = ""; // reset so the same file can be re-selected
                }}
                disabled={isUploadingAvatar}
              />
            </label>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-[var(--color-ink)] uppercase tracking-wider truncate">
              Personal Information
            </h3>
            <p className="text-[9px] sm:text-[10px] font-mono text-[var(--color-ink-muted)] leading-tight truncate">
              Manage identity & contact info
            </p>
          </div>
        </div>

        {/* Edit Controls */}
        {!isSelfView && (
          isEditing ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={handleCancel} className="min-h-[32px] sm:min-h-0 flex items-center justify-center gap-1 px-2.5 py-1 rounded-md text-xs sm:text-[10px] font-mono font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors">
                <X size={12} /> Cancel
              </button>
              <button onClick={handleSave} disabled={!formData.full_name.trim() || !formData.email.trim()} className="min-h-[32px] sm:min-h-0 flex items-center justify-center gap-1 px-3 py-1 rounded-md text-xs sm:text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors disabled:opacity-50">
                <Save size={12} /> Save
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs sm:text-[10px] font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all active:scale-95 min-h-[32px] sm:min-h-0">
              <Pencil size={11} /> Edit
            </button>
          )
        )}
      </div>

      {/* Grid Content */}
      <div className="p-3 sm:p-3.5 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        <div>
          <label className={labelClass}>Full Name</label>
          {isEditing ? (
            <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className={`${inputBase} ${!formData.full_name.trim() ? 'border-rose-500 text-rose-500' : ''}`} placeholder="Enter full name" autoFocus />
          ) : (
            <div className={fieldRow}>
              <User size={13} className="text-[var(--color-ink-subtle)] shrink-0" />
              <span className={valueClass}>{user.full_name}</span>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          {isEditing ? (
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`${inputBase} ${!formData.email.trim() ? 'border-rose-500 text-rose-500' : ''}`} placeholder="name@company.com" />
          ) : (
            <div className={fieldRow}>
              <Mail size={13} className="text-[var(--color-ink-subtle)] shrink-0" />
              <span className={valueClass}>{user.email}</span>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          {isEditing ? (
            <input type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className={inputBase} placeholder="+254 700 000000" />
          ) : (
            <div className={fieldRow}>
              <Phone size={13} className="text-[var(--color-ink-subtle)] shrink-0" />
              <span className={user.phone_number ? valueClass : emptyClass}>{user.phone_number || "Not provided"}</span>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Department</label>
          {isEditing ? (
            <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value, job_title: "" })} className={`${inputBase} cursor-pointer`} disabled={isSuperAdmin}>
              <option value="">Select Department...</option>
              {user.role === "tenant_admin" ? (
                <option value="Executive">Executive</option>
              ) : (
                Object.keys(STAFF_DEPARTMENTS).map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))
              )}
            </select>
          ) : (
            <div className={fieldRow}>
              <Building2 size={13} className="text-[var(--color-ink-subtle)] shrink-0" />
              <span className={user.department ? valueClass : emptyClass}>{user.department || "Not assigned"}</span>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Job Title / Position</label>
          {isEditing ? (
            <div className="w-full flex items-center gap-2">
              <select value={formData.job_title} onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} className={`${inputBase} flex-1 cursor-pointer`} disabled={isSuperAdmin || !formData.department}>
                <option value="">Select Title...</option>
                {user.role === "tenant_admin" ? (
                  ADMIN_TITLES.map((t) => <option key={t} value={t}>{t}</option>)
                ) : (
                  formData.department && STAFF_DEPARTMENTS[formData.department]?.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))
                )}
              </select>
              {isSuperAdmin && <ShieldAlert size={15} className="text-amber-500 shrink-0" />}
            </div>
          ) : (
            <div className={fieldRow}>
              <Briefcase size={13} className="text-[var(--color-ink-subtle)] shrink-0" />
              <span className={user.job_title ? valueClass : emptyClass}>{user.job_title || user.department || "Unassigned"}</span>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

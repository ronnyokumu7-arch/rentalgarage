// src/components/scheduler/UserSettingsDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Shield,
  Clock,
  Warning as AlertTriangle,
  FloppyDisk as Save,
  Trash as Trash2,
} from "@phosphor-icons/react/ssr";
import { TeamMember } from "@/hooks/scheduler/useTaskSchedulerTimeline";

export interface UserPermissions {
  canAssignTasks: boolean;
  canEditSchedule: boolean;
  canManageTeam: boolean;
  viewFinancialData: boolean;
}

interface UserSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: TeamMember | null;
  onSaveUser: (
    updatedUser: TeamMember,
    permissions: UserPermissions
  ) => Promise<void> | void;
  onDeactivateUser?: (userId: number) => Promise<void> | void;
}

const DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
  Admin: {
    canAssignTasks: true,
    canEditSchedule: true,
    canManageTeam: true,
    viewFinancialData: true,
  },
  "Lead Developer": {
    canAssignTasks: true,
    canEditSchedule: true,
    canManageTeam: false,
    viewFinancialData: false,
  },
  "UI/UX Designer": {
    canAssignTasks: true,
    canEditSchedule: false,
    canManageTeam: false,
    viewFinancialData: false,
  },
  "Project Manager": {
    canAssignTasks: true,
    canEditSchedule: true,
    canManageTeam: true,
    viewFinancialData: true,
  },
  Default: {
    canAssignTasks: true,
    canEditSchedule: false,
    canManageTeam: false,
    viewFinancialData: false,
  },
};

export default function UserSettingsDrawer({
  isOpen,
  onClose,
  user,
  onSaveUser,
  onDeactivateUser,
}: UserSettingsDrawerProps) {
  // Form State
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [maxCapacityHours, setMaxCapacityHours] = useState(40);
  const [permissions, setPermissions] = useState<UserPermissions>({
    canAssignTasks: true,
    canEditSchedule: true,
    canManageTeam: false,
    viewFinancialData: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Sync state when drawer opens or selected user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setRole(user.role);
      setDepartment(user.department);
      setMaxCapacityHours(user.maxCapacityHours || 40);
      setPermissions(
        DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS["Default"]
      );
      setShowConfirmDelete(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (DEFAULT_PERMISSIONS[newRole]) {
      setPermissions(DEFAULT_PERMISSIONS[newRole]);
    }
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveUser(
        {
          ...user,
          fullName,
          role,
          department,
          maxCapacityHours,
        },
        permissions
      );
      onClose();
    } catch (_error) {
      console.error("Failed to save user settings:", _error);
    } finally {
      setIsSaving(false);
    }
  };

  const capacityPercentage = Math.min(
    100,
    Math.round((maxCapacityHours / 60) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden antialiased">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--color-surface)] border-l border-[var(--color-surface-border)] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm overflow-hidden">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.fullName.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-ink)] leading-tight">
                  User Settings
                </h3>
                <p className="text-[11px] text-[var(--color-ink-muted)] font-mono">
                  ID: #{user.id.toString().padStart(4, "0")}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors disabled:opacity-50"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Form Content Body */}
          <form
            id="user-settings-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar"
          >
            {/* Basic Info Section */}
            <div className="space-y-3">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-ink-subtle)] flex items-center gap-1.5">
                <User size={13} aria-hidden="true" />
                <span>Profile & Identity</span>
              </label>

              <div className="space-y-3 bg-[var(--color-surface-hover)]/30 p-3.5 rounded-xl border border-[var(--color-surface-border)]">
                <div>
                  <label className="text-[11px] font-semibold text-[var(--color-ink-muted)] block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isSaving}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--color-ink-muted)] block mb-1">
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      disabled={isSaving}
                      className="w-full h-9 px-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <option value="Lead Developer">Lead Developer</option>
                      <option value="Senior Developer">Senior Developer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="QA Engineer">QA Engineer</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[var(--color-ink-muted)] block mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      disabled={isSaving}
                      className="w-full h-9 px-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Workload Capacity Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-ink-subtle)] flex items-center gap-1.5">
                  <Clock size={13} aria-hidden="true" />
                  <span>Weekly Capacity</span>
                </label>
                <span className="text-xs font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md border border-[var(--color-primary)]/20">
                  {maxCapacityHours}h / wk
                </span>
              </div>

              <div className="bg-[var(--color-surface-hover)]/30 p-4 rounded-xl border border-[var(--color-surface-border)] space-y-4">
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={maxCapacityHours}
                  onChange={(e) => setMaxCapacityHours(Number(e.target.value))}
                  disabled={isSaving}
                  className="w-full accent-[var(--color-primary)] cursor-pointer disabled:opacity-50"
                />

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-[var(--color-ink-muted)] mb-1.5">
                    <span>Part-Time</span>
                    <span>Standard</span>
                    <span>Overtime</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--color-surface-border)] overflow-hidden">
                    <div
                      style={{ width: `${capacityPercentage}%` }}
                      className={`h-full transition-all duration-300 ease-out ${
                        maxCapacityHours > 45
                          ? "bg-amber-500"
                          : "bg-[var(--color-primary)]"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Granular Permissions Matrix */}
            <div className="space-y-3">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-ink-subtle)] flex items-center gap-1.5">
                <Shield size={13} aria-hidden="true" />
                <span>Access Controls</span>
              </label>

              <div className="bg-[var(--color-surface-hover)]/30 rounded-xl border border-[var(--color-surface-border)] divide-y divide-[var(--color-surface-border)]">
                {[
                  { key: "canAssignTasks", title: "Assign Tasks", desc: "Allocate team tasks on the timeline" },
                  { key: "canEditSchedule", title: "Edit Master Schedule", desc: "Modify task dates and dependencies" },
                  { key: "canManageTeam", title: "Manage Team Members", desc: "Edit roles, capacity, and statuses" },
                  { key: "viewFinancialData", title: "View Financial Metrics", desc: "Access hourly rates and budget impact" },
                ].map((perm) => (
                  <div key={perm.key} className="p-3.5 flex items-center justify-between group">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-[var(--color-ink)] block">
                        {perm.title}
                      </span>
                      <span className="text-[10px] text-[var(--color-ink-muted)]">
                        {perm.desc}
                      </span>
                    </div>
                    {/* ✅ Premium iOS-style Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={permissions[perm.key as keyof UserPermissions]}
                      onClick={() => !isSaving && handlePermissionToggle(perm.key as keyof UserPermissions)}
                      disabled={isSaving}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        permissions[perm.key as keyof UserPermissions]
                          ? "bg-[var(--color-primary)]"
                          : "bg-[var(--color-surface-border)]"
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          permissions[perm.key as keyof UserPermissions]
                            ? "translate-x-4"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            {onDeactivateUser && (
              <div className="pt-2 border-t border-[var(--color-surface-border)]">
                {!showConfirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    disabled={isSaving}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    <span>Deactivate or Remove User</span>
                  </button>
                ) : (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl space-y-2 animate-in fade-in duration-150">
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={13} aria-hidden="true" />
                      <span>Confirm Deactivation?</span>
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)]">
                      This user will be unassigned from all active timeline tasks.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onDeactivateUser(user.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg shadow-xs transition-colors"
                      >
                        Yes, Deactivate
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmDelete(false)}
                        className="px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-ink)] font-bold text-[10px] rounded-lg border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-end gap-2 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-9 px-4 rounded-xl border border-[var(--color-surface-border)] text-xs font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="user-settings-form"
              disabled={isSaving}
              className="h-9 px-5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} aria-hidden="true" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

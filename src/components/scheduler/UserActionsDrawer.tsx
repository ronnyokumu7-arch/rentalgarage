"use client";
import { confirmAction } from "@/lib/utils/confirmAction";

import { X, Plus, Gear as Settings, Trash as Trash2 } from "@phosphor-icons/react/ssr";
import { TeamMember } from "@/hooks/scheduler/useTaskSchedulerTimeline";

interface UserActionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: TeamMember | null;
  onQuickAssign: (userId: number) => void;
  onOpenSettings: (user: TeamMember) => void;
  onDeactivate: (userId: number) => void;
}

export default function UserActionsDrawer({
  isOpen,
  onClose,
  user,
  onQuickAssign,
  onOpenSettings,
  onDeactivate,
}: UserActionsDrawerProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--color-surface)] border-l border-[var(--color-surface-border)] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface)] flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center font-bold text-sm overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-ink)] leading-tight">
                  {user.fullName}
                </h3>
                <p className="text-[11px] text-[var(--color-ink-muted)]">
                  {user.role} • {user.department}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Quick Actions */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                Quick Actions
              </label>
              
              <button
                onClick={() => {
                  onQuickAssign(user.id);
                  onClose();
                }}
                className="w-full p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/40 transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
                  <Plus size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[var(--color-ink)]">Create Task for User</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)]">Schedule a new task on the timeline</p>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenSettings(user);
                  onClose();
                }}
                className="w-full p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/40 transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Settings size={16} className="text-blue-500" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[var(--color-ink)]">User Settings</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)]">Edit profile, capacity, and permissions</p>
                </div>
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-[var(--color-surface-border)]">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-rose-500 block mb-2">
                Danger Zone
              </label>
              
              <button
                onClick={() => {
                  if (confirmAction(`Are you sure you want to deactivate ${user.fullName}?`)) {
                    onDeactivate(user.id);
                    onClose();
                  }
                }}
                className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-3 text-rose-600 dark:text-rose-400"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <Trash2 size={16} aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">Deactivate User</p>
                  <p className="text-[10px] opacity-80">Remove from team and unassign tasks</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

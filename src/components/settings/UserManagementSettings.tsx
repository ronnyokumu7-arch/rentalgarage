// src/components/settings/UserManagementSettings.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Plus, Mail, Copy, Check, Loader2, MoreVertical,
  ShieldAlert, UserCheck, Users as UsersIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { usersApi, type UserCreatePayload } from "@/lib/api/users";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  department?: string | null;
  job_title?: string | null;
  is_active: boolean;
  is_suspended: boolean;
  is_onboarded?: boolean;
  invite_token?: string | null;
}

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "?";

const getGradient = (id: number) =>
  AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];

export default function UserManagementSettings() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<UserCreatePayload>({
    full_name: "",
    email: "",
    role: "tenant_staff",
    department: "",
    job_title: "",
    is_active: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data);
    } catch {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await usersApi.create({ ...formData, password: undefined });
      setUsers([newUser, ...users]);
      setShowInviteModal(false);

      const link = `${window.location.origin}/invite?token=${newUser.invite_token}`;
      setInviteLink(link);
      toast.success("Invite created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create user");
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied! Ready to share via SMS or WhatsApp.");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSuspend = async (userId: number) => {
    try {
      await usersApi.suspend(userId, "Suspended via Settings");
      toast.success("User suspended");
      fetchUsers();
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const handleReactivate = async (userId: number) => {
    try {
      await usersApi.reactivate(userId);
      toast.success("User reactivated");
      fetchUsers();
    } catch {
      toast.error("Failed to reactivate user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ─── Toolbar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
            {users.length} {users.length === 1 ? "member" : "members"}
          </span>
        </div>
        <button
          onClick={() => { setShowInviteModal(true); setInviteLink(null); }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 shadow-[var(--shadow-md)] shadow-[var(--color-primary)]/20"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Invite User</span>
          <span className="sm:hidden">Invite</span>
        </button>
      </div>

      {/* ─── Empty state ────────────────────────────────────────── */}
      {users.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
            <UsersIcon size={24} />
          </div>
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-1">No team members yet</h3>
          <p className="text-sm text-[var(--color-ink-muted)] max-w-xs mx-auto">
            Invite your first team member to start collaborating.
          </p>
        </div>
      ) : (
        <>
          {/* ─── Mobile: Card list ───────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {users.map((user) => {
              const isPending = !user.is_onboarded;
              return (
                <div
                  key={user.id}
                  className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-4 shadow-sm"
                >
                  {/* Top row: avatar + name + status */}
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGradient(user.id)} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
                      {getInitials(user.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-bold text-[var(--color-ink)] truncate">{user.full_name}</p>
                        {isPending && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">{user.email}</p>
                    </div>
                    <StatusDot user={user} />
                  </div>

                  {/* Details row */}
                  <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate">
                        {user.job_title || "No Title"}
                      </p>
                      <p className="text-[10px] text-[var(--color-ink-muted)] truncate">
                        {user.department || "No Department"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {user.is_suspended ? (
                        <button
                          onClick={() => handleReactivate(user.id)}
                          className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors"
                          title="Reactivate"
                        >
                          <UserCheck size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(user.id)}
                          className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-600 transition-colors"
                          title="Suspend"
                        >
                          <ShieldAlert size={15} />
                        </button>
                      )}
                      <button className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] transition-colors">
                        <MoreVertical size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Desktop: Table ──────────────────────────────────── */}
          <div className="hidden md:block bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-surface-hover)]/50 border-b border-[var(--color-surface-border)]">
                  <tr>
                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">User</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Role & Department</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Status</th>
                    <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-border)]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--color-surface-hover)]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getGradient(user.id)} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                            {getInitials(user.full_name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[var(--color-ink)] flex items-center gap-2">
                              {user.full_name}
                              {!user.is_onboarded && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  Pending
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--color-ink-muted)]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[var(--color-ink)] text-sm">{user.job_title || "No Title"}</div>
                        <div className="text-xs text-[var(--color-ink-muted)]">{user.department || "No Department"}</div>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_suspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Suspended
                          </span>
                        ) : user.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {user.is_suspended ? (
                            <button onClick={() => handleReactivate(user.id)} className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-600 transition-colors" title="Reactivate">
                              <UserCheck size={15} />
                            </button>
                          ) : (
                            <button onClick={() => handleSuspend(user.id)} className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-600 transition-colors" title="Suspend">
                              <ShieldAlert size={15} />
                            </button>
                          )}
                          <button className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] transition-colors">
                            <MoreVertical size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── Invite Modal ───────────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {!inviteLink ? (
              <form onSubmit={handleInvite} className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--color-ink)]">Invite Team Member</h3>
                    <p className="text-xs text-[var(--color-ink-muted)]">Send a secure onboarding link.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--color-ink-muted)] mb-1.5">Full Name</label>
                    <input
                      required
                      className="w-full px-3 h-11 sm:h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--color-ink-muted)] mb-1.5">Email Address</label>
                    <input
                      required
                      type="email"
                      className="w-full px-3 h-11 sm:h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--color-ink-muted)] mb-1.5">Department</label>
                      <select
                        className="w-full px-3 h-11 sm:h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        value={formData.department ?? ""}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="">Select...</option>
                        <option value="Fleet & Operations">Fleet & Operations</option>
                        <option value="Finance">Finance</option>
                        <option value="Sales & Contracts">Sales & Contracts</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--color-ink-muted)] mb-1.5">Job Title</label>
                      <input
                        className="w-full px-3 h-11 sm:h-10 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                        value={formData.job_title ?? ""}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        placeholder="e.g. Dispatcher"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 h-11 sm:h-10 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-active)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 sm:h-10 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all"
                  >
                    Generate Invite
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <Check size={26} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--color-ink)]">Invite Ready!</h3>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)]">
                  Copy the link below and share via SMS or WhatsApp. Expires in 48 hours.
                </p>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                  <code className="flex-1 text-[11px] text-[var(--color-ink)] truncate text-left px-1">{inviteLink}</code>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 shrink-0"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteLink(null);
                    setFormData({ full_name: "", email: "", role: "tenant_staff", department: "", job_title: "", is_active: true });
                  }}
                  className="w-full h-11 sm:h-10 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-active)] transition-all"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Small inline helper for the mobile status dot ─────────────── */

function StatusDot({ user }: { user: User }) {
  if (user.is_suspended) {
    return (
      <span className="flex items-center gap-1 shrink-0">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Suspended</span>
      </span>
    );
  }
  if (user.is_active) {
    return (
      <span className="flex items-center gap-1 shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 shrink-0">
      <span className="w-2 h-2 rounded-full bg-slate-400" />
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Inactive</span>
    </span>
  );
}

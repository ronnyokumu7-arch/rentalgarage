// src/components/users/manage/RosterTab.tsx
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useUsersList } from "@/hooks/users/useUsersList";
import { confirmAction } from "@/lib/utils/confirmAction";

import UsersToolbar from "@/components/users/UsersToolbar";
import UsersTable from "@/components/users/UsersTable";

const QuickInviteModal = dynamic(() => import("@/components/users/QuickInviteModal"), {
  ssr: false,
  loading: () => null,
});

const InviteUserModal = dynamic(() => import("@/components/users/InviteUserModal"), {
  ssr: false,
  loading: () => null,
});

interface ApiError {
  response?: {
    data?: {
      detail?: string | Array<{ msg: string }>;
    };
  };
}

const getErrorMessage = (error: ApiError | unknown, fallback: string) => {
  const err = error as ApiError;
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg).join(", ");
  }
  return typeof detail === "string" ? detail : fallback;
};

export default function RosterTab() {
  const { user } = useAuth();

  const {
    users, paginatedUsers, filteredUsers, loading,
    totalUsers, activeUsers, inactiveUsers,
    category, setCategory,
    search, setSearch,
    departmentFilter, setDepartmentFilter,
    currentPage, setCurrentPage, totalPages,
    updateUserLocally, removeUserLocally,
  } = useUsersList();

  // SSR-safe viewport check
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Display strategy:
  // - Desktop (≥640px): Paginated list filtered by current Category tab
  // - Mobile (<640px): Unpaginated FULL combined list (Executive + Staff), respecting search & department filter
  const displayUsers = useMemo(() => {
    if (!isMobile) return paginatedUsers;

    return users.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = u.full_name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchJob = u.job_title?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchJob) return false;
      }
      if (departmentFilter) {
        if (u.department !== departmentFilter) return false;
      }
      return true;
    });
  }, [isMobile, paginatedUsers, users, search, departmentFilter]);

  // Local Interaction State — Add Manually flow
  const [showAddManually, setShowAddManually] = useState(false);
  const [addManuallyLoading, setAddManuallyLoading] = useState(false);
  const [addManuallySuccess, setAddManuallySuccess] = useState<string | null>(null);

  // Local Interaction State — Invite User flow
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Derived Department Options
  const departmentOptions = useMemo(() => {
    const depts = new Set<string>();
    users.forEach((u) => { if (u.department) depts.add(u.department); });
    return Array.from(depts).sort().map((d) => ({ value: d, label: d }));
  }, [users]);

  // ─── ADD MANUALLY (admin fills everything → account ready immediately) ─────
  const handleAddManuallySubmit = useCallback(async (data: { 
    full_name: string; 
    email: string; 
    phone_number?: string;
    role: "tenant_admin" | "tenant_staff";
    department: string; 
    job_title: string;
    password: string;
  }) => {
    setAddManuallyLoading(true);
    try {
      const payload = {
        full_name: data.full_name.trim(),
        email: data.email.trim(),
        phone_number: data.phone_number?.trim() || undefined,
        department: data.department,
        job_title: data.job_title,
        password: data.password,
        role: data.role,
        is_active: true,
      };
      
      const newUser = await usersApi.create(payload);
      updateUserLocally(newUser);
      setAddManuallySuccess(`Account created! Credentials emailed to ${data.email}`);
      
      // ✅ AUTO-REFRESH: notify users list to refetch (new user appears instantly across tabs)
      window.dispatchEvent(new CustomEvent('user:created'));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to create account"));
    } finally {
      setAddManuallyLoading(false);
    }
  }, [updateUserLocally]);

  const handleCloseAddManually = useCallback(() => {
    setShowAddManually(false);
    setAddManuallySuccess(null);
  }, []);

  // ─── INVITE USER (name + phone + locked role → user completes onboarding) ──
  const handleInviteSubmit = useCallback(async (data: { 
    full_name: string; 
    phone_number?: string;
    role: "tenant_admin" | "tenant_staff";
    department: string;
    job_title: string;
  }) => {
    setInviteLoading(true);
    try {
      const result = await usersApi.createInvite({
        full_name: data.full_name.trim(),
        phone_number: data.phone_number?.trim() || undefined,
        role: data.role,
        department: data.department,
        job_title: data.job_title,
      });
      setInviteLink(result.invite_link);
      
      // ✅ AUTO-REFRESH: notify users list to refetch (invite appears instantly)
      window.dispatchEvent(new CustomEvent('user:created'));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to generate invite link"));
    } finally {
      setInviteLoading(false);
    }
  }, []);

  const handleCloseInvite = useCallback(() => {
    setShowInvite(false);
    setInviteLink(null);
  }, []);

  // ─── Row Action Handlers ─────────────────────────────────────────────────
  const handleSuspend = useCallback(async (userToSuspend: User) => {
    setActionLoadingId(userToSuspend.id);
    try {
      if (userToSuspend.is_suspended) {
        await usersApi.reactivate(userToSuspend.id);
        toast.success("User reactivated successfully");
      } else {
        await usersApi.suspend(userToSuspend.id, "Suspended via Team Management");
        toast.success("User suspended successfully");
      }
      updateUserLocally({
        ...userToSuspend,
        is_suspended: !userToSuspend.is_suspended,
        is_active: userToSuspend.is_suspended
      });
      
      // ✅ AUTO-REFRESH: notify users list to refetch (status change)
      window.dispatchEvent(new CustomEvent('user:updated', { detail: { userId: userToSuspend.id } }));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Action failed"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, [updateUserLocally]);

  const handleVerify = useCallback(async (userId: number) => {
    setActionLoadingId(userId);
    try {
      await usersApi.update(userId, { is_onboarded: true });
      toast.success("User verified successfully");
      const updatedUser = users.find(u => u.id === userId);
      if (updatedUser) updateUserLocally({ ...updatedUser, is_onboarded: true });
      
      // ✅ AUTO-REFRESH: notify users list to refetch (verification status change)
      window.dispatchEvent(new CustomEvent('user:updated', { detail: { userId } }));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to verify user"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, [users, updateUserLocally]);

  const handleResetLink = useCallback(async (userId: number) => {
    setActionLoadingId(userId);
    try {
      await usersApi.sendResetLink(userId, { send_to_email: true, send_to_phone: false });
      toast.success("Reset link sent to User&apos;s email");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send reset link"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, []);

  const handleSendVerification = useCallback(async (userId: number, channel: "email" | "phone") => {
    setActionLoadingId(userId);
    try {
      const response = await usersApi.sendVerification(userId, { channel });
      if (channel === "phone" && response.shareable_message) {
        await navigator.clipboard.writeText(response.shareable_message);
        toast.success("Verification message copied to clipboard!");
      } else {
        toast.success(`${channel} verification sent successfully!`);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, `Failed to send ${channel} verification`));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, []);

  const handleDelete = useCallback(async (userId: number) => {
    if (!confirmAction("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      return;
    }
    setActionLoadingId(userId);
    try {
      await usersApi.delete(userId);
      toast.success("User deleted successfully");
      removeUserLocally(userId);
      
      // ✅ AUTO-REFRESH: notify users list to refetch (user removed)
      window.dispatchEvent(new CustomEvent('user:updated', { detail: { userId } }));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete user"));
    } finally {
      setActionLoadingId(null);
      setOpenDropdownId(null);
    }
  }, [removeUserLocally]);

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
      <UsersToolbar
        category={category}
        setCategory={setCategory}
        search={search}
        setSearch={setSearch}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departmentOptions={departmentOptions}
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        inactiveUsers={inactiveUsers}
        onQuickAdd={() => setShowAddManually(true)}
        onInvite={() => setShowInvite(true)}
      />

      <UsersTable
        users={displayUsers}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        totalItems={isMobile ? displayUsers.length : filteredUsers.length}
        pageSize={7}
        actionLoadingId={actionLoadingId}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
        onSuspend={handleSuspend}
        onVerify={handleVerify}
        onResetLink={handleResetLink}
        onSendVerification={handleSendVerification}
        onDelete={handleDelete}
        currentUserRole={user?.role || "tenant_staff"}
      />

      {/* Add Manually Modal (admin fills everything) */}
      <QuickInviteModal
        isOpen={showAddManually}
        onClose={handleCloseAddManually}
        onSubmit={handleAddManuallySubmit}
        loading={addManuallyLoading}
        successMessage={addManuallySuccess}
      />

      {/* Invite User Modal (name + phone → shareable link) */}
      <InviteUserModal
        isOpen={showInvite}
        onClose={handleCloseInvite}
        onSubmit={handleInviteSubmit}
        loading={inviteLoading}
        inviteLink={inviteLink}
      />
    </div>
  );
}

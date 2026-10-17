import apiClient from "@/lib/api-client";
import type { User, PaginatedResponse } from "@/lib/types";

// ---------------------------------------------------------------------------
// Recovery & Security Interfaces
// ---------------------------------------------------------------------------
export interface SendResetLinkPayload {
  send_to_email: boolean;
  send_to_phone: boolean;
  custom_message?: string;
}

export interface UserRecoveryOptions {
  email_masked: string;
  phone_masked: string | null;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  account_locked_until: string | null;
}

// ---------------------------------------------------------------------------
// Core User Interfaces
// ---------------------------------------------------------------------------
export interface UserCreatePayload {
  full_name: string;
  email: string;
  password?: string;
  role: "super_admin" | "tenant_admin" | "tenant_staff";
  tenant_id?: number | null;
  is_active?: boolean;
  phone_number?: string | null;
  department?: string | null;
  job_title?: string | null;
  permissions?: string[];
  two_factor_enabled?: boolean;
  id_number?: string | null;
  dl_number?: string | null;
  dl_expiry?: string | null;
  avatar_url?: string | null;
  id_image_url?: string | null;
  dl_image_url?: string | null;
}

export interface UserInviteCreatePayload {
  full_name: string;
  phone_number?: string | null;
  role: "super_admin" | "tenant_admin" | "tenant_staff";
  department?: string | null;
  job_title?: string | null;
}

export interface UserInviteResponse extends User {
  invite_token: string;
  invite_link: string;
}

export interface UserUpdatePayload {
  full_name?: string;
  email?: string;
  role?: "super_admin" | "tenant_admin" | "tenant_staff";
  is_active?: boolean;
  is_suspended?: boolean;
  theme_preference?: string;
  density_preference?: string;
  suspension_reason?: string | null;
  password?: string;
  phone_number?: string | null;
  department?: string | null;
  job_title?: string | null;
  permissions?: string[];
  two_factor_enabled?: boolean;
  id_number?: string | null;
  dl_number?: string | null;
  dl_expiry?: string | null;
  is_onboarded?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  avatar_url?: string | null;
  id_image_url?: string | null;
  dl_image_url?: string | null;
}

export interface AcceptInvitePayload {
  invite_token: string;
  password: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  avatar_url?: string | null;
  id_number?: string | null;
  id_image_url?: string | null;
  dl_number?: string | null;
  dl_image_url?: string | null;
  dl_expiry?: string | null;
}

export interface VerificationPayload {
  channel: "email" | "phone";
}

export interface VerifyTokenPayload {
  token: string;
  channel: "email" | "phone";
}

export interface TeamMember {
  id: number;
  fullName: string;
  avatarUrl?: string;
  role: string;
  department: string;
  maxCapacityHours: number;
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------
export const usersApi = {
  create: (data: UserCreatePayload) =>
    apiClient.post<User>("/users/", data).then((r) => r.data),

  createInvite: (data: UserInviteCreatePayload) =>
    apiClient.post<UserInviteResponse>("/users/invite", data).then((r) => r.data),

  list: (params?: { tenant_id?: number; role?: string; is_active?: boolean; is_suspended?: boolean; page?: number; page_size?: number }) =>
    apiClient.get<PaginatedResponse<User>>("/users/", { params }).then((r) => r.data.items),

  get: (id: number) =>
    apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  update: (id: number, data: UserUpdatePayload) =>
    apiClient.patch<User>(`/users/${id}`, data).then((r) => r.data),

  // ✅ NEW: self-update path — uses /me instead of /{id}, different permissions
  updateMe: (data: UserUpdatePayload) =>
    apiClient.patch<User>("/users/me", data).then((r) => r.data),

  // ✅ NEW: self avatar upload (multipart) — returns the updated user
  uploadMyAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<User>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  suspend: (id: number, reason?: string) =>
    apiClient.post<User>(`/users/${id}/suspend`, null, { params: { reason } }).then((r) => r.data),

  reactivate: (id: number) =>
    apiClient.post<User>(`/users/${id}/reactivate`).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),

  getRecoveryOptions: (id: number) =>
    apiClient.get<UserRecoveryOptions>(`/users/${id}/recovery-options`).then((r) => r.data),

  sendResetLink: (id: number, payload: SendResetLinkPayload) =>
    apiClient.post<{ message: string }>(`/users/${id}/send-reset-link`, payload).then((r) => r.data),

  acceptInvite: (data: AcceptInvitePayload) =>
    apiClient.post<User>("/users/accept-invite", data).then((r) => r.data),

  sendVerification: (id: number, payload: VerificationPayload) =>
    apiClient.post<{ 
      message: string; 
      verification_link?: string; 
      shareable_message?: string 
    }>(`/users/${id}/send-verification`, payload).then((r) => r.data),

  verifyToken: (data: VerifyTokenPayload) =>
    apiClient.post<User>("/users/verify", data).then((r) => r.data),

  markVerified: (id: number, payload: VerificationPayload) =>
    apiClient.post<User>(`/users/${id}/mark-verified`, payload).then((r) => r.data),

  // =========================================================================
  // ✅ TASK SCHEDULER SPECIFIC METHODS 
  // =========================================================================
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const res = await apiClient.get<PaginatedResponse<User>>("/users/", {
      params: { is_active: true, is_suspended: false, page_size: 100 },
    });
    const users = res.data.items;

    return users.map((u: any) => ({
      id: u.id,
      fullName: u.full_name,
      avatarUrl: u.avatar_url || undefined,
      role: u.job_title || u.role,
      department: u.department || "General",
      maxCapacityHours: 40, 
    }));
  },

  updateTeamMember: async (id: number, data: Partial<TeamMember>): Promise<TeamMember> => {
    const payload: UserUpdatePayload = {};
    if (data.fullName !== undefined) payload.full_name = data.fullName;
    if (data.role !== undefined) payload.job_title = data.role; 
    if (data.department !== undefined) payload.department = data.department;

    const updatedUser = await apiClient.patch<User>(`/users/${id}`, payload).then((r) => r.data);

    return {
      id: updatedUser.id,
      fullName: updatedUser.full_name,
      avatarUrl: updatedUser.avatar_url || undefined,
      role: updatedUser.job_title || updatedUser.role,
      department: updatedUser.department || "General",
      maxCapacityHours: 40,
    };
  },
};

// src/lib/api/files.ts
import apiClient from "@/lib/api-client";
import type { User } from "@/lib/types";

export const filesApi = {
  /**
   * Upload the current user's avatar. Backend: POST /users/me/avatar
   * Returns the full updated User object (with the new avatar_url already set).
   */
  uploadMyAvatar: (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<User>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

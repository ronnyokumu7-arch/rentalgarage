// src/app/invite/page.tsx
"use client";

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WarningCircle as AlertCircle, CheckCircle, CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";
import toast from "react-hot-toast";
import { usersApi } from "@/lib/api/users";
import apiClient from "@/lib/api-client";
import NewUserForm, { type UserInvitePreview } from "@/components/users/NewUserForm";

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

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [preview, setPreview] = useState<UserInvitePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
    password: "",
    confirmPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Fetch branding + role preview on mount
  useEffect(() => {
    if (!token) {
      setPageError("Invalid or missing invite link. Please contact your administrator.");
      setLoadingPreview(false);
      return;
    }

    (async () => {
      try {
        const res = await apiClient.get<UserInvitePreview>(`/users/invite/${token}/preview`);
        setPreview(res.data);
        // ✅ Pre-fill identity from the admin's creation data
        setFormData((prev) => ({
          ...prev,
          full_name: res.data.expected_full_name,
          email: res.data.expected_email,
        }));
      } catch (error: unknown) {
        setPageError(getErrorMessage(error, "This invite link is invalid or has expired."));
      } finally {
        setLoadingPreview(false);
      }
    })();
  }, [token]);

  // ✅ Token-scoped public upload helper
  const uploadFile = async (file: File, field: string): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiClient.post<{ url: string; field: string }>(
      `/users/invite/${token}/upload?field=${field}`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !preview) return;

    // ✅ Client-side validation
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (preview.is_driver && (!formData.dl_number || !dlFrontFile)) {
      toast.error("Driving License number and DL image are required for Drivers.");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Upload selected documents (Cloudinary via token-scoped endpoint)
      let avatar_url: string | undefined;
      let id_image_url: string | undefined;
      let dl_image_url: string | undefined;

      if (avatarFile) avatar_url = await uploadFile(avatarFile, "avatar");
      if (idFrontFile) id_image_url = await uploadFile(idFrontFile, "id_front");
      if (dlFrontFile) dl_image_url = await uploadFile(dlFrontFile, "dl_front");

      // 2️⃣ Submit acceptance with the secure URLs
      await usersApi.acceptInvite({
        invite_token: token,
        password: formData.password,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim() || undefined,
        avatar_url,
        id_number: formData.id_number.trim() || undefined,
        id_image_url,
        dl_number: formData.dl_number.trim() || undefined,
        dl_image_url,
        dl_expiry: formData.dl_expiry || undefined,
      });

      setSuccess(true);
      toast.success("Account activated successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2500);
    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error, "Failed to activate account. The link may be expired or invalid.");
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loadingPreview) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
          <Loader2 size={20} className="animate-spin" aria-hidden="true" />
          <span className="text-sm font-medium">Loading your invitation...</span>
        </div>
      </div>
    );
  }

  // ─── Error State (invalid / expired / used) ────────────────────────────────
  if (pageError || !preview) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-[var(--color-danger-text)]" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Invalid Invite Link</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">{pageError || "This invite link is invalid or has expired."}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ─── Success State ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-8 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[var(--color-success-text)]" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Account Activated!</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            Your account has been successfully set up. Redirecting you to the login page...
          </p>
          <div className="flex justify-center">
            <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" aria-hidden="true" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Form State ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <NewUserForm
        loading={loading}
        preview={preview}
        formData={formData}
        updateField={updateField}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        idFrontFile={idFrontFile}
        setIdFrontFile={setIdFrontFile}
        dlFrontFile={dlFrontFile}
        setDlFrontFile={setDlFrontFile}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
          <Loader2 size={24} className="animate-spin text-[var(--color-ink-muted)]" aria-hidden="true" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}

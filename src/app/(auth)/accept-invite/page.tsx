"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import apiClient from "@/lib/api-client";
import NewUserForm, { UserInvitePreview } from "@/components/users/NewUserForm";
import { Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// Separate component that uses useSearchParams
function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<UserInvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
    password: "",
    confirmPassword: "",
    // ✅ Investor payout fields
    mpesa_phone: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("No invite token provided");
      setLoading(false);
      return;
    }

    // Fetch invite preview
    const fetchPreview = async () => {
      try {
        const res = await apiClient.get<UserInvitePreview>(`/users/invite/${token}/preview`);
        setPreview(res.data);
        
        // Pre-fill expected data
        setFormData(prev => ({
          ...prev,
          full_name: res.data.expected_full_name,
          email: res.data.expected_email,
        }));
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Invite not found. The link may be invalid or expired.");
        } else if (err.response?.status === 410) {
          setError("This invite has already been used or has expired.");
        } else {
          setError("Failed to load invite details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [token]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "investor") {
        router.push("/investor/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Check if investor
    const isInvestor = preview?.role === "investor";
    
    // Validate investor-specific fields
    if (isInvestor) {
      if (!formData.mpesa_phone && !formData.bank_name) {
        toast.error("Please provide at least one payout method (M-Pesa or Bank details)");
        return;
      }
    }

    setSubmitting(true);

    try {
      // Upload files first (if any) and get URLs
      // For now, we'll send null - you can implement file upload later
      const payload = {
        invite_token: token,
        password: formData.password,
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        id_number: formData.id_number,
        dl_number: formData.dl_number || null,
        dl_expiry: formData.dl_expiry || null,
        avatar_url: null, // TODO: Upload avatar and get URL
        id_image_url: null, // TODO: Upload ID image and get URL
        dl_image_url: null, // TODO: Upload DL image and get URL
        
        // ✅ Investor payout fields
        mpesa_phone: isInvestor ? formData.mpesa_phone || null : undefined,
        bank_name: isInvestor ? formData.bank_name || null : undefined,
        bank_account_number: isInvestor ? formData.bank_account_number || null : undefined,
        bank_account_name: isInvestor ? formData.bank_account_name || null : undefined,
      };

      await apiClient.post("/users/accept-invite", payload);
      
      toast.success("Account activated successfully! Please log in.");
      router.push("/login");
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to activate account";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-sm text-[var(--color-ink-muted)]">Loading invite details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-2xl border border-[var(--color-surface-border)] shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Invite Error</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!preview) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <NewUserForm
          loading={submitting}
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
    </div>
  );
}

// Main page component with Suspense boundary
export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}

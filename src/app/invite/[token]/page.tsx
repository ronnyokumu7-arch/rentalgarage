// src/app/(public)/invite/[token]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Clock, ShieldCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import NewClientForm from "@/components/client/NewClientForm";
import { env } from "@/lib/env";
import "@/app/public.css";

type PageStatus = "loading" | "ready" | "invalid" | "expired" | "submitting" | "success";

export default function PublicInvitePage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<PageStatus>("loading");
  const [branding, setBranding] = useState<{ name: string; logo?: string; phone?: string; email?: string } | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({
    full_name: "", email: "", phone: "", 
    id_type: "national_id", id_number: "", 
    dl_number: "", dl_expiry: "", 
    residential_address: "", work_address: "", 
    next_of_kin_name: "", next_of_kin_phone: ""
  });

  // ✅ Real file states (replacing dummyFile)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  // 1. Fetch Invite Preview (Branding + Validity)
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/clients/invite/${token}`);
        
        if (res.status === 410) {
          setStatus("expired");
          return;
        }
        if (!res.ok) {
          setStatus("invalid");
          return;
        }

        const data = await res.json();
        setBranding({
          name: data.tenant_name,
          logo: data.tenant_logo_url,
          phone: data.tenant_phone,
          email: data.tenant_email,
        });
        setStatus("ready");
      } catch (err) {
        console.error("Failed to fetch invite preview:", err);
        setStatus("invalid");
      }
    };

    if (token) fetchPreview();
  }, [token]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 2. Handle Form Submission (Upload-then-Create flow)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate required docs
    if (!idFrontFile || !dlFrontFile) {
      toast.error("ID Front and DL Front are required");
      return;
    }

    setStatus("submitting");

    try {
      // 1. Upload documents first (if any files are selected)
      const uploadedUrls: Record<string, string> = {};
      const uploadPromises: Promise<void>[] = [];

      const uploadDoc = async (file: File, field: string) => {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        
        const res = await fetch(
          `${env.NEXT_PUBLIC_API_URL}/clients/invite/${token}/upload?field=${field}`,
          { method: "POST", body: uploadFormData }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Upload failed");
        }

        const data = await res.json();
        uploadedUrls[field] = data.url;
      };

      if (avatarFile) uploadPromises.push(uploadDoc(avatarFile, "avatar"));
      if (idFrontFile) uploadPromises.push(uploadDoc(idFrontFile, "id_front"));
      if (idBackFile) uploadPromises.push(uploadDoc(idBackFile, "id_back"));
      if (dlFrontFile) uploadPromises.push(uploadDoc(dlFrontFile, "dl_front"));

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

// 2. Submit form with uploaded URLs
const payload = {
  full_name: formData.full_name,
  email: formData.email || null,
  phone: formData.phone,
  id_type: formData.id_type || "national_id",
  id_number: formData.id_number || null,
  dl_number: formData.dl_number || null,
  dl_expiry: formData.dl_expiry || null,
  residential_address: formData.residential_address || null,
  work_address: formData.work_address || null,
  next_of_kin_name: formData.next_of_kin_name || null,
  next_of_kin_phone: formData.next_of_kin_phone || null,
  avatar_image: uploadedUrls.avatar || null,
  id_image_front: uploadedUrls.id_front || null,
  id_image_back: uploadedUrls.id_back || null,
  dl_image_front: uploadedUrls.dl_front || null,
};

      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/clients/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        setStatus("success");
        return;
      }

      if (res.status === 410) {
        setStatus("expired");
        toast.error("This invite link has already been used or expired.");
        return;
      }

      if (res.status === 409) {
        const errorData = await res.json();
        const messages = Array.isArray(errorData.detail) ? errorData.detail : [errorData.detail];
        messages.forEach((msg: string) => toast.error(msg));
        setStatus("ready");
        return;
      }

      if (res.status === 422) {
        const errorData = await res.json();
        toast.error(errorData.detail?.[0]?.msg || "Please check your input and try again.");
        setStatus("ready");
        return;
      }

      throw new Error("Submission failed");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to upload documents");
      setStatus("ready");
    }
  };

  // --- UI STATES ---

  if (status === "loading") {
    return (
      <div className="public-root min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#6D28D9' }} />
          <p className="font-medium text-sm" style={{ color: '#57534E' }}>Verifying your invite link...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="public-root min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div 
          className="max-w-md w-full rounded-xl p-8 text-center"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 12px 24px -4px rgba(28, 25, 23, 0.10)',
            border: '1px solid rgba(28, 25, 23, 0.10)',
          }}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(185, 28, 28, 0.10)' }}
          >
            <AlertCircle className="h-8 w-8" style={{ color: '#B91C1C' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#1C1917' }}>Invalid Invite Link</h1>
          <p className="text-sm mb-6" style={{ color: '#57534E' }}>
            This link is invalid, broken, or could not be found. Please contact the agency to request a new onboarding link.
          </p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="public-root min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div 
          className="max-w-md w-full rounded-xl p-8 text-center"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 12px 24px -4px rgba(28, 25, 23, 0.10)',
            border: '1px solid rgba(28, 25, 23, 0.10)',
          }}
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(180, 83, 9, 0.10)' }}
          >
            <Clock className="h-8 w-8" style={{ color: '#B45309' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#1C1917' }}>Invite Expired or Used</h1>
          <p className="text-sm mb-6" style={{ color: '#57534E' }}>
            This single-use link has either expired or has already been used to create an account. Please contact the agency for assistance.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="public-root min-h-screen flex items-center justify-center p-4 sm:p-6">
        <Toaster position="top-center" />
        <div 
          className="max-w-lg w-full rounded-2xl p-8 text-center"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 20px 32px -6px rgba(28, 25, 23, 0.12)',
            border: '1px solid rgba(28, 25, 23, 0.10)',
          }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: 'rgba(4, 120, 87, 0.10)' }}
          >
            <CheckCircle2 className="h-10 w-10" style={{ color: '#047857' }} />
          </div>
          <h1 className="text-2xl font-extrabold mb-3" style={{ color: '#1C1917' }}>Application Submitted!</h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#57534E' }}>
            Thank you, <span className="font-bold" style={{ color: '#1C1917' }}>{formData.full_name}</span>. Your profile has been successfully submitted to <span className="font-bold" style={{ color: '#1C1917' }}>{branding?.name}</span>.
          </p>
          
          <div 
            className="rounded-xl p-4 text-left space-y-3 mb-6"
            style={{
              background: 'rgba(29, 78, 216, 0.05)',
              border: '1px solid rgba(29, 78, 216, 0.20)',
            }}
          >
            <h3 
              className="text-sm font-bold flex items-center gap-2"
              style={{ color: '#1D4ED8' }}
            >
              <ShieldCheck size={16} /> What happens next?
            </h3>
            <ul className="text-xs space-y-2" style={{ color: '#1D4ED8' }}>
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span> The agency will review your details and verify your identity.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span> Once approved, your account will be activated.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span> You will receive a notification when your account is ready to use.
              </li>
            </ul>
          </div>

          <p className="text-[10px]" style={{ color: '#78716C' }}>
            You can safely close this window. {branding?.phone && (
              <>If you have questions, call the agency at <a href={`tel:${branding.phone}`} className="font-bold hover:underline" style={{ color: '#6D28D9' }}>{branding.phone}</a>.</>
            )}
          </p>
        </div>
      </div>
    );
  }

  // --- READY STATE: The Form ---
  return (
    <div className="public-root min-h-screen pb-12" style={{ backgroundColor: '#FFFFFF' }}>
      <Toaster position="top-center" />
      <NewClientForm
        loading={status === "submitting"}
        formData={formData}
        updateField={updateField}
        handleSubmit={handleSubmit}
        mode="public_intake"
        tenantBranding={branding || undefined}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        idFrontFile={idFrontFile}
        setIdFrontFile={setIdFrontFile}
        idBackFile={idBackFile}
        setIdBackFile={setIdBackFile}
        dlFrontFile={dlFrontFile}
        setDlFrontFile={setDlFrontFile}
      />
    </div>
  );
}

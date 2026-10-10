"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, Clock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import NewClientForm from "@/components/client/NewClientForm";
import { env } from "@/lib/env";
import { getApiErrorMessageFromBody } from "@/lib/api-error";
import "@/app/public.css";

type PageStatus = "loading" | "ready" | "invalid" | "expired" | "submitting" | "success";

export default function PublicInvitePage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<PageStatus>("loading");
  const [branding, setBranding] = useState<{ name: string; logo?: string; phone?: string; email?: string } | null>(null);
  
  // ✅ FIX 1: Initialize ALL fields that NewClientForm expects and backend requires
  const [formData, setFormData] = useState<Record<string, string>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    id_type: "national_id",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
    dl_issued_date: "",
    residential_address: "",
    work_address: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
    driving_arrangement: "self_drive",
    driver_full_name: "",
    driver_phone: "",
    driver_id_number: "",
    driver_dl_number: "",
    driver_dl_expiry: "",
    driver_dl_issued_date: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/clients/invite/${token}`);
        if (res.status === 410) { setStatus("expired"); return; }
        if (!res.ok) { setStatus("invalid"); return; }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ FIX 2: Backend strictly requires ID Front and ID Back
    if (!idFrontFile || !idBackFile) {
      toast.error("ID Front and ID Back photos are required");
      return;
    }

    setStatus("submitting");

    try {
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
          throw new Error(getApiErrorMessageFromBody(errorData, "Unable to upload this document."));
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

      // ✅ FIX 3: Perfectly match the backend ClientIntakeCreate contract
      const payload = {
        // Required Strings
        first_name: formData.first_name?.trim() || "",
        last_name: formData.last_name?.trim() || "",
        phone: formData.phone?.trim() || "",
        id_type: formData.id_type || "national_id",
        id_number: formData.id_number?.trim().toUpperCase() || "",

        // Optional Strings (MUST be undefined, NOT null or "")
        email: formData.email?.trim() || undefined,
        dl_number: formData.dl_number?.trim().toUpperCase() || undefined,
        residential_address: formData.residential_address?.trim() || undefined,
        work_address: formData.work_address?.trim() || undefined,
        next_of_kin_name: formData.next_of_kin_name?.trim() || undefined,
        next_of_kin_phone: formData.next_of_kin_phone?.trim() || undefined,

        // Dates (MUST be undefined or valid date string, NOT null)
        dl_expiry: formData.dl_expiry || undefined,
        dl_issued_date: formData.dl_issued_date || undefined,

        driving_arrangement: formData.driving_arrangement || "self_drive",

        // Nested Driver Object (MUST be null if not own_driver)
        driver: formData.driving_arrangement === "own_driver" 
          ? {
              full_name: formData.driver_full_name?.trim() || "",
              phone: formData.driver_phone?.trim() || "",
              id_number: formData.driver_id_number?.trim().toUpperCase() || "",
              dl_number: formData.driver_dl_number?.trim().toUpperCase() || "",
              dl_expiry: formData.driver_dl_expiry || undefined,
              dl_issued_date: formData.driver_dl_issued_date || undefined,
            }
          : null,

        // Document URLs (Backend requires id_image_front/back as strings)
        avatar_image: uploadedUrls.avatar || undefined,
        id_image_front: uploadedUrls.id_front || "", 
        id_image_back: uploadedUrls.id_back || "",   
        dl_image_front: uploadedUrls.dl_front || undefined,
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
        const errorData = await res.json();
        toast.error(getApiErrorMessageFromBody(errorData, "This invite link is no longer valid."));
        return;
      }

      if (res.status === 409) {
        const errorData = await res.json();
        toast.error(getApiErrorMessageFromBody(errorData, "These details are already registered."));
        setStatus("ready");
        return;
      }

      if (res.status === 422) {
        const errorData = await res.json();
        console.error("422 Validation Error:", errorData); // Logs exact failing field to console
        toast.error(getApiErrorMessageFromBody(errorData, "Please check your input and try again."));
        setStatus("ready");
        return;
      }

      throw new Error("Submission failed");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "Failed to submit application");
      setStatus("ready");
    }
  };

  // --- UI STATES (Loading, Invalid, Expired, Success) ---
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
        <div className="max-w-md w-full rounded-xl p-8 text-center bg-white shadow-lg border border-stone-200">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-700" />
          </div>
          <h1 className="text-xl font-bold mb-2 text-stone-900">Invalid Invite Link</h1>
          <p className="text-sm text-stone-600">This link is invalid or broken. Please contact the agency for a new link.</p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="public-root min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full rounded-xl p-8 text-center bg-white shadow-lg border border-stone-200">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-100">
            <Clock className="h-8 w-8 text-amber-700" />
          </div>
          <h1 className="text-xl font-bold mb-2 text-stone-900">Invite Expired or Used</h1>
          <p className="text-sm text-stone-600">This single-use link has expired or been used. Please contact the agency.</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="public-root min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full rounded-2xl p-8 text-center bg-white shadow-xl border border-stone-200">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-extrabold mb-3 text-stone-900">Application Submitted!</h1>
          <p className="text-sm leading-relaxed mb-6 text-stone-600">
            Thank you, <span className="font-bold text-stone-900">{formData.first_name} {formData.last_name}</span>. Your profile has been submitted to <span className="font-bold text-stone-900">{branding?.name}</span>.
          </p>
          <div className="rounded-xl p-4 text-left space-y-3 mb-6 bg-blue-50 border border-blue-200">
            <h3 className="text-sm font-bold flex items-center gap-2 text-blue-800">
              <ShieldCheck size={16} /> What happens next?
            </h3>
            <ul className="text-xs space-y-2 text-blue-800">
              <li className="flex items-start gap-2"><span className="font-bold">1.</span> The agency will review your details.</li>
              <li className="flex items-start gap-2"><span className="font-bold">2.</span> Once approved, your account will be activated.</li>
            </ul>
          </div>
          <p className="text-[10px] text-stone-500">
            You can safely close this window. {branding?.phone && (
              <>Questions? Call <a href={`tel:${branding.phone}`} className="font-bold hover:underline text-purple-700">{branding.phone}</a>.</>
            )}
          </p>
        </div>
      </div>
    );
  }

  // --- READY STATE: The Form ---
  return (
    <div className="public-root min-h-screen pb-12 bg-white">
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

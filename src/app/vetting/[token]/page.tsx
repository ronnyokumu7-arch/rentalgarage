// src/app/vetting/[token]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Camera, CheckCircle, AlertTriangle, Loader2, ShieldCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";

type VettingPreview = {
  person_type: "client" | "driver";
  tenant_name: string;
  tenant_logo_url: string | null;
  tenant_phone: string | null;
  tenant_email: string | null;
  expires_at: string;
  person_first_name: string;
  steps: string[];
};

export default function VettingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [preview, setPreview] = useState<VettingPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [step, setStep] = useState<"preview" | "upload" | "success">("preview");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await apiClient.get<VettingPreview>(`/vetting/preview/${token}`);
        setPreview(res.data);
      } catch (err: any) {
        if (err.response?.status === 410) {
          setError("This verification link has expired or was already used. Please contact the agency for a new link.");
        } else {
          setError("Invalid or expired verification link.");
        }
        setLoading(false);
      }
    };
    fetchPreview();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadAndSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please take or select a photo first.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload Selfie
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      await apiClient.post(`/vetting/${token}/upload-selfie`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // 2. Submit Vetting
      setSubmitting(true);
      await apiClient.post(`/vetting/${token}/submit`, {
        selfie_with_id: "uploaded", // Payload expects this key, value doesn't matter as backend checks DB
      });

      setStep("success");
      toast.success("Verification submitted successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to upload. Please try again.";
      toast.error(msg);
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-6 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-ink)] mb-2">Link Invalid</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">{error || "This link is no longer valid."}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-8 text-center shadow-lg animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Submission Received!</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6">
            Thank you, {preview.person_first_name}. Your identity has been securely submitted and is now under review by {preview.tenant_name}. 
            You will be notified once your account is activated.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 p-6 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center gap-3 mb-4">
            {preview.tenant_logo_url ? (
              <img src={preview.tenant_logo_url} alt={preview.tenant_name} className="w-12 h-12 rounded-lg object-contain bg-white p-1" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Verification for</p>
              <p className="text-lg font-extrabold text-[var(--color-ink)]">{preview.tenant_name}</p>
            </div>
          </div>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">
            Hi, {preview.person_first_name}! 👋
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            To complete your onboarding, we need to verify your identity. Please take a clear selfie holding your ID document next to your face.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {step === "preview" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
                  <Camera size={16} className="text-blue-500" />
                  Instructions
                </h3>
                <ul className="text-xs text-[var(--color-ink-muted)] space-y-2 list-disc list-inside">
                  <li>Ensure your face and the ID document are clearly visible.</li>
                  <li>Make sure the text on the ID is readable.</li>
                  <li>Avoid harsh shadows or glare.</li>
                </ul>
              </div>
              
              <button
                onClick={() => setStep("upload")}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2"
              >
                <Camera size={16} />
                Start Verification
              </button>
            </div>
          )}

          {step === "upload" && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  previewUrl 
                    ? "border-[var(--color-primary)] bg-[var(--color-surface-hover)]" 
                    : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user" // ✅ Forces front-facing camera on mobile
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Selfie preview" className="absolute inset-0 w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-3">
                      <Camera size={24} className="text-[var(--color-ink-muted)]" />
                    </div>
                    <p className="text-sm font-bold text-[var(--color-ink)]">Tap to take a selfie</p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">or choose from your gallery</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("preview")}
                  disabled={uploading || submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleUploadAndSubmit}
                  disabled={!selectedFile || uploading || submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(uploading || submitting) ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {uploading ? "Uploading..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[var(--color-surface-hover)]/50 border-t border-[var(--color-surface-border)] text-center">
          <p className="text-[10px] text-[var(--color-ink-subtle)]">
            Secure verification powered by {preview.tenant_name} · Expires {new Date(preview.expires_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

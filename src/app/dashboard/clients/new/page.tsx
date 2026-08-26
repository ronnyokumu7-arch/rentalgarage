// src/app/dashboard/clients/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { clientsApi } from "@/lib/api/clients";
import type { ClientCreate } from "@/lib/types";
import NewClientForm from "@/components/client/NewClientForm";

type UploadKey = "avatar" | "idFront" | "idBack" | "dlFront";
type Phase = "idle" | "creating" | "uploading";

export default function NewClientPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const loading = phase !== "idle";

  // File states for uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [dlFrontFile, setDlFrontFile] = useState<File | null>(null);

  // ✅ RESUME STATE: survives partial failures (no phantom duplicates on retry)
  const [createdClientId, setCreatedClientId] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Set<UploadKey>>(new Set());

  // ✅ INLINE VALIDATION: field key → message; rendered by NewClientForm
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    id_type: "national_id",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
    residential_address: "",
    work_address: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
  });

  // ✅ FIELD-LEVEL VALIDATION: tells the user exactly what's missing
  const validate = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formData.full_name?.trim()) errors.full_name = "Full name is required.";

    const phoneDigits = (formData.phone || "").replace(/\D/g, "");
    if (!formData.phone?.trim()) errors.phone = "Phone number is required.";
    else if (phoneDigits.length < 9) errors.phone = "Enter a valid phone number.";

    if (!formData.id_number?.trim())
      errors.id_number = formData.id_type === "passport" ? "Passport number is required." : "National ID number is required.";

    if (formData.email?.trim() && !/^\S+@\S+\.\S+$/.test(formData.email.trim()))
      errors.email = "Enter a valid email address.";

    return errors;
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // ✅ Clear the field's error as soon as the user starts fixing it
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ VALIDATE FIRST: highlight + scroll to what's missing (no generic toast)
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const count = Object.keys(errors).length;
      toast.error(`Please complete the ${count} highlighted field${count > 1 ? "s" : ""}.`);
      setTimeout(() => {
        const first = Object.keys(errors)[0];
        document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
      return;
    }
    setFieldErrors({});

    let clientId = createdClientId;

    // ─── STEP 1: Create client (skip if already committed on a prior attempt) ──
    if (!clientId) {
      setPhase("creating");
      try {
        const payload: ClientCreate = {
          full_name: formData.full_name,
          email: formData.email || null,
          phone: formData.phone,
          id_type: (formData.id_type as "national_id" | "passport") || "national_id",
          id_number: formData.id_number || null,
          dl_number: formData.dl_number || null,
          dl_expiry: formData.dl_expiry || null,
          residential_address: formData.residential_address || null,
          work_address: formData.work_address || null,
          next_of_kin_name: formData.next_of_kin_name || null,
          next_of_kin_phone: formData.next_of_kin_phone || null,
        };

        const newClient = await clientsApi.create(payload);
        clientId = newClient.id;
        setCreatedClientId(clientId);
        toast.success("Client profile created");
      } catch (error: unknown) {
        const err = error as {
          response?: { status?: number; data?: { detail?: string | string[] } };
        };
        const status = err.response?.status;
        const detail = err.response?.data?.detail;

        // ✅ 409 RECOVERY: prior attempt committed the client, failed on upload.
        if (status === 409) {
          toast.loading("Client already exists — resuming uploads...", { duration: 800 });
          try {
            const existing = await clientsApi.list({ search: formData.phone, page_size: 5 });
            const match = existing.find((c) => {
              const a = (c.phone || "").replace(/\D/g, "");
              const b = (formData.phone || "").replace(/\D/g, "");
              return a && b && a === b;
            });
            if (match) {
              clientId = match.id;
              setCreatedClientId(clientId);
            } else {
              const msg = Array.isArray(detail) ? detail.join("; ") : (detail || "A client with these details already exists.");
              toast.error(msg);
              setPhase("idle");
              return;
            }
          } catch {
            toast.error("A client with these details already exists.");
            setPhase("idle");
            return;
          }
        } else {
          const msg = Array.isArray(detail) ? detail.join("; ") : (typeof detail === "string" ? detail : "Failed to create client");
          toast.error(msg);
          setPhase("idle");
          return;
        }
      }
    }

    // ─── STEP 2: Upload documents (only files not yet uploaded) ──────────────
    if (!clientId) {
      setPhase("idle");
      toast.error("Could not resolve client. Please try again.");
      return;
    }

    const pending: { key: UploadKey; label: string; file: File }[] = [];
    if (avatarFile && !uploadedFiles.has("avatar"))
      pending.push({ key: "avatar", label: "Avatar", file: avatarFile });
    if (idFrontFile && !uploadedFiles.has("idFront"))
      pending.push({ key: "idFront", label: "ID front", file: idFrontFile });
    if (idBackFile && !uploadedFiles.has("idBack"))
      pending.push({ key: "idBack", label: "ID back", file: idBackFile });
    if (dlFrontFile && !uploadedFiles.has("dlFront"))
      pending.push({ key: "dlFront", label: "Driving licence", file: dlFrontFile });

    if (pending.length === 0) {
      router.push("/dashboard/clients");
      return;
    }

    setPhase("uploading");

    const uploaders = {
      avatar: (id: number, f: File) => clientsApi.uploadAvatar(id, f),
      idFront: (id: number, f: File) => clientsApi.uploadIdFront(id, f),
      idBack: (id: number, f: File) => clientsApi.uploadIdBack(id, f),
      dlFront: (id: number, f: File) => clientsApi.uploadDlFront(id, f),
    };

    const results = await Promise.allSettled(
      pending.map((p) => uploaders[p.key](clientId!, p.file)),
    );

    const succeeded: UploadKey[] = [];
    const failed: { key: UploadKey; label: string }[] = [];
    results.forEach((res, i) => {
      if (res.status === "fulfilled") succeeded.push(pending[i].key);
      else failed.push({ key: pending[i].key, label: pending[i].label });
    });

    setUploadedFiles((prev) => {
      const next = new Set(prev);
      succeeded.forEach((k) => next.add(k));
      return next;
    });

    // ─── STEP 3: Report + decide navigation ──────────────────────────────────
    if (failed.length === 0) {
      toast.success("All documents uploaded — onboarding complete");
      router.push("/dashboard/clients");
    } else if (succeeded.length === 0) {
      toast.error(`Uploads failed: ${failed.map((f) => f.label).join(", ")}. You can retry.`);
    } else {
      toast.error(`Uploaded ${succeeded.length}/${pending.length}. Failed: ${failed.map((f) => f.label).join(", ")}. Retry to continue.`);
    }

    setPhase("idle");
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-[var(--color-bg)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-surface-border)] px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/dashboard/clients")} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
            <ArrowLeft size={16} /> Back to Clients
          </button>
          <h1 className="text-base font-bold text-[var(--color-ink)]">New Client Onboarding</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Form */}
      <NewClientForm
        mode="create"
        loading={loading}
        formData={formData}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
        idFrontFile={idFrontFile}
        setIdFrontFile={setIdFrontFile}
        idBackFile={idBackFile}
        setIdBackFile={setIdBackFile}
        dlFrontFile={dlFrontFile}
        setDlFrontFile={setDlFrontFile}
        updateField={updateField}
        handleSubmit={handleSubmit}
        fieldErrors={fieldErrors}
        existingAvatar={null}
        existingIdFront={null}
        existingIdBack={null}
        existingDlFront={null}
      />
    </div>
  );
}

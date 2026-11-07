"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, ShieldCheck, Upload } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";

type VettingPreview = {
  person_type: "client" | "driver";
  tenant_name: string;
  tenant_logo_url: string | null;
  expires_at: string;
  person_first_name: string;
  id_front_uploaded: boolean;
  driving_arrangement: Arrangement | null;
  dl_number: string | null;
  dl_expiry: string | null;
  dl_issued_date: string | null;
  driver_full_name: string | null;
  driver_phone: string | null;
  driver_id_number: string | null;
  driver_dl_number: string | null;
  driver_dl_expiry: string | null;
  driver_dl_issued_date: string | null;
  uploaded_slots?: DocumentSlot[];
  selfie_uploaded?: boolean;
};

type Step = "details" | "selfie" | "success";
type Arrangement = "self_drive" | "own_driver" | "chauffeur";
type DocumentSlot = "id_front" | "dl_front" | "driver_id_front" | "driver_dl_front";

const INITIAL_DOCUMENTS: Record<DocumentSlot, File | null> = {
  id_front: null,
  dl_front: null,
  driver_id_front: null,
  driver_dl_front: null,
};

const inputClass = "w-full rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "image/avif", "image/bmp", "image/tiff",
];

export default function VettingPage() {
  const token = typeof window === "undefined" ? "" : window.location.pathname.split("/").pop() || "";
  const [preview, setPreview] = useState<VettingPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("details");
  const [arrangement, setArrangement] = useState<Arrangement>("self_drive");
  const [driving, setDriving] = useState({
    dl_number: "", dl_issued_date: "", dl_expiry: "",
    driver_full_name: "", driver_phone: "", driver_id_number: "",
    driver_dl_number: "", driver_dl_issued_date: "", driver_dl_expiry: "",
  });
  const [documents, setDocuments] = useState<Record<DocumentSlot, File | null>>(INITIAL_DOCUMENTS);
  const [uploadedSlots, setUploadedSlots] = useState<Set<DocumentSlot>>(new Set());
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const selfieInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    apiClient.get<VettingPreview>(`/vetting/preview/${token}`)
      .then(({ data }) => {
        setPreview(data);
        if (data.driving_arrangement) setArrangement(data.driving_arrangement);
        setDriving({
          dl_number: data.dl_number || "",
          dl_issued_date: data.dl_issued_date || "",
          dl_expiry: data.dl_expiry || "",
          driver_full_name: data.driver_full_name || "",
          driver_phone: data.driver_phone || "",
          driver_id_number: data.driver_id_number || "",
          driver_dl_number: data.driver_dl_number || "",
          driver_dl_issued_date: data.driver_dl_issued_date || "",
          driver_dl_expiry: data.driver_dl_expiry || "",
        });
        setUploadedSlots(new Set(data.uploaded_slots ?? (data.id_front_uploaded ? ["id_front"] : [])));
        if (data.person_type === "driver") setStep("selfie");
      })
      .catch((requestError: { response?: { status?: number } }) => {
        setError(requestError.response?.status === 410
          ? "This verification link has expired or was already used."
          : "This verification link is invalid or unavailable.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const updateDriving = (field: keyof typeof driving, value: string) => {
    if (driving[field] === value) return;
    setDriving((current) => ({ ...current, [field]: value }));
    const invalidatedSlots: DocumentSlot[] = field.startsWith("driver_")
      ? ["driver_id_front", "driver_dl_front"]
      : ["dl_front"];
    setUploadedSlots((current) => {
      const next = new Set(current);
      invalidatedSlots.forEach((slot) => next.delete(slot));
      return next;
    });
    setDocuments((current) => ({
      ...current,
      ...Object.fromEntries(invalidatedSlots.map((slot) => [slot, null])),
    }));
  };

  const requiredSlots: DocumentSlot[] = [
    "id_front",
    ...(arrangement === "self_drive"
      ? ["dl_front" as const]
      : arrangement === "own_driver"
        ? ["driver_id_front" as const, "driver_dl_front" as const]
        : []),
  ];

  const selectArrangement = (nextArrangement: Arrangement) => {
    if (nextArrangement === arrangement) return;
    const arrangementSlots: DocumentSlot[] = ["dl_front", "driver_id_front", "driver_dl_front"];
    setArrangement(nextArrangement);
    setUploadedSlots((current) => {
      const next = new Set(current);
      arrangementSlots.forEach((slot) => next.delete(slot));
      return next;
    });
    setDocuments((current) => ({
      ...current,
      dl_front: null,
      driver_id_front: null,
      driver_dl_front: null,
    }));
  };

  const selectDocument = (slot: DocumentSlot, file: File | undefined) => {
    if (!file) return;
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a supported image format.");
      return;
    }
    setDocuments((current) => ({ ...current, [slot]: file }));
  };

  const saveVerificationDetails = async () => {
    const missing = requiredSlots.find((slot) => !uploadedSlots.has(slot) && !documents[slot]);
    if (missing) {
      toast.error("Upload every required document before continuing.");
      return;
    }

    setSaving(true);
    try {
      const payload = arrangement === "self_drive"
        ? { driving_arrangement: arrangement, dl_number: driving.dl_number, dl_issued_date: driving.dl_issued_date || undefined, dl_expiry: driving.dl_expiry }
        : arrangement === "own_driver"
          ? {
              driving_arrangement: arrangement,
              driver_full_name: driving.driver_full_name,
              driver_phone: driving.driver_phone,
              driver_id_number: driving.driver_id_number,
              driver_dl_number: driving.driver_dl_number,
              driver_dl_issued_date: driving.driver_dl_issued_date || undefined,
              driver_dl_expiry: driving.driver_dl_expiry,
            }
          : { driving_arrangement: arrangement };
      await apiClient.put(`/vetting/${token}/driving-details`, payload);
      for (const slot of requiredSlots) {
        if (uploadedSlots.has(slot) && !documents[slot]) continue;
        const file = documents[slot];
        if (!file) {
          throw new Error(`Missing required document: ${slot}`);
        }
        const formData = new FormData();
        formData.append("file", file);
        await apiClient.post(`/vetting/${token}/upload-document`, formData, { params: { slot } });
        setUploadedSlots((current) => new Set(current).add(slot));
        setDocuments((current) => ({ ...current, [slot]: null }));
      }
      setStep("selfie");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We could not save your details or upload a document. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const selectSelfie = (file: File | undefined) => {
    if (!file || !SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Take or choose a supported image format.");
      return;
    }
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfie(file);
    setSelfiePreview(URL.createObjectURL(file));
  };

  const submitVerification = async () => {
    if (!selfie && !preview?.selfie_uploaded) {
      toast.error("Take a selfie holding your ID to continue.");
      return;
    }
    setSaving(true);
    try {
      if (selfie) {
        const formData = new FormData();
        formData.append("file", selfie);
        await apiClient.post(`/vetting/${token}/upload-selfie`, formData);
      }
      await apiClient.post(`/vetting/${token}/submit`, { selfie_with_id: "uploaded" });
      setStep("success");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Your verification could not be submitted. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (error || !preview) return <div className="min-h-screen flex items-center justify-center p-4 text-center"><p>{error || "Verification is unavailable."}</p></div>;
  if (step === "success") return <div className="min-h-screen flex items-center justify-center p-4"><div className="max-w-md rounded-2xl bg-[var(--color-surface)] p-8 text-center shadow-xl"><ShieldCheck className="mx-auto mb-4 text-emerald-500" size={40} /><h1 className="text-xl font-bold">Verification submitted</h1><p className="mt-2 text-sm text-[var(--color-ink-muted)]">{preview.tenant_name} will review your documents and notify you of the outcome.</p></div></div>;

  const DocumentCard = ({ slot, label }: { slot: DocumentSlot; label: string }) => (
    <div className="rounded-xl border border-[var(--color-surface-border)] p-3">
      <p className="text-xs font-bold text-[var(--color-ink)]">{label}</p>
      <p className="mt-1 truncate text-[10px] text-[var(--color-ink-muted)]">
        {documents[slot]?.name || (uploadedSlots.has(slot) ? "Already uploaded" : "Not selected")}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="cursor-pointer rounded-lg bg-[var(--color-surface-hover)] px-2 py-2 text-center text-[10px] font-bold"><Upload size={12} className="mr-1 inline" />Device<input className="hidden" type="file" accept={SUPPORTED_IMAGE_TYPES.join(",")} onChange={(event) => selectDocument(slot, event.target.files?.[0])} /></label>
        <label className="cursor-pointer rounded-lg bg-[var(--color-primary)]/10 px-2 py-2 text-center text-[10px] font-bold text-[var(--color-primary)]"><Camera size={12} className="mr-1 inline" />Camera<input className="hidden" type="file" accept={SUPPORTED_IMAGE_TYPES.join(",")} capture="environment" onChange={(event) => selectDocument(slot, event.target.files?.[0])} /></label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-8">
      <main className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] shadow-xl">
        <header className="border-b border-[var(--color-surface-border)] p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
            {preview.tenant_name}
          </p>
          <h1 className="mt-1 text-xl font-bold">Identity verification</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Hi, {preview.person_first_name}. Complete these steps to activate your account.
          </p>
        </header>
        <section className="space-y-5 p-6">
          {step === "details" && preview.person_type === "client" && (
            <>
              <div>
                <h2 className="font-bold">1. Driving details and documents</h2>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  Choose your driving arrangement and upload clear document photos from your device or camera.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["self_drive", "own_driver", "chauffeur"] as Arrangement[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectArrangement(option)}
                    className={`rounded-xl border p-3 text-xs font-bold ${
                      arrangement === option
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : "border-[var(--color-surface-border)]"
                    }`}
                  >
                    {option === "self_drive" ? "Self Drive" : option === "own_driver" ? "My Driver" : "Chauffeur"}
                  </button>
                ))}
              </div>

              {arrangement === "self_drive" && (
                <div className="space-y-3">
                  <input className={inputClass} placeholder="Driving licence number" value={driving.dl_number} onChange={(event) => updateDriving("dl_number", event.target.value)} />
                  <label className="block text-xs font-bold">
                    Date of Issue (optional)
                    <input className={`${inputClass} mt-1`} type="date" value={driving.dl_issued_date} onChange={(event) => updateDriving("dl_issued_date", event.target.value)} />
                  </label>
                  <label className="block text-xs font-bold">
                    Expiry date
                    <input className={`${inputClass} mt-1`} type="date" value={driving.dl_expiry} onChange={(event) => updateDriving("dl_expiry", event.target.value)} />
                  </label>
                </div>
              )}

              {arrangement === "own_driver" && (
                <div className="space-y-3">
                  {([
                    ["driver_full_name", "Driver full name", "text"],
                    ["driver_phone", "Driver phone", "tel"],
                    ["driver_id_number", "Driver ID number", "text"],
                    ["driver_dl_number", "Driver licence number", "text"],
                    ["driver_dl_issued_date", "Licence issue date (optional)", "date"],
                    ["driver_dl_expiry", "Licence expiry date", "date"],
                  ] as const).map(([field, label, type]) => (
                    <label key={field} className="block text-xs font-bold">
                      {label}
                      <input className={`${inputClass} mt-1`} type={type} value={driving[field]} onChange={(event) => updateDriving(field, event.target.value)} />
                    </label>
                  ))}
                </div>
              )}

              <div className="space-y-3 border-t border-[var(--color-surface-border)] pt-4">
                <h3 className="text-sm font-bold">Upload documents</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DocumentCard slot="id_front" label="ID front" />
                  {arrangement === "self_drive" && <DocumentCard slot="dl_front" label="Driving licence front" />}
                  {arrangement === "own_driver" && (
                    <>
                      <DocumentCard slot="driver_id_front" label="Driver ID front" />
                      <DocumentCard slot="driver_dl_front" label="Driver licence front" />
                    </>
                  )}
                </div>
              </div>
              <button type="button" onClick={saveVerificationDetails} disabled={saving} className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white disabled:opacity-50">
                {saving ? "Saving and uploading…" : "Continue to selfie"}
              </button>
            </>
          )}

          {step === "selfie" && (
            <>
              <div>
                <h2 className="font-bold">2. Camera selfie with ID</h2>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  Use your camera. Hold your ID beside your face and keep both clearly inside the frame.
                </p>
              </div>
              <div onClick={() => selfieInput.current?.click()} className="relative flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5">
                {selfiePreview ? (
                  <img src={selfiePreview} alt="Selfie preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto mb-2" />
                    <p className="text-sm font-bold">Take selfie with ID</p>
                  </div>
                )}
                <input ref={selfieInput} className="hidden" type="file" accept={SUPPORTED_IMAGE_TYPES.join(",")} capture="user" onChange={(event) => selectSelfie(event.target.files?.[0])} />
              </div>
              {preview.selfie_uploaded && !selfie && (
                <p className="text-center text-xs text-[var(--color-ink-muted)]">Your selfie is already uploaded.</p>
              )}
              <button type="button" onClick={submitVerification} disabled={saving || (!selfie && !preview.selfie_uploaded)} className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white disabled:opacity-50">
                {saving ? "Submitting…" : "Submit verification"}
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

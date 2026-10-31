// src/components/client/NewClientForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Car } from "lucide-react";
import SecureLightbox from "@/components/ui/SecureLightbox";
import ClientDetailsSection from "./form/ClientDetailsSection";
import DrivingArrangementSection from "./form/DrivingArrangementSection";
import EmergencyContactSection from "./form/EmergencyContactSection";
import PreviewCard from "./form/PreviewCard";
import SubmitCard from "./form/SubmitCard";
import type { TenantBranding } from "./form/types";

/**
 * NOTE: ComplianceSection is intentionally NOT mounted here.
 * Its DL fields/uploads are owned by DrivingArrangementSection's
 * self_drive branch, and its address fields are already rendered by
 * ClientDetailsSection. Re-mounting it would duplicate fieldIds
 * (notably `field-dlFront`) and DL inputs.
 */

interface NewClientFormProps {
  loading: boolean;
  formData: Record<string, string>;
  avatarFile: File | null;
  setAvatarFile: (f: File | null) => void;
  idFrontFile: File | null;
  setIdFrontFile: (f: File | null) => void;
  idBackFile: File | null;
  setIdBackFile: (f: File | null) => void;
  dlFrontFile: File | null;
  setDlFrontFile: (f: File | null) => void;
  driverIdFrontFile?: File | null;
  setDriverIdFrontFile?: (f: File | null) => void;
  driverDlFrontFile?: File | null;
  setDriverDlFrontFile?: (f: File | null) => void;
  updateField: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  mode?: "create" | "edit" | "public_intake";
  tenantBranding?: TenantBranding;
  fieldErrors?: Record<string, string>;
  existingAvatar?: string | null;
  existingIdFront?: string | null;
  existingIdBack?: string | null;
  existingDlFront?: string | null;
  // ✅ Client-owned driver document URLs (edit mode)
  existingDriverIdFront?: string | null;
  existingDriverDlFront?: string | null;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";

export default function NewClientForm({
  loading,
  formData,
  avatarFile,
  setAvatarFile,
  idFrontFile,
  setIdFrontFile,
  idBackFile,
  setIdBackFile,
  dlFrontFile,
  setDlFrontFile,
  driverIdFrontFile = null,
  setDriverIdFrontFile = () => {},
  driverDlFrontFile = null,
  setDriverDlFrontFile = () => {},
  updateField,
  handleSubmit,
  mode = "create",
  tenantBranding,
  fieldErrors = {},
  existingAvatar,
  existingIdFront,
  existingIdBack,
  existingDlFront,
  existingDriverIdFront,
  existingDriverDlFront,
}: NewClientFormProps) {
  const isPublicIntake = mode === "public_intake";
  const drivingArrangement = formData.driving_arrangement || "self_drive";
  const isSelfDrive = drivingArrangement === "self_drive";
  const isOwnDriver = drivingArrangement === "own_driver";

  const [lightbox, setLightbox] = useState<{ url: string; title: string } | null>(null);

  const openLightbox = (url: string, title: string) => {
    setLightbox({ url, title });
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.url) openLightbox(detail.url, detail.title || "Document");
    };
    window.addEventListener("doc-preview", handler);
    return () => window.removeEventListener("doc-preview", handler);
  }, []);

  const hasErr = (key: string) => !!fieldErrors[key];
  const inputCls = (key: string) =>
    hasErr(key)
      ? inputClass
          .replace("border-[var(--color-surface-border)]", "border-[var(--color-danger)]")
          .replace(
            "focus:ring-[var(--color-primary)]/30",
            "focus:ring-[var(--color-danger)]/20"
          )
          .replace(
            "focus:border-[var(--color-primary)]",
            "focus:border-[var(--color-danger)]"
          )
      : inputClass;

  const renderError = (key: string) =>
    hasErr(key) ? (
      <p className="text-[10px] font-medium text-[var(--color-danger)] mt-1.5 flex items-center gap-1">
        {fieldErrors[key]}
      </p>
    ) : null;

  // ── Document counters (new File OR existing URL both count) ──
  const hasDoc = (file: File | null, existing?: string | null) =>
    !!file || !!existing;

  const clientDocsUploaded =
    (hasDoc(idFrontFile, existingIdFront) ? 1 : 0) +
    (hasDoc(idBackFile, existingIdBack) ? 1 : 0);
  const clientDocsRequired = 2;

  const drivingDocsUploaded = isSelfDrive
    ? hasDoc(dlFrontFile, existingDlFront)
      ? 1
      : 0
    : 0;
  const drivingDocsRequired = isSelfDrive ? 1 : 0;

  const driverDocsUploaded = isOwnDriver
    ? (hasDoc(driverIdFrontFile, existingDriverIdFront) ? 1 : 0) +
      (hasDoc(driverDlFrontFile, existingDriverDlFront) ? 1 : 0)
    : 0;
  const driverDocsRequired = isOwnDriver ? 2 : 0;

  const totalDocsUploaded =
    clientDocsUploaded + drivingDocsUploaded + driverDocsUploaded;
  const totalDocsRequired =
    clientDocsRequired + drivingDocsRequired + driverDocsRequired;

  const sectionProps = {
    formData,
    updateField,
    fieldErrors,
    hasErr,
    inputCls,
    renderError,
    openLightbox,
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start"
      >
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {isPublicIntake && tenantBranding && (
            <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-2xl border border-[var(--color-primary)]/20 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                {tenantBranding.logo ? (
                  <img
                    src={tenantBranding.logo}
                    alt={tenantBranding.name}
                    className="w-12 h-12 rounded-xl object-contain bg-white p-1 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center">
                    <Car size={24} />
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
                    You've been invited by
                  </p>
                  <p className="text-lg font-extrabold text-[var(--color-ink)]">
                    {tenantBranding.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          <ClientDetailsSection
            {...sectionProps}
            avatarFile={avatarFile}
            setAvatarFile={setAvatarFile}
            existingAvatar={existingAvatar}
            idFrontFile={idFrontFile}
            setIdFrontFile={setIdFrontFile}
            idBackFile={idBackFile}
            setIdBackFile={setIdBackFile}
            existingIdFront={existingIdFront}
            existingIdBack={existingIdBack}
          />

          <DrivingArrangementSection
            {...sectionProps}
            dlFrontFile={dlFrontFile}
            setDlFrontFile={setDlFrontFile}
            existingDlFront={existingDlFront}
            driverIdFrontFile={driverIdFrontFile}
            setDriverIdFrontFile={setDriverIdFrontFile}
            driverDlFrontFile={driverDlFrontFile}
            setDriverDlFrontFile={setDriverDlFrontFile}
            // ✅ forward existing driver URLs so edit mode shows "View Document"
            existingDriverIdFront={existingDriverIdFront}
            existingDriverDlFront={existingDriverDlFront}
          />
        </div>

        {/* RIGHT COLUMN */}
        <aside className="lg:sticky lg:top-4 space-y-6">
          <EmergencyContactSection {...sectionProps} />

          <PreviewCard
            formData={formData}
            avatarFile={avatarFile}
            existingAvatar={existingAvatar}
            totalDocsUploaded={totalDocsUploaded}
            totalDocsRequired={totalDocsRequired}
          />

          <SubmitCard loading={loading} mode={mode} />
        </aside>
      </form>

      <SecureLightbox
        url={lightbox?.url ?? null}
        title={lightbox?.title ?? "Document"}
        onClose={() => setLightbox(null)}
      />
    </>
  );
}

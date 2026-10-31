// src/components/client/form/PreviewCard.tsx
"use client";

import { User } from "lucide-react";
import SecureImage from "@/components/ui/SecureImage";

interface PreviewCardProps {
  formData: Record<string, string>;
  avatarFile: File | null;
  existingAvatar?: string | null;
  totalDocsUploaded: number;
  totalDocsRequired: number;
}

export default function PreviewCard({
  formData,
  avatarFile,
  existingAvatar,
  totalDocsUploaded,
  totalDocsRequired,
}: PreviewCardProps) {
  const idType = formData.id_type || "national_id";
  const drivingArrangement = formData.driving_arrangement || "self_drive";

  return (
    <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-4">
        Preview
      </div>

      <div className="flex items-start gap-3 mb-4">
        {avatarFile ? (
          <img
            src={URL.createObjectURL(avatarFile)}
            alt="Preview"
            className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-surface-border)]"
          />
        ) : existingAvatar ? (
          <SecureImage
            src={existingAvatar}
            alt="Preview"
            className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-surface-border)]"
            fallback={
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border-2 border-[var(--color-surface-border)]">
                <User size={20} />
              </div>
            }
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border-2 border-[var(--color-surface-border)]">
            <User size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-[var(--color-ink)] truncate">
            {formData.first_name && formData.last_name
              ? `${formData.first_name} ${formData.last_name}`
              : formData.full_name || "New Client"}
          </div>
          <div className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">
            {formData.phone || "No phone"}
          </div>
        </div>
      </div>

      <div className="space-y-2.5 pt-4 border-t border-[var(--color-surface-border)] text-xs">
        <div className="flex justify-between">
          <span className="text-[var(--color-ink-muted)]">Email</span>
          <span className="font-semibold text-[var(--color-ink)] truncate max-w-[140px] text-right">
            {formData.email || "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-ink-muted)]">
            {idType === "passport" ? "Passport" : "National ID"}
          </span>
          <span className="font-semibold text-[var(--color-ink)] text-right">
            {formData.id_number || "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-ink-muted)]">Arrangement</span>
          <span className="font-semibold text-[var(--color-ink)] capitalize text-right">
            {drivingArrangement.replace("_", " ")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-ink-muted)]">Documents</span>
          <span className="font-semibold text-[var(--color-ink)] text-right">
            {totalDocsUploaded}/{totalDocsRequired}
          </span>
        </div>
      </div>
    </div>
  );
}

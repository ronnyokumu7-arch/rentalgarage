// src/components/client/[id]/ClientDriverSection.tsx
"use client";

import {
  Pencil,
  UserCheck,
  User as UserIcon,
  Phone,
  CreditCard,
  Car,
  Calendar,
  Eye,
  AlertCircle,
} from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import { ProfileField } from "@/components/profile/ProfileLayout";
import SecureImage from "@/components/ui/SecureImage";
import type { Client } from "@/lib/types";

interface ClientDriverSectionProps {
  client: Client;
  onEdit: () => void;
  onPreviewDoc: (src: string, label: string) => void;
}

export default function ClientDriverSection({
  client,
  onEdit,
  onPreviewDoc,
}: ClientDriverSectionProps) {
  if (client.driving_arrangement !== "own_driver") return null;

  const driver = client.driver;

  return (
    <SectionCard title="Client-Owned Driver" icon={UserCheck}>
      {!driver ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-hover)] border border-dashed border-[var(--color-surface-border)] flex items-center justify-center mb-3">
            <UserCheck size={20} className="text-[var(--color-ink-subtle)]" />
          </div>
          <p className="text-sm font-bold text-[var(--color-ink)] mb-1">
            No driver details yet
          </p>
          <p className="text-xs text-[var(--color-ink-muted)] max-w-xs mb-4">
            This client is set to own driver but hasn't provided driver information.
          </p>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all"
          >
            <Pencil size={12} /> Add Driver Details
          </button>
        </div>
      ) : (
        <div className="flex flex-col">
          <ProfileField label="Driver Name" value={driver.full_name} icon={UserIcon} />
          <ProfileField label="Phone" value={driver.phone} icon={Phone} isMono />
          <ProfileField
            label="ID Number"
            value={driver.id_number}
            icon={CreditCard}
            isMono
          />
          <ProfileField
            label="DL Number"
            value={driver.dl_number}
            icon={Car}
            isMono
          />
          <ProfileField
            label="DL Expiry"
            value={
              driver.dl_expiry
                ? new Date(driver.dl_expiry).toLocaleDateString()
                : "Not set"
            }
            icon={Calendar}
          />

          {(driver.id_image_front || driver.dl_image_front) ? (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {driver.id_image_front && (
                <DriverDocThumb
                  src={driver.id_image_front}
                  label="Driver ID Front"
                  onPreview={() => onPreviewDoc(driver.id_image_front!, "Driver ID Front")}
                />
              )}
              {driver.dl_image_front && (
                <DriverDocThumb
                  src={driver.dl_image_front}
                  label="Driver DL Front"
                  onPreview={() => onPreviewDoc(driver.dl_image_front!, "Driver DL Front")}
                />
              )}
            </div>
          ) : (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Driver identity and license documents have not been uploaded yet.
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={onEdit}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              <Pencil size={12} /> Edit Driver
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function DriverDocThumb({
  src,
  label,
  onPreview,
}: {
  src: string;
  label: string;
  onPreview: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPreview}
      title={label}
      className="relative aspect-[1.58/1] rounded-lg overflow-hidden border border-[var(--color-surface-border)] bg-[#1A1714] group"
    >
      <SecureImage src={src} alt={label} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Eye size={16} className="text-white" />
      </div>
    </button>
  );
}

// src/components/client/[id]/IdentityEditModal.tsx
"use client";

import { UserCircle, Camera } from "lucide-react";
import Modal from "@/components/ui/Modal";
import SecureImage from "@/components/ui/SecureImage";
import type { Client } from "@/lib/types";
import type { ClientProfileFormData } from "@/hooks/clients/useClientProfile";

interface IdentityEditModalProps {
  open: boolean;
  client: Client;
  formData: ClientProfileFormData;
  updateField: (field: string, value: string) => void;
  avatarFile: File | null;
  setAvatarFile: (f: File | null) => void;
  avatarPreview: string | null;
  setAvatarPreview: (u: string | null) => void;
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all placeholder:text-[var(--color-ink-subtle)]";
const labelClass =
  "block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5";

export default function IdentityEditModal({
  open,
  client,
  formData,
  updateField,
  setAvatarFile,
  setAvatarPreview,
  avatarPreview,
  loading,
  onClose,
  onSave,
}: IdentityEditModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Identity"
      subtitle="Update contact details and identification documents."
      size="md"
    >
      <div className="space-y-5">
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-[var(--color-surface-hover)] flex items-center justify-center overflow-hidden border border-[var(--color-surface-border)] shadow-sm">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : client.avatar_image ? (
                <SecureImage
                  src={client.avatar_image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle size={40} className="text-[var(--color-primary)]" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 border-2 border-[var(--color-surface)]">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    setAvatarPreview(URL.createObjectURL(file));
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              value={formData.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              value={formData.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Email Address</label>
            <input
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              type="email"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Phone Number</label>
            <input
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              type="tel"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>ID Number</label>
            <input
              value={formData.id_number}
              onChange={(e) => updateField("id_number", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-[var(--color-surface-border)]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-md shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

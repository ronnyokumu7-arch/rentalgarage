"use client";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Modal from "@/components/ui/Modal";
import type { ClientProfileFormData } from "@/hooks/clients/useClientProfile";
import "@/styles/phone-input.css";

interface EmergencyContactEditModalProps {
  open: boolean;
  formData: ClientProfileFormData;
  updateField: (field: string, value: string) => void;
  loading: boolean;
  onClose: () => void;
  onSave: () => void;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all placeholder:text-[var(--color-ink-subtle)]";
const labelClass =
  "block text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5";

export default function EmergencyContactEditModal({
  open,
  formData,
  updateField,
  loading,
  onClose,
  onSave,
}: EmergencyContactEditModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Emergency Contact"
      subtitle="Update the client's next-of-kin details."
      size="md"
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="next-of-kin-name" className={labelClass}>
            Next of Kin Name
          </label>
          <input
            id="next-of-kin-name"
            value={formData.next_of_kin_name}
            onChange={(e) => updateField("next_of_kin_name", e.target.value)}
            autoCapitalize="words"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="next-of-kin-phone" className={labelClass}>
            Next of Kin Phone
          </label>
          <PhoneInput
            id="next-of-kin-phone"
            international
            defaultCountry="KE"
            value={formData.next_of_kin_phone}
            onChange={(value) => updateField("next_of_kin_phone", value || "")}
            placeholder="+254 7..."
            className="phone-input-custom"
            countryCallingCodeEditable={false}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-[var(--color-surface-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
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

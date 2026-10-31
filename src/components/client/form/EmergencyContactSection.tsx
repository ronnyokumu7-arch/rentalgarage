// src/components/client/form/EmergencyContactSection.tsx
"use client";

import { Users } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { SectionProps } from "./types";
import "@/styles/phone-input.css";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";

export default function EmergencyContactSection({
  formData,
  updateField,
}: SectionProps) {
  return (
    <section
      className="bg-[var(--color-surface)] rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Users size={16} />
        </div>
        <h3 className="text-sm font-bold text-[var(--color-ink)]">
          Emergency Contact
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Next of Kin Name</label>
          <input
            type="text"
            value={formData.next_of_kin_name}
            onChange={(e) => updateField("next_of_kin_name", e.target.value)}
            placeholder="Full Name"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Next of Kin Phone</label>
          <PhoneInput
            international
            defaultCountry="KE"
            value={formData.next_of_kin_phone}
            onChange={(value) => updateField("next_of_kin_phone", value || "")}
            placeholder="+254 7..."
            className="phone-input-custom"
            countryCallingCodeEditable={false}
          />
        </div>
      </div>
    </section>
  );
}

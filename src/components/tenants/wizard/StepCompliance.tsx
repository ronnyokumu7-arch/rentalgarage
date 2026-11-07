// src/components/tenants/wizard/StepCompliance.tsx
import { FileText, CurrencyDollar as DollarSign, Globe } from "@phosphor-icons/react/ssr";
import type { OnboardingFormData } from "@/hooks/useTenantOnboarding";

interface StepComplianceProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: any) => void;
}

export default function StepCompliance({ formData, updateField }: StepComplianceProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-surface-border)] pb-4">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Tax Compliance & Regional Settings</h2>
        <p className="text-xs text-[var(--color-ink-muted)]">Configure currency display, local time zones, and statutory tax IDs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KRA PIN */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            KRA PIN {formData.is_corporate && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.kra_pin}
              onChange={(e) => updateField("kra_pin", e.target.value.toUpperCase())}
              placeholder="e.g. A012345678Z"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] font-mono uppercase focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm"
            />
            <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
          <p className="text-[11px] text-[var(--color-ink-subtle)]">Required for automated VAT calculation and tax invoice compliance.</p>
        </div>

        {/* Currency */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Operating Currency</label>
          <div className="relative">
            <select
              value={formData.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm appearance-none"
            >
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Primary Timezone</label>
          <div className="relative">
            <select
              value={formData.time_zone}
              onChange={(e) => updateField("time_zone", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm appearance-none"
            >
              <option value="Africa/Nairobi">Africa/Nairobi (EAT +03:00)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
            </select>
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

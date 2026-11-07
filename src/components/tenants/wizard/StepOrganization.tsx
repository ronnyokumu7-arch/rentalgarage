// src/components/tenants/wizard/StepOrganization.tsx
import { Buildings as Building2, Phone, MapPin, Envelope as Mail } from "@phosphor-icons/react/ssr";
import type { OnboardingFormData } from "@/hooks/useTenantOnboarding";

interface StepOrganizationProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: any) => void;
}

export default function StepOrganization({ formData, updateField }: StepOrganizationProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-surface-border)] pb-4">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Organization Profile</h2>
        <p className="text-xs text-[var(--color-ink-muted)]">
          Primary business identity used across invoicing, booking receipts, and fleet contracts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entity Type Toggle */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider block mb-2">
            Entity Structure
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => updateField("is_corporate", true)}
              className={`p-3 rounded-xl border text-left transition-all ${
                formData.is_corporate
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 font-bold text-[var(--color-primary)]"
                  : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <p className="text-sm">Registered Company</p>
              <p className="text-[10px] opacity-75">Corporate / LLC Entity</p>
            </button>
            <button
              type="button"
              onClick={() => updateField("is_corporate", false)}
              className={`p-3 rounded-xl border text-left transition-all ${
                !formData.is_corporate
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 font-bold text-[var(--color-primary)]"
                  : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <p className="text-sm">Sole Proprietorship</p>
              <p className="text-[10px] opacity-75">Individual Trader</p>
            </button>
          </div>
        </div>

        {/* Organization Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Tenant / Business Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. Apex Luxury Fleet Rentals Ltd"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm"
            />
            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
        </div>

        {/* ✅ NEW: Official Company Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Official Company Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.company_email}
              onChange={(e) => updateField("company_email", e.target.value)}
              placeholder="e.g. info@apexfleet.co.ke"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm"
            />
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
          <p className="text-[11px] text-[var(--color-ink-subtle)]">Used for invoices and official correspondence.</p>
        </div>

        {/* Primary Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Contact Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.phone_number}
              onChange={(e) => updateField("phone_number", e.target.value)}
              placeholder="e.g. +254 700 000 000"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm"
            />
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
        </div>

        {/* Business Location */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Headquarters / Hub Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.business_location}
              onChange={(e) => updateField("business_location", e.target.value)}
              placeholder="e.g. Westlands, Nairobi"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm"
            />
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

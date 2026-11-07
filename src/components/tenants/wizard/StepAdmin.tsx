// src/components/tenants/wizard/StepAdmin.tsx
import { UserCheck, Envelope as Mail, Phone, Lock, Eye, EyeSlash as EyeOff } from "@phosphor-icons/react/ssr";
import type { OnboardingFormData } from "@/hooks/useTenantOnboarding";

interface StepAdminProps {
  formData: OnboardingFormData;
  updateField: (field: keyof OnboardingFormData, value: any) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}

export default function StepAdmin({ formData, updateField, showPassword, setShowPassword }: StepAdminProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--color-surface-border)] pb-4">
        <h2 className="text-lg font-bold text-[var(--color-ink)]">Primary Administrator Account</h2>
        <p className="text-xs text-[var(--color-ink-muted)]">This account will receive the initial workspace owner invite and credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Full Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Administrator Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.admin_name}
              onChange={(e) => updateField("admin_name", e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm"
            />
            <UserCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
        </div>

        {/* Admin Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Work Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.admin_email}
              onChange={(e) => updateField("admin_email", e.target.value)}
              placeholder="e.g. j.doe@apexfleet.co.ke"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm"
            />
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
        </div>

        {/* Admin Direct Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Direct Mobile Phone</label>
          <div className="relative">
            <input
              type="text"
              value={formData.admin_phone}
              onChange={(e) => updateField("admin_phone", e.target.value)}
              placeholder="Defaults to corporate phone if blank"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm"
            />
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
          </div>
        </div>

        {/* Admin Temporary Password */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">
            Temporary Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.admin_password}
              onChange={(e) => updateField("admin_password", e.target.value)}
              placeholder="Assign initial temp password for admin"
              className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none text-sm font-mono"
            />
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors"
            >
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          <p className="text-[11px] text-[var(--color-ink-subtle)]">Must be at least 8 characters long. The user will be required to change this upon first login.</p>
        </div>
      </div>
    </div>
  );
}

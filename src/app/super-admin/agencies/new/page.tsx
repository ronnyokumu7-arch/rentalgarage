// src/app/super-admin/agencies/new/page.tsx
"use client";

import { ArrowLeft, Sparkle as Sparkles, ShieldCheck, ArrowRight, CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useTenantOnboarding } from "@/hooks/useTenantOnboarding";
import WizardStepper from "@/components/tenants/wizard/WizardStepper";
import StepOrganization from "@/components/tenants/wizard/StepOrganization";
import StepCompliance from "@/components/tenants/wizard/StepCompliance";
import StepAdmin from "@/components/tenants/wizard/StepAdmin";

const STEPS = [
  { id: 1, label: "Organization" },
  { id: 2, label: "Tax & Locale" },
  { id: 3, label: "Admin Account" }, // ✅ Subscription step removed
];

export default function NewTenantWizardPage() {
  const router = useRouter();
  const { 
    currentStep, 
    isSubmitting, 
    formData, 
    updateField, 
    handleNext, 
    handlePrev, 
    handleSubmit, 
    showPassword, 
    setShowPassword 
  } = useTenantOnboarding();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/super-admin/agencies")}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to Directory
        </button>
        <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          Onboarding Engine v2.5
        </span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)]">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
              <Sparkles size={20} aria-hidden="true" />
            </div>
            Onboard New Platform Tenant
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">
            Provision dedicated workspace resources, domain rules, and primary admin access.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-surface-hover)] p-1.5 rounded-xl border border-[var(--color-surface-border)]">
          <ShieldCheck size={16} className="text-[var(--color-success-text)] ml-2" aria-hidden="true" />
          <span className="text-xs font-medium text-[var(--color-ink-muted)] pr-2">
            Multi-Tenant Isolation Ready
          </span>
        </div>
      </div>

      {/* Stepper */}
      <WizardStepper steps={STEPS} currentStep={currentStep} />

      {/* Form Card */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-6 md:p-8">
        
        {/* Render Current Step */}
        {currentStep === 1 && (
          <StepOrganization formData={formData} updateField={updateField} />
        )}
        {currentStep === 2 && (
          <StepCompliance formData={formData} updateField={updateField} />
        )}
        {currentStep === 3 && (
          <StepAdmin 
            formData={formData} 
            updateField={updateField} 
            showPassword={showPassword} 
            setShowPassword={setShowPassword} 
          />
        )}

        {/* Wizard Controls Footer */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-[var(--color-surface-border)]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-ink-muted)] border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back
          </button>

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-primary)] text-white hover:opacity-90 transition-all shadow-sm"
            >
              Continue <ArrowRight size={14} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:opacity-90 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Provisioning Environment...
                </>
              ) : (
                <>
                  Provision Tenant <Sparkles size={14} aria-hidden="true" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
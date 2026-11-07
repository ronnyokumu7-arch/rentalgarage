import { Check } from "@phosphor-icons/react/ssr";

interface Step {
  id: number;
  label: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
}

export default function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {steps.map((step) => {
        const isComplete = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div
            key={step.id}
            className={`p-3 md:p-4 rounded-xl border transition-all flex flex-col md:flex-row items-center gap-3 ${
              isActive
                ? "bg-[var(--color-surface)] border-[var(--color-primary)] shadow-[var(--shadow-md)]"
                : isComplete
                ? "bg-[var(--color-surface-hover)]/60 border-[var(--color-surface-border)] text-[var(--color-ink-muted)]"
                : "bg-[var(--color-surface)]/40 border-[var(--color-surface-border)] opacity-60"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] text-white"
                  : isComplete
                  ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]"
                  : "bg-[var(--color-surface-hover)] text-[var(--color-ink-subtle)]"
              }`}
            >
              {isComplete ? <Check size={14} aria-hidden="true" /> : step.id}
            </div>
            <div className="text-center md:text-left">
              <p
                className={`text-xs font-bold leading-tight ${
                  isActive ? "text-[var(--color-ink)]" : "text-[var(--color-ink-muted)]"
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-[var(--color-ink-subtle)] hidden md:block">
                Step 0{step.id}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

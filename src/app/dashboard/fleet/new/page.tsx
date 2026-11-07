// src/app/dashboard/fleet/new/page.tsx
"use client";

import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useNewVehicleForm } from "@/hooks/fleet/useNewVehicleForm";
import NewVehicleForm from "@/components/fleet/NewVehicleForm";

export default function NewVehiclePage() {
  const router = useRouter();
  const formState = useNewVehicleForm();

  return (
    <div className="h-[calc(100vh-4rem)] bg-[var(--color-bg)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-surface-border)] px-3 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <button 
            onClick={() => router.push("/dashboard/fleet")} 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors flex-shrink-0"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to Fleet</span>
          </button>
          
          <h1 className="text-xs sm:text-base font-bold text-[var(--color-ink)] text-center truncate px-1">
            New Vehicle Onboarding
          </h1>
          
          <div className="w-16 sm:w-24 flex-shrink-0" />
        </div>
      </div>

      {/* Form */}
      <NewVehicleForm {...formState} />
    </div>
  );
}

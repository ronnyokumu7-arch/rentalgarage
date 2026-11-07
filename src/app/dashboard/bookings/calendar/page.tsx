// src/app/dashboard/bookings/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/ssr";

export default function NewBookingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 sm:p-6 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        
        {/* Compact Premium Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/dashboard/bookings")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to Bookings
          </button>
          <h1 className="text-lg font-bold text-[var(--color-ink)] hidden sm:block">New Booking Onboarding</h1>
          <div className="w-24" /> {/* Spacer for perfect center alignment */}
        </div>

        {/* The Wizard Container */}
        
      </div>
    </div>
  );
}

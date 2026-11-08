// src/components/bookings/BookingHeroSection.tsx
"use client";

import { FileText, CheckCircle2, Car, Flag } from "lucide-react";
import type { Booking, Contract } from "@/lib/types";

interface BookingHeroSectionProps {
  booking: Booking;
  contract: Contract | null;
}

export default function BookingHeroSection({ booking, contract }: BookingHeroSectionProps) {
  const currentStatus = booking.status;
  const hasShareToken = !!contract?.share_token;

  const getStepState = (stepId: string) => {
    if (stepId === "pending") {
      if (["confirmed", "active", "completed"].includes(currentStatus)) return "completed";
      if (currentStatus === "pending") return "current";
      return "future";
    }
    if (stepId === "confirmed") {
      if (["active", "completed"].includes(currentStatus)) return "completed";
      if (currentStatus === "confirmed") return "current";
      if (currentStatus === "pending" && hasShareToken) return "waiting"; // Amber: waiting for client
      return "future";
    }
    if (stepId === "active") {
      if (currentStatus === "completed") return "completed";
      if (currentStatus === "active") return "current";
      return "future";
    }
    if (stepId === "completed") {
      if (currentStatus === "completed") return "completed";
      return "future";
    }
    return "future";
  };

  const steps = [
    { id: "pending", label: "Quoted", icon: FileText },
    { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { id: "active", label: "In Progress", icon: Car },
    { id: "completed", label: "Completed", icon: Flag },
  ];

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const state = getStepState(step.id);
          const Icon = step.icon;
          
          let nodeColor = "bg-surface-hover text-ink-subtle border-surface-border";
          if (state === "completed") nodeColor = "bg-success text-white border-success";
          if (state === "current") nodeColor = "bg-accent-dark text-white border-accent-dark ring-4 ring-accent-light/20";
          if (state === "waiting") nodeColor = "bg-warning text-white border-warning ring-4 ring-warning/20";

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${nodeColor}`}>
                {state === "completed" ? <CheckCircle2 size={22} /> : <Icon size={20} />}
              </div>
              <p className={`text-xs font-bold mt-3 uppercase tracking-wider ${
                state === "completed" ? "text-success-text" : 
                state === "current" || state === "waiting" ? "text-ink" : "text-ink-subtle"
              }`}>
                {step.label}
              </p>
              {state === "waiting" && (
                <span className="text-[9px] text-warning-text font-semibold mt-1 animate-pulse">
                  Awaiting Client
                </span>
              )}
            </div>
          );
        })}
        
        {/* Connecting Lines */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-surface-border -z-0 mx-12" />
        <div 
          className="absolute top-6 left-0 h-0.5 bg-success -z-0 mx-12 transition-all duration-500" 
          style={{ 
            width: currentStatus === "pending" ? "0%" : 
                   currentStatus === "confirmed" ? "33%" : 
                   currentStatus === "active" ? "66%" : "100%" 
          }} 
        />
      </div>
    </div>
  );
}

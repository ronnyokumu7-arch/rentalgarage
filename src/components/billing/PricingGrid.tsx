// src/components/billing/PricingGrid.tsx
"use client";

import React from "react";
import { Check, Lightning as Zap, Crown, Stack as Layers, CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";

export type PlanId = "Starter" | "Professional" | "Enterprise";
export type BillingCycle = "monthly" | "annual";

export interface PricingGridProps {
  selectedPlan: PlanId;
  billingCycle: BillingCycle;
  onSelectPlan: (planId: PlanId) => void;
  onSelectCycle: (cycle: BillingCycle) => void;
  onConfirmSelection?: (planId: PlanId, cycle: BillingCycle) => void;
  currentPlanId?: string | null;
  isSubmitting?: boolean;
}

export function PricingGrid({
  selectedPlan,
  billingCycle,
  onSelectPlan,
  onSelectCycle: _onSelectCycle,
  onConfirmSelection,
  currentPlanId,
  isSubmitting = false,
}: PricingGridProps) {
  const plans = [
    {
      id: "Starter" as PlanId,
      name: "Starter",
      icon: Zap,
      price: billingCycle === "annual" ? "3,500" : "4,500",
      desc: "Essential operations for boutique fleets.",
      features: ["Up to 10 Vehicles", "Digital Contracts", "Standard Reporting"],
    },
    {
      id: "Professional" as PlanId,
      name: "Pro Fleet",
      icon: Crown,
      price: billingCycle === "annual" ? "7,500" : "14,000",
      desc: "Scaling commercial fleets & multi-user teams.",
      features: [
        "Up to 50 Vehicles",
        "Advanced Telematics",
        "Service Rules",
        "Multi-User Permissions",
      ],
      featured: true,
    },
    {
      id: "Enterprise" as PlanId,
      name: "Enterprise",
      icon: Layers,
      price: billingCycle === "annual" ? "25,000" : "30,000",
      desc: "Dedicated infrastructure & bespoke integrations.",
      features: [
        "Unlimited Fleet Size",
        "Dedicated DB Instance",
        "24/7 Priority Support",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          
          // ✅ Robust check: Handles "Professional" vs "pro" mapping from parent
          const isCurrentPlan =
            currentPlanId?.toLowerCase() === plan.id.toLowerCase() ||
            (currentPlanId?.toLowerCase() === "pro" && plan.id === "Professional");
            
          const Icon = plan.icon;

          return (
            <div
              key={plan.id}
              onClick={() => !isCurrentPlan && onSelectPlan(plan.id)}
              className={`group relative p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isCurrentPlan
                  ? "bg-[var(--color-surface)] border-emerald-500/50 ring-1 ring-emerald-500/20 cursor-default"
                  : isSelected
                  ? "bg-[var(--color-surface)] border-[var(--color-primary)] shadow-lg ring-1 ring-[var(--color-primary)] cursor-pointer"
                  : "bg-[var(--color-surface-hover)]/30 border-[var(--color-surface-border)] hover:border-[var(--color-ink-subtle)] cursor-pointer"
              }`}
            >
              {plan.featured && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary)] text-white tracking-wide shadow-sm uppercase">
                  Most Popular
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white tracking-wide shadow-sm uppercase flex items-center gap-1">
                  <Check size={10} aria-hidden="true" /> Active Subscription
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]"
                    }`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)]">
                    {plan.name}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight">
                  {plan.price !== "Custom" ? `KES ${plan.price}` : "Custom Quote"}
                  {plan.price !== "Custom" && (
                    <span className="text-xs font-normal text-[var(--color-ink-subtle)] font-sans">
                      {" "}
                      /mo
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1 mb-6 min-h-[32px]">
                  {plan.desc}
                </p>

                <div className="space-y-2.5 border-t border-[var(--color-surface-border)] pt-4">
                  {plan.features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 text-xs text-[var(--color-ink-muted)]"
                    >
                      <Check
                        size={14}
                        className="text-emerald-500 shrink-0" aria-hidden="true"
                      />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-6 pt-4 border-t border-[var(--color-surface-border)]/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span
                    className={
                      isCurrentPlan
                        ? "text-emerald-500"
                        : isSelected
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-ink-subtle)]"
                    }
                  >
                    {isCurrentPlan
                      ? "Current Tier"
                      : isSelected
                      ? "Selected Tier"
                      : "Select Tier"}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isCurrentPlan
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isSelected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-surface-border)] group-hover:border-[var(--color-ink-subtle)]"
                    }`}
                  >
                    {(isSelected || isCurrentPlan) && <Check size={12} aria-hidden="true" />}
                  </div>
                </div>

                {/* ✅ REAL FLOW BUTTON: No more "Mock Plan" text */}
                {onConfirmSelection && isSelected && !isCurrentPlan && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirmSelection(plan.id, billingCycle);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md shadow-[var(--color-primary)]/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        Processing...
                      </>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

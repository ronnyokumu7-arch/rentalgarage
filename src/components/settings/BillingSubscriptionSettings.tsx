// src/components/settings/BillingSubscriptionSettings.tsx
"use client";

import React, { useState } from "react";
import {
  CreditCard, CheckCircle2, ArrowLeft, ShieldCheck, Building2, Smartphone,
  Receipt, Send, Info, AlertTriangle, ChevronDown, CalendarClock, Zap,
} from "lucide-react";
import toast from "react-hot-toast";

import { useBillingSubscription } from "@/hooks/settings/useBillingSubscription";
import { PricingGrid, PlanId, BillingCycle } from "@/components/billing/PricingGrid";

/* ──────────────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────────────── */

const mapPlanIdToBackend = (planId: PlanId): string => {
  if (planId === "Professional") return "pro";
  return planId.toLowerCase();
};

const mapBackendToPlanId = (backendPlan: string | null): PlanId => {
  if (backendPlan === "pro") return "Professional";
  if (backendPlan === "starter") return "Starter";
  if (backendPlan === "enterprise") return "Enterprise";
  return "Starter";
};

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  Starter: "Starter",
  Professional: "Pro Fleet",
  Enterprise: "Enterprise",
};

const PLAN_PRICES: Record<string, { monthly: string; annual: string }> = {
  Starter: { monthly: "4,500", annual: "3,500" },
  Professional: { monthly: "14,000", annual: "7,500" },
  Enterprise: { monthly: "30,000", annual: "25,000" },
};

const PLAN_FEATURES: Record<string, string[]> = {
  Starter: [
    "Up to 10 Vehicles",
    "Basic Booking Calendar",
    "Standard Client Management",
    "Email Receipts & Contracts",
    "Community Support",
  ],
  Professional: [
    "Up to 50 Vehicles",
    "Advanced 14-Day Tactical Booking Grid",
    "Online Contract Signatures & ID Verification",
    "Automated M-Pesa & Bank Reconciliation",
    "Multi-User Role Permissions",
    "Priority WhatsApp & Email Support",
  ],
  Enterprise: [
    "Unlimited Fleet Capacity",
    "GPS Tracking & Telematics Integration",
    "Custom Subdomain & White-Label Branding",
    "Dedicated Account Manager",
    "SLA 99.9% Uptime Guarantee",
    "Custom API Access",
  ],
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ──────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────── */

export default function BillingSubscriptionSettings() {
  const {
    activeSubscription, isLoading, isActionMutating, submitPaymentVerification, toggleAutoRenew,
  } = useBillingSubscription();

  const [step, setStep] = useState<"PLANS" | "PAYMENT">("PLANS");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "bank">("mpesa");
  const [referenceCode, setReferenceCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentPlanId = activeSubscription?.plan ? mapBackendToPlanId(activeSubscription.plan) : null;

  const handleConfirmSelection = (planId: PlanId, cycle: BillingCycle) => {
    setSelectedPlan(planId);
    setBillingCycle(cycle);
    setStep("PAYMENT");
    setIsSubmitted(false);
    setShowPlanDetails(false);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceCode.trim() || !selectedPlan) {
      toast.error("Please enter your payment reference transaction code.");
      return;
    }

    const payload = {
      target_plan: mapPlanIdToBackend(selectedPlan),
      target_billing_cycle: billingCycle,
      payment_method: paymentMethod,
      reference_code: referenceCode.trim(),
      notes: notes.trim(),
    };

    const success = await submitPaymentVerification(payload);
    if (success) setIsSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-32">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const showRedBanner = !activeSubscription || ["suspended", "past_due", "cancelled"].includes(activeSubscription.status);

  const statusColor =
    activeSubscription?.status === "trial"
      ? "indigo"
      : activeSubscription?.status === "pending_verification"
      ? "amber"
      : "emerald";

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">

      {/* ─── RED BANNER ─────────────────────────────────────────── */}

      {showRedBanner && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 sm:p-4 flex items-start gap-3">
          <AlertTriangle className="text-rose-500 mt-0.5 shrink-0" size={18} />
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-rose-500">Subscription Inactive</h3>
            <p className="text-xs text-rose-400 mt-1 leading-relaxed">
              Your workspace currently has {!activeSubscription ? "no active subscription" : `a ${activeSubscription.status.replace("_", " ")} status`}. Please select a plan below to restore full access.
            </p>
          </div>
        </div>
      )}

      {/* ─── ACTIVE SUBSCRIPTION — FLUSH, NO WRAPPER CARD ───────── */}

      {activeSubscription && !showRedBanner && (
        <div>
          {/* Row 1: Identity + Status */}
          <div className="flex items-start gap-3.5 mb-5">
            <div
              className="p-3 rounded-xl shrink-0 shadow-sm"
              style={{
                backgroundColor:
                  statusColor === "emerald"
                    ? "rgba(16, 185, 129, 0.1)"
                    : statusColor === "amber"
                    ? "rgba(245, 158, 11, 0.1)"
                    : "rgba(99, 102, 241, 0.1)",
                color:
                  statusColor === "emerald"
                    ? "#10b981"
                    : statusColor === "amber"
                    ? "#f59e0b"
                    : "#6366f1",
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusColor === "emerald"
                      ? "bg-emerald-500 animate-pulse"
                      : statusColor === "amber"
                      ? "bg-amber-500"
                      : "bg-indigo-500"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                    statusColor === "emerald"
                      ? "text-emerald-500"
                      : statusColor === "amber"
                      ? "text-amber-500"
                      : "text-indigo-500"
                  }`}
                >
                  {activeSubscription.status === "pending_verification"
                    ? "Pending Approval"
                    : activeSubscription.status === "trial"
                    ? "Free Trial"
                    : "Active Subscription"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-ink)] font-display tracking-tight leading-tight">
                {activeSubscription.plan === "pro" ? "Pro Fleet" : activeSubscription.plan}
              </h2>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--color-surface-border)]/60 mb-5" />

          {/* Row 2: Metrics */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-1.5 text-[var(--color-ink-subtle)] mb-1.5">
                <CalendarClock size={11} strokeWidth={2.25} />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Next Renewal</span>
              </div>
              <p className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                {activeSubscription.ends_at ? formatDate(activeSubscription.ends_at) : "—"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[var(--color-ink-subtle)] mb-1.5">
                <Zap size={11} strokeWidth={2.25} />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Billing Cycle</span>
              </div>
              <p className="text-sm font-bold text-[var(--color-ink)] capitalize">
                {activeSubscription.billing_cycle}
              </p>
            </div>
          </div>

          {/* Row 3: Auto-renew */}
          {activeSubscription.status === "active" && (
            <>
              <div className="h-px bg-[var(--color-surface-border)]/60 my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--color-ink-subtle)]">
                    Auto-Renew
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                    {activeSubscription.auto_renew
                      ? "Plan renews automatically before expiry"
                      : "Manual renewal required"}
                  </p>
                </div>
                <button
                  onClick={toggleAutoRenew}
                  disabled={isActionMutating}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0 disabled:opacity-50 ${
                    activeSubscription.auto_renew ? "bg-emerald-500" : "bg-[var(--color-surface-border)]"
                  }`}
                  aria-label="Toggle auto-renew"
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      activeSubscription.auto_renew ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </>
          )}

          {activeSubscription.status === "pending_verification" && (
            <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/20">
              <Info size={12} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
                Awaiting Super Admin approval. Your plan will activate shortly after confirmation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── PLANS STEP ─────────────────────────────────────────── */}

      {step === "PLANS" && (
        <div className="space-y-4">
          <div className="flex justify-center sm:justify-end">
            <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  billingCycle === "annual"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                Annual <span className="hidden sm:inline">(20% Off)</span><span className="sm:hidden">-20%</span>
              </button>
            </div>
          </div>

          <PricingGrid
            selectedPlan={selectedPlan || (currentPlanId as PlanId) || "Starter"}
            billingCycle={billingCycle}
            onSelectPlan={setSelectedPlan}
            onSelectCycle={setBillingCycle}
            onConfirmSelection={handleConfirmSelection}
            currentPlanId={currentPlanId}
            isSubmitting={isActionMutating}
          />
        </div>
      )}

      {/* ─── PAYMENT STEP ───────────────────────────────────────── */}

      {step === "PAYMENT" && selectedPlan && (
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setStep("PLANS")}
            className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Plans
          </button>

          {isSubmitted ? (
            <div className="bg-[var(--color-surface)] border border-emerald-500/30 rounded-2xl p-6 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="sm:hidden" />
                <CheckCircle2 size={32} className="hidden sm:block" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">Payment Submitted for Review!</h3>
              <p className="text-xs text-[var(--color-ink-muted)] max-w-md mx-auto leading-relaxed">
                Your reference <span className="font-mono font-bold text-[var(--color-ink)]">{referenceCode}</span> is now queued for Super Admin approval.
              </p>
              <button
                onClick={() => {
                  setStep("PLANS");
                  setIsSubmitted(false);
                  setReferenceCode("");
                  setNotes("");
                }}
                className="mt-4 px-6 py-2.5 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Return to Plans
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              <div className="lg:col-span-5 lg:order-1">
                <div className="lg:bg-[var(--color-surface)] lg:border lg:border-[var(--color-surface-border)] lg:rounded-2xl lg:p-6 lg:sticky lg:top-6">
                  <div className="lg:hidden bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold tracking-wider">Selected Plan</div>
                        <div className="text-base font-bold text-[var(--color-ink)] truncate">
                          {PLAN_DISPLAY_NAMES[selectedPlan] || selectedPlan}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold tracking-wider">Total</div>
                        <div className="text-sm font-black text-[var(--color-ink)] tabular-nums">
                          KES {PLAN_PRICES[selectedPlan as keyof typeof PLAN_PRICES]?.[billingCycle === "annual" ? "annual" : "monthly"]}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPlanDetails((v) => !v)}
                      className="mt-3 w-full flex items-center justify-between text-[11px] font-bold text-[var(--color-primary)] py-1"
                    >
                      <span>{showPlanDetails ? "Hide" : "View"} plan details</span>
                      <ChevronDown size={14} className={`transition-transform ${showPlanDetails ? "rotate-180" : ""}`} />
                    </button>
                  </div>

                  <div className="hidden lg:block">
                    <div className="flex items-center gap-2 text-indigo-500 text-[10px] font-bold uppercase tracking-wider mb-4">
                      <Info size={12} /> Selected Tier
                    </div>
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-[var(--color-ink)] mb-1">
                        {PLAN_DISPLAY_NAMES[selectedPlan] || selectedPlan}
                      </h3>
                      <p className="text-xs text-[var(--color-ink-muted)] capitalize">{billingCycle} billing cycle</p>
                    </div>
                    <div className="bg-[var(--color-surface-hover)] rounded-xl p-4 mb-6 border border-[var(--color-surface-border)]">
                      <div className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold tracking-wider mb-1">Total Payable</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[var(--color-ink)]">
                          KES {PLAN_PRICES[selectedPlan as keyof typeof PLAN_PRICES]?.[billingCycle === "annual" ? "annual" : "monthly"]}
                        </span>
                        <span className="text-xs text-[var(--color-ink-muted)]">/mo</span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="text-[10px] text-[var(--color-ink-subtle)] uppercase font-bold tracking-wider mb-3">What's Included</div>
                      <ul className="space-y-2">
                        {PLAN_FEATURES[selectedPlan]?.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-ink)]">
                            <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {showPlanDetails && (
                    <div className="lg:hidden mt-3 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl p-4 animate-in slide-in-from-top-2 fade-in duration-200">
                      <ul className="space-y-2">
                        {PLAN_FEATURES[selectedPlan]?.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-ink)]">
                            <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7 lg:order-2 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-2 text-[var(--color-ink)] text-sm font-bold mb-4">
                  <CreditCard size={16} /> How to Complete Payment
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod("mpesa")}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === "mpesa"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                        : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <Smartphone size={18} />
                    <div className="text-xs">
                      <div className="font-bold">M-Pesa Express</div>
                      <div className="text-[10px] opacity-80">Paybill Transfer</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("bank")}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      paymentMethod === "bank"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <Building2 size={18} />
                    <div className="text-xs">
                      <div className="font-bold">Bank Transfer</div>
                      <div className="text-[10px] opacity-80">EFT / RTGS</div>
                    </div>
                  </button>
                </div>

                <form onSubmit={handleSubmitVerification} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-ink)] mb-1.5">
                      Payment Reference Code <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Receipt size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. QX829102KS"
                        value={referenceCode}
                        onChange={(e) => setReferenceCode(e.target.value)}
                        className="w-full pl-9 pr-4 h-12 sm:h-auto sm:py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm sm:text-xs text-[var(--color-ink)] font-mono focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none uppercase transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isActionMutating}
                    className="w-full h-12 sm:h-auto sm:py-3 rounded-xl bg-[var(--color-primary)] text-white text-sm sm:text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isActionMutating ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} /> Submit Payment for Verification
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

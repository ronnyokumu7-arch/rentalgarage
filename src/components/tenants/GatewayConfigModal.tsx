// src/components/tenants/GatewayConfigModal.tsx
"use client";

import { useState } from "react";
import {
  CreditCard, DeviceMobile as Smartphone, Buildings as Building2, CurrencyDollar as DollarSign, X, CircleNotch as Loader2,
  CheckCircle as CheckCircle2, Warning as AlertTriangle, Eye, EyeSlash as EyeOff, Lightning as Zap, ShieldCheck, Hash, Globe, User, Phone, Info,
} from "@phosphor-icons/react/ssr";
import type {
  PaymentGatewayConfig,
  PaymentGatewayPayload,
  GatewayType,
  GatewayEnvironment,
} from "@/lib/types";
import OverlayPortal from "@/components/ui/OverlayPortal";

/**
 * @component GatewayConfigModal
 * @description 
 * A "dumb" (presentational) modal for creating/editing a SINGLE payment gateway.
 * Provider selection happens on the parent page (Available Methods grid); this
 * modal only shows the configuration form for the gateway it was opened for.
 * 
 * Mobile Optimization: Bottom sheet pattern with internal scrolling on mobile,
 * centered modal on desktop.
 */
interface GatewayConfigModalProps {
  gatewayType?: string;
  existingConfig?: PaymentGatewayConfig | null;
  isSaving: boolean;
  isTesting: boolean;
  onClose: () => void;
  onSave: (payload: PaymentGatewayPayload, gatewayType: GatewayType | string, configId?: number) => Promise<void>;
  onTest: (payload: PaymentGatewayPayload, gatewayType: GatewayType | string) => Promise<void>;
}

const GATEWAY_META: Record<string, {
  icon: any; color: string; bg: string; title: string; description: string; requirements: string[];
}> = {
  mpesa: {
    icon: Smartphone, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20",
    title: "M-Pesa Payments",
    description: "Configure manual payment details for clients to pay via Paybill, Till Number, or Pochi la Biashara.",
    requirements: ["Paybill or Till Number", "Account Reference", "Business Name"],
  },
  airtel_money: {
    icon: Smartphone, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20",
    title: "Airtel Money OpenAPI",
    description: "Accept payments directly from Airtel Money wallets via USSD and App push notifications.",
    requirements: ["Merchant API Key", "Service Provider Code", "Callback URL"],
  },
  bank: {
    icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20",
    title: "Direct Bank Transfer",
    description: "Manual reconciliation mode for agencies accepting direct deposits or RTGS transfers.",
    requirements: ["Bank Statement Access", "Reconciliation Workflow", "Branch Details"],
  },
  stripe: {
    icon: CreditCard, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
    title: "Stripe Payments",
    description: "Global card processing with support for Visa, Mastercard, and Apple Pay.",
    requirements: ["Stripe Dashboard Access", "Webhook Endpoint", "PCI Compliance"],
  },
  paypal: {
    icon: DollarSign, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20",
    title: "PayPal Checkout",
    description: "Trusted international payment method for cross-border rental transactions.",
    requirements: ["Business PayPal Account", "REST API Client ID", "IPN Configuration"],
  },
};

// ✅ Aligned with backend truth (SENSITIVE_FIELDS + model columns)
const GATEWAY_FIELDS: Record<string, Array<{ key: string; label: string; placeholder: string; type?: string; icon?: any }>> = {
  airtel_money: [
    { key: "api_key", label: "API Key", placeholder: "Enter API Key", type: "password" },
    { key: "api_secret", label: "API Secret", placeholder: "Enter API Secret", type: "password" },
    { key: "merchant_code", label: "Merchant Code", placeholder: "Enter Merchant Code" },
  ],
  bank: [
    { key: "bank_name", label: "Bank Name", placeholder: "e.g., Equity Bank, KCB", icon: Building2 },
    { key: "account_name", label: "Account Name", placeholder: "e.g., Rental Garage Ltd", icon: User },
    { key: "account_number", label: "Account Number", placeholder: "Enter Account Number", icon: Hash },
    { key: "branch_code", label: "Branch Code (Optional)", placeholder: "e.g., 01 or 123", icon: Hash },
    { key: "swift_code", label: "SWIFT / BIC Code (Optional)", placeholder: "e.g., EQBLKENX", icon: Globe },
    { key: "currency", label: "Currency", placeholder: "e.g., KES, USD, EUR", icon: DollarSign },
  ],
  stripe: [
    { key: "publishable_key", label: "Publishable Key", placeholder: "pk_live_..." },
    { key: "secret_key", label: "Secret Key", placeholder: "sk_live_...", type: "password" },
    { key: "webhook_secret", label: "Webhook Signing Secret", placeholder: "whsec_...", type: "password" },
  ],
  paypal: [
    { key: "client_id", label: "Client ID", placeholder: "Enter Client ID" },
    { key: "client_secret", label: "Client Secret", placeholder: "Enter Client Secret", type: "password" },
  ],
};

// ✅ M-Pesa method-specific fields (aligned with backend model columns)
type MpesaMethod = "paybill" | "till" | "pochi";

const MPESA_METHODS: { key: MpesaMethod; label: string; description: string }[] = [
  { key: "paybill", label: "Paybill", description: "Clients pay to your Paybill number with an account reference" },
  { key: "till", label: "Till Number", description: "Clients pay directly to your Buy Goods Till Number" },
  { key: "pochi", label: "Pochi la Biashara", description: "Clients send money to your Pochi number" },
];

const MPESA_METHOD_FIELDS: Record<MpesaMethod, Array<{ key: string; label: string; placeholder: string; icon?: any; type?: string; }>> = {
  paybill: [
    { key: "business_shortcode", label: "Paybill Number", placeholder: "e.g., 522522", icon: Hash },
    { key: "account_number", label: "Account Reference", placeholder: "e.g., RENT123", icon: Hash },
    { key: "account_name", label: "Account Name", placeholder: "e.g., Rental Garage Ltd", icon: User },
  ],
  till: [
    { key: "till_number", label: "Till Number", placeholder: "e.g., 123456", icon: Hash },
    { key: "account_name", label: "Business Name", placeholder: "e.g., Rental Garage Ltd", icon: User },
  ],
  pochi: [
    { key: "till_number", label: "Pochi Number", placeholder: "e.g., 0712345678", icon: Phone },
    { key: "account_name", label: "Account Name", placeholder: "e.g., Rental Garage Ltd", icon: User },
  ],
};

export function GatewayConfigModal({
  gatewayType,
  existingConfig,
  isSaving,
  isTesting,
  onClose,
  onSave,
  onTest,
}: GatewayConfigModalProps) {
  const [environment, setEnvironment] = useState<GatewayEnvironment>(
    (existingConfig?.environment as GatewayEnvironment) || "sandbox"
  );
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // ✅ M-Pesa method type state (paybill/till/pochi)
  const [mpesaMethod, setMpesaMethod] = useState<MpesaMethod>(
    (existingConfig?.method_type as MpesaMethod) || "paybill"
  );

  // ✅ Proper lazy initializer (prevents setState-during-render anti-pattern)
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    if (!existingConfig) return {};
    const initialData: Record<string, string> = {};
    Object.keys(existingConfig).forEach((key) => {
      if (!["id", "tenant_id", "type", "is_active", "environment", "method_type"].includes(key)) {
        const val = (existingConfig as any)[key];
        initialData[key] = typeof val === "string" ? val : "";
      }
    });
    return initialData;
  });

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ✅ The modal is ALWAYS scoped to a single gateway:
  // - Edit mode: locked to the existing config's type.
  // - Create mode: locked to the gatewayType chosen on the parent page.
  const activeType = existingConfig ? existingConfig.type : (gatewayType || "mpesa");

  // ✅ Dynamic fields based on active type and M-Pesa method
  const currentFields = activeType === "mpesa" 
    ? MPESA_METHOD_FIELDS[mpesaMethod] 
    : (GATEWAY_FIELDS[activeType] || []);
  const meta = GATEWAY_META[activeType] || GATEWAY_META.mpesa;

  // ✅ SAFETY: Build the payload ONLY from the fields currently displayed for the
  // active provider. This prevents stale values from a previously-selected
  // provider from being sent to the wrong gateway model.
  const buildPayload = (): PaymentGatewayPayload => {
    const payload: PaymentGatewayPayload = { environment };
    
    if (activeType === "mpesa") {
      payload.method_type = mpesaMethod;
    }
    
    currentFields.forEach((field) => {
      const value = formData[field.key];
      if (value !== undefined && value.trim() !== "") {
        payload[field.key] = value;
      }
    });
    return payload;
  };

  const handleTestConnection = async () => {
    try {
      await onTest(buildPayload(), activeType);
    } catch {
      // Error is already toasted by the hook; keep modal open for retry
    }
  };

  const handleSave = async () => {
    try {
      await onSave({ ...buildPayload(), is_active: true }, activeType);
      onClose(); // Only close on success
    } catch {
      // Error is already toasted by the hook; keep modal open for retry
    }
  };

  return (
    // ✅ MOBILE: Bottom sheet (items-end) with internal scrolling. Desktop: centered modal.
    <OverlayPortal onClose={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl border border-[var(--color-surface-border)] flex flex-col max-h-[92dvh] sm:max-h-[85dvh]">
        
        {/* Hero Section - Pinned at top */}
        <div className={`relative p-4 sm:p-6 border-b ${meta.bg} transition-colors duration-300 shrink-0`}>
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-black/10 transition-colors">
            <X size={20} aria-hidden="true" />
          </button>
          
          <div className="flex items-start gap-3 sm:gap-5 pr-10">
            <div className={`p-2.5 sm:p-3 rounded-xl bg-[var(--color-surface)] shadow-sm border border-[var(--color-surface-border)] ${meta.color} shrink-0`}>
              <meta.icon size={24} aria-hidden="true" />
            </div>
            <div className="flex-1 pt-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-ink)] mb-1 truncate">
                {existingConfig ? `Edit ${meta.title}` : meta.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3 line-clamp-2">
                {meta.description}
              </p>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {meta.requirements.slice(0, 2).map((req, i) => (
                  <span key={i} className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-[var(--color-surface)]/80 border border-[var(--color-surface-border)] text-[9px] sm:text-[10px] font-medium text-[var(--color-ink-subtle)]">
                    <ShieldCheck size={10} aria-hidden="true" /> <span className="truncate max-w-[120px] sm:max-w-none">{req}</span>
                  </span>
                ))}
                {meta.requirements.length > 2 && (
                  <span className="text-[9px] sm:text-[10px] text-[var(--color-ink-subtle)] py-1">
                    +{meta.requirements.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body - Scrollable middle region */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          
          {/* ✅ M-Pesa Method Tabs (the ONLY tabs left — they are M-Pesa-specific) */}
          {activeType === "mpesa" && (
            <div>
              <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-3 block">
                Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {MPESA_METHODS.map((method) => {
                  const isSelected = mpesaMethod === method.key;
                  return (
                    <button
                      key={method.key}
                      type="button"
                      onClick={() => setMpesaMethod(method.key)}
                      className={`
                        flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[10px] font-semibold transition-all
                        ${isSelected 
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]" 
                          : "border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)]"}
                      `}
                    >
                      <span className="text-xs font-bold">{method.label}</span>
                      <span className="text-[9px] text-[var(--color-ink-subtle)] text-center line-clamp-2">
                        {method.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Environment Toggle - Only for API-based gateways */}
          {activeType !== "mpesa" && (
            <div>
              <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2 block">
                Environment Mode
              </label>
              <div className="flex bg-[var(--color-surface-hover)] rounded-lg p-1 border border-[var(--color-surface-border)]">
                {(["sandbox", "production"] as const).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`
                      flex-1 py-2.5 sm:py-2 px-2 sm:px-3 rounded-md text-xs font-bold capitalize transition-all flex items-center justify-center gap-1.5 sm:gap-2
                      ${environment === env 
                        ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-sm ring-1 ring-black/5" 
                        : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}
                    `}
                  >
                    {env === "production" && <Zap size={12} className={environment === env ? "text-amber-500" : ""} aria-hidden="true" />}
                    {env}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Grid For Inputs - Single column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {currentFields.map((field) => {
              const isPassword = field.type === "password";
              const isVisible = showPasswords[field.key];
              const FieldIcon = field.icon;
              
              return (
                <div key={field.key}>
                  <label className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1.5 block">
                    {field.label}
                  </label>
                  <div className="relative group">
                    <input
                      type={isPassword && !isVisible ? "password" : "text"}
                      value={formData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 sm:px-4 py-2.5 pr-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                    />
                    {FieldIcon && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none">
                        <FieldIcon size={16} aria-hidden="true" />
                      </div>
                    )}
                    {isPassword && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors p-1.5 sm:p-1"
                      >
                        {isVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note / Test Connection Row */}
          {activeType === "mpesa" ? (
            // ✅ Manual M-Pesa: no API to test — show a helpful note instead
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <Info size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[10px] text-emerald-600/80 leading-relaxed">
                These details are shown to your clients on invoices with step-by-step payment instructions. No API connection is required.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-colors disabled:opacity-50"
              >
                {isTesting ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Zap size={14} aria-hidden="true" />}
                {isTesting ? "Testing Connection..." : "Test Connection"}
              </button>
              
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex-1">
                <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[10px] text-amber-600/80 leading-relaxed">
                  Credentials are encrypted at rest. Use Sandbox mode for testing before switching to Production.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Pinned at bottom */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--color-primary)]/20"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
            {isSaving ? "Saving..." : existingConfig ? "Update Configuration" : "Save & Update"}
          </button>
        </div>
      </div>
      </div>
    </OverlayPortal>
  );
}

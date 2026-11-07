// src/components/tenants/PaymentGatewaysSection.tsx
"use client";

import { useState } from "react";
import {
  CreditCard, DeviceMobile as Smartphone, Buildings as Building2, CurrencyDollar as DollarSign, Plus,
  CheckCircle as CheckCircle2, XCircle, CircleNotch as Loader2, NotePencil as Edit3, Trash as Trash2,
} from "@phosphor-icons/react/ssr";
import type {
  PaymentGatewayConfig,
  PaymentGatewayPayload,
  GatewayType,
} from "@/lib/types";
import { confirmAction } from "@/lib/utils/confirmAction";
import { GatewayConfigModal } from "./GatewayConfigModal";

/**
 * @component PaymentGatewaysSection
 * @description 
 * A "dumb" (presentational) section that lists configured payment gateways,
 * allows adding/editing/deleting them, and hosts the GatewayConfigModal.
 * 
 * It does NOT fetch data or call the API directly. All data and mutations are 
 * provided by the parent via props (typically wired through usePaymentGateways).
 * This makes it fully reusable across Super Admin and Tenant contexts.
 */
interface PaymentGatewaysSectionProps {
  gateways: PaymentGatewayConfig[];
  isLoading: boolean;
  isSaving: boolean;
  isTesting: boolean;
  isDeleting: boolean;
  onSave: (payload: PaymentGatewayPayload, gatewayType: GatewayType | string, configId?: number) => Promise<void>;
  onTest: (payload: PaymentGatewayPayload, gatewayType: GatewayType | string) => Promise<void>;
  onDelete: (gatewayType: GatewayType | string, configId: number) => Promise<void>;
  onUpdated?: () => void;
}

export function PaymentGatewaysSection({
  gateways,
  isLoading,
  isSaving,
  isTesting,
  isDeleting,
  onSave,
  onTest,
  onDelete,
  onUpdated,
}: PaymentGatewaysSectionProps) {
  // ✅ Modal State Management (Pure UI state stays inside the component)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayConfig | null>(null);
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState<string | undefined>(undefined);

  const handleAddGateway = (gatewayType: string) => {
    setSelectedGateway(null);
    setSelectedTypeToAdd(gatewayType);
    setIsConfigModalOpen(true);
  };

  const handleEditGateway = (gateway: PaymentGatewayConfig) => {
    setSelectedGateway(gateway);
    setSelectedTypeToAdd(undefined);
    setIsConfigModalOpen(true);
  };

  // ✅ Wraps the parent's onSave so we can notify onUpdated only on success
  const handleSave = async (payload: PaymentGatewayPayload, gatewayType: GatewayType | string) => {
    // ✅ Pass the config ID when editing so the parent knows whether to CREATE or UPDATE.
    // This prevents accidentally updating the wrong config (e.g., multiple bank accounts).
    await onSave(payload, gatewayType, selectedGateway?.id); // Throws on error → modal stays open
    onUpdated?.();
  };

  // ✅ FIXED: Real delete via the parent's onDelete callback (no more fake optimistic delete)
  const handleDeleteGateway = async (gateway: PaymentGatewayConfig) => {
    if (!confirmAction("Are you sure you want to delete this payment gateway configuration? This action cannot be undone.")) return;
    
    try {
      await onDelete(gateway.type, gateway.id);
      onUpdated?.();
    } catch {
      // Error is already toasted by the hook
    }
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case "mpesa": return Smartphone;
      case "airtel_money": return Smartphone;
      case "bank": return Building2;
      case "stripe": return CreditCard;
      case "paypal": return DollarSign;
      default: return CreditCard;
    }
  };

  const getGatewayColor = (type: string) => {
    switch (type) {
      case "mpesa": return "bg-green-500/10 text-green-700 border-green-200";
      case "airtel_money": return "bg-red-500/10 text-red-700 border-red-200";
      case "bank": return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "stripe": return "bg-purple-500/10 text-purple-700 border-purple-200";
      case "paypal": return "bg-indigo-500/10 text-indigo-700 border-indigo-200";
      default: return "bg-slate-500/10 text-slate-700 border-slate-200";
    }
  };

  // ✅ Explicitly typed so `type` is GatewayType, not a loose string
  const availableGateways: { type: GatewayType; label: string; description: string }[] = [
    { type: "mpesa", label: "M-Pesa", description: "Mobile money" },
    { type: "airtel_money", label: "Airtel Money", description: "Mobile wallet" },
    { type: "bank", label: "Bank Transfer", description: "Direct bank" },
    { type: "stripe", label: "Stripe", description: "Cards" },
    { type: "paypal", label: "PayPal", description: "Digital wallet" },
  ];

  const configuredTypes = gateways.map((g) => g.type);
  const unconfiguredGateways = availableGateways.filter((g) => !configuredTypes.includes(g.type));

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
            <CreditCard size={16} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Payment Gateways</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Configure payment methods</p>
          </div>
        </div>
      </div>

      {/* Compact Body */}
      <div className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-[var(--color-ink-muted)] gap-2">
            <Loader2 className="animate-spin text-indigo-600" size={16} aria-hidden="true" />
            <span className="text-xs">Loading...</span>
          </div>
        ) : gateways.length === 0 ? (
          <div className="text-center py-6 flex-1 flex flex-col items-center justify-center">
            <CreditCard className="mb-2 text-[var(--color-ink-subtle)] opacity-40" size={24} aria-hidden="true" />
            <p className="text-xs font-medium text-[var(--color-ink)]">No gateways configured</p>
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">Add a method below</p>
          </div>
        ) : (
          <div className="space-y-2">
            {gateways.map((gateway) => {
              const Icon = getGatewayIcon(gateway.type);
              const colorClass = getGatewayColor(gateway.type);
              
              return (
                <div
                  key={gateway.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-ink-subtle)] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${colorClass}`}>
                      <Icon size={16} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-ink)] capitalize">
                        {gateway.type.replace("_", " ")}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {gateway.is_active ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                            <CheckCircle2 size={10} aria-hidden="true" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 font-medium">
                            <XCircle size={10} aria-hidden="true" /> Inactive
                          </span>
                        )}
                        {gateway.environment && (
                          <span className="text-[10px] text-[var(--color-ink-muted)]">• {gateway.environment}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditGateway(gateway)}
                      disabled={isSaving || isDeleting}
                      className="p-1.5 rounded-md text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
                      title="Edit configuration"
                    >
                      <Edit3 size={14} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDeleteGateway(gateway)}
                      disabled={isDeleting}
                      className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      title="Delete configuration"
                    >
                      {isDeleting ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Trash2 size={14} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Available Gateways */}
        {unconfiguredGateways.length > 0 && (
          <div className="pt-3 border-t border-[var(--color-surface-border)]">
            <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-2.5">
              Available Methods
            </p>
            <div className="grid grid-cols-2 gap-2">
              {unconfiguredGateways.map((gateway) => {
                const Icon = getGatewayIcon(gateway.type);
                return (
                  <button
                    key={gateway.type}
                    onClick={() => handleAddGateway(gateway.type)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-dashed border-[var(--color-surface-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all text-left group"
                  >
                    <div className="p-1.5 rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
                      <Icon size={14} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate">{gateway.label}</p>
                      <p className="text-[9px] text-[var(--color-ink-muted)] truncate">{gateway.description}</p>
                    </div>
                    <Plus size={14} className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ✅ REAL MODAL INTEGRATION (Fully decoupled) */}
      {isConfigModalOpen && (
        <GatewayConfigModal
          gatewayType={selectedTypeToAdd}
          existingConfig={selectedGateway}
          isSaving={isSaving}
          isTesting={isTesting}
          onClose={() => {
            setIsConfigModalOpen(false);
            setSelectedGateway(null);
            setSelectedTypeToAdd(undefined);
          }}
          onSave={handleSave}
          onTest={onTest}
        />
      )}
    </div>
  );
}

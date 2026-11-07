// src/components/settings/PaymentMethodsSettings.tsx
"use client";

import { Info } from "@phosphor-icons/react/ssr";
import { useAuth } from "@/context/auth-context";
import { usePaymentGateways } from "@/hooks/usePaymentGateways";
import { PaymentGatewaysSection } from "@/components/tenants/PaymentGatewaysSection";
import type { PaymentGatewayPayload, GatewayType } from "@/lib/types";

/**
 * @component PaymentMethodsSettings
 * @description 
 * The Tenant-facing wrapper for payment gateway configuration.
 * 
 * It wires the `usePaymentGateways` hook (scoped to the logged-in tenant) 
 * into the decoupled `PaymentGatewaysSection` UI. This component contains 
 * no API logic of its own—it simply resolves the create-vs-update decision 
 * and passes data + callbacks down.
 */
export default function PaymentMethodsSettings() {
  const { user } = useAuth();
  const tenantId = user?.tenant_id;

  const {
    gateways,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting,
    createGateway,
    updateGateway,
    deleteGateway,
    testGateway,
  } = usePaymentGateways(tenantId ?? 0); // Hook is disabled when tenantId is missing

  /**
   * ✅ CREATE vs UPDATE RESOLUTION
   * If a configId is present, we're editing an existing config → PATCH.
   * If not, we're adding a new gateway → POST.
   */
  const handleSave = async (
    payload: PaymentGatewayPayload,
    gatewayType: GatewayType | string,
    configId?: number
  ) => {
    if (configId) {
      await updateGateway({ gatewayType, configId, payload });
    } else {
      await createGateway({ gatewayType, payload });
    }
  };

  // ✅ GUARD: If there&apos;s no tenant context, fail gracefully (no crash)
  if (!tenantId) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-[var(--shadow-card)] p-8 text-center">
        <p className="text-sm text-[var(--color-ink-muted)]">
          We couldn't identify your agency workspace. Please sign in again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Context Banner: Explains where these details appear */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20">
        <Info size={16} className="text-[var(--color-primary-text)] mt-0.5 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-[var(--color-primary-text)] leading-relaxed">
          These payment methods are displayed on your invoices so clients know exactly how to pay for their bookings.
        </p>
      </div>

      {/* The Decoupled Gateway UI */}
      <PaymentGatewaysSection
        gateways={gateways}
        isLoading={isLoading}
        isSaving={isCreating || isUpdating}
        isTesting={isTesting}
        isDeleting={isDeleting}
        onSave={handleSave}
        onTest={async (payload, gatewayType) => {
          await testGateway({ gatewayType, payload });
        }}
        onDelete={(gatewayType, configId) => deleteGateway({ gatewayType, configId })}
      />
    </div>
  );
}

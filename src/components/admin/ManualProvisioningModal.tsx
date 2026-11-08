// src/components/admin/ManualProvisioningModal.tsx
"use client";

import React, { useState } from "react";
import apiClient from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import toast from "react-hot-toast";
import { Hash, CurrencyDollar as DollarSign, ShieldCheck, CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";
import Modal from "@/components/ui/Modal";

interface ManualProvisioningModalProps {
  tenantId: number;
  tenantName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManualProvisioningModal({
  tenantId,
  tenantName,
  isOpen,
  onClose,
  onSuccess,
}: ManualProvisioningModalProps) {
  const [plan, setPlan] = useState<string>("pro");
  const [billingCycle, setBillingCycle] = useState<string>("annual");
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [referenceCode, setReferenceCode] = useState<string>("");
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceCode.trim()) {
      toast.error("Payment Reference / Receipt Code is required for manual provisioning.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/subscriptions/admin/manual-activate", {
        tenant_id: tenantId,
        plan,
        billing_cycle: billingCycle,
        payment_method: paymentMethod,
        reference_code: referenceCode.trim(),
        amount_paid: amountPaid ? parseFloat(amountPaid) : 0,
        notes: notes.trim() || undefined,
      });

      toast.success(`Plan successfully provisioned for ${tenantName}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to provision subscription."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      ariaLabel="Manual Provisioning"
      bodyClassName="p-0"
      headerClassName="px-5 py-5"
      header={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-ink)]">Manual Provisioning</h3>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Tenant: <span className="font-semibold text-[var(--color-primary)]">{tenantName}</span> (ID: #{tenantId})
            </p>
          </div>
        </div>
      }
    >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Plan & Billing Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                Subscription Plan
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-ink)]"
              >
                <option value="starter">Starter Plan</option>
                <option value="pro">Pro Fleet Plan</option>
                <option value="enterprise">Enterprise Tier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-ink)]"
              >
                <option value="monthly">Monthly (30 Days)</option>
                <option value="annual">Annual (365 Days)</option>
              </select>
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs font-medium text-[var(--color-ink)]"
              >
                <option value="bank_transfer">Direct Bank Wire</option>
                <option value="mpesa_manual">Manual M-Pesa Paybill</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                Reference / Receipt # *
              </label>
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-3 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                <input
                  type="text"
                  required
                  placeholder="e.g. QKH991122 or BANK-482"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs text-[var(--color-ink)]"
                />
              </div>
            </div>
          </div>

          {/* Amount Paid & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                Amount Collected (KES)
              </label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-3 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs text-[var(--color-ink)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                Audit Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Flagship tenant early discount"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs text-[var(--color-ink)]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-[var(--color-surface-border)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : "Confirm & Provision Plan"}
            </button>
          </div>
        </form>
    </Modal>
  );
}

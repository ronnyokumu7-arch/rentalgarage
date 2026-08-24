// src/components/ui/QuickGarageModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Car, Wrench, AlertCircle, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type { Vehicle } from "@/lib/types";

interface QuickGarageModalProps {
  vehicle: Vehicle | null;
  open: boolean;
  onClose: () => void;
  onSave: (payload: { current_mileage: number; next_service_km?: number | null }) => Promise<void>;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed";
const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5 sm:mb-2";

// ✅ NEW: Extract the backend's human-readable message from any error shape
const getErrorMessage = (err: unknown): string => {
  const anyErr = err as any;
  return (
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.detail ||
    anyErr?.message ||
    "Update failed. Please try again."
  );
};

export default function QuickGarageModal({ vehicle, open, onClose, onSave }: QuickGarageModalProps) {
  const [newMileage, setNewMileage] = useState<string>("");
  const [nextService, setNextService] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Reset form state when modal opens/closes or vehicle changes
  useEffect(() => {
    if (open && vehicle) {
      setNewMileage(vehicle.current_mileage.toString());
      setNextService(vehicle.next_service_km ? vehicle.next_service_km.toString() : "");
      setError("");
      setIsLoading(false); // ✅ NEW: guarantee no stale spinner on reopen
    } else {
      setNewMileage("");
      setNextService("");
      setError("");
      setIsLoading(false); // ✅ NEW: kill spinner if closed mid-flight
    }
  }, [open, vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;

    const mileageNum = parseInt(newMileage, 10);
    const serviceNum = nextService ? parseInt(nextService, 10) : undefined;

    // STRICT VALIDATION: Odometer must move forward
    if (isNaN(mileageNum) || mileageNum <= vehicle.current_mileage) {
      setError(
        `New mileage (${mileageNum.toLocaleString()} KM) must be strictly greater than current mileage (${vehicle.current_mileage.toLocaleString()} KM).`
      );
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await onSave({
        current_mileage: mileageNum,
        next_service_km: serviceNum ?? null,
      });
      // Parent closes the modal on success; finally still resets state safely
    } catch (err) {
      // ✅ NEW: Surface the backend message inline and keep modal open for retry
      setError(getErrorMessage(err));
    } finally {
      // ✅ CRITICAL FIX: Spinner ALWAYS resets — success, throw, or swallowed error
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quick Garage Update"
      subtitle={vehicle ? `Updating ${vehicle.make} ${vehicle.model} (${vehicle.plate_number})` : ""}
      size="md"
    >
      {!vehicle ? (
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle size={32} className="text-[var(--color-warning-text)] mb-3" />
          <p className="text-sm text-[var(--color-ink-muted)]">No vehicle selected.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* ✅ COPY FIX: Neutral banner — accurate for ANY vehicle, not just "awaiting" ones */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 sm:gap-3">
            <Wrench size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300">
                Garage Update
              </p>
              <p className="text-[11px] sm:text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5 sm:mt-1 leading-relaxed">
                Record the latest odometer reading and, optionally, the next service interval to keep this vehicle's profile current.
              </p>
            </div>
          </div>

          {/* Current Mileage Reference */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-xs sm:text-sm">
            <span className="font-medium text-[var(--color-ink-muted)]">Current Recorded Mileage:</span>
            <span className="font-bold text-[var(--color-ink)] font-mono">
              {vehicle.current_mileage.toLocaleString()} KM
            </span>
          </div>

          {/* New Mileage Input */}
          <div>
            <label className={labelClass}>
              New Odometer Reading (KM) <span className="text-[var(--color-danger)]">*</span>
            </label>
            <div className="relative">
              <Car size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="number"
                value={newMileage}
                onChange={(e) => setNewMileage(e.target.value)}
                className={`${inputClass} pl-10 font-mono`}
                placeholder="e.g., 45200"
                min={vehicle.current_mileage + 1}
                required
              />
            </div>
            {error && (
              <p className="mt-2 text-xs font-medium text-[var(--color-danger-text)] flex items-center gap-1.5">
                <AlertCircle size={12} className="flex-shrink-0" /> <span>{error}</span>
              </p>
            )}
          </div>

          {/* Next Service Input (Optional) */}
          <div>
            <label className={labelClass}>
              Next Service Interval (KM){" "}
              <span className="text-[var(--color-ink-subtle)] font-normal normal-case">(Optional)</span>
            </label>
            <div className="relative">
              <CheckCircle2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="number"
                value={nextService}
                onChange={(e) => setNextService(e.target.value)}
                className={`${inputClass} pl-10 font-mono`}
                placeholder="e.g., 50000"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-[var(--color-surface-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all disabled:opacity-50 text-center active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />}
              <span>{isLoading ? "Processing..." : "Update & Release to Fleet"}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

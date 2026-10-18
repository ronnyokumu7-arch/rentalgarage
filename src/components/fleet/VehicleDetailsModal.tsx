"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Loader2 } from "lucide-react";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Vehicle } from "@/lib/types";

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  make: string;
  model: string;
  year: number;
  plate_number: string;
  vin: string;
  daily_rate: string;
  current_mileage: string;
  next_service_km: string;
  notes: string;
  supports_airport_transfer: boolean;
  airport_transfer_base_rate: string;
  supports_wedding_service: boolean;
  wedding_base_rate: string;
}

const EMPTY_FORM: FormState = {
  make: "",
  model: "",
  year: new Date().getFullYear(),
  plate_number: "",
  vin: "",
  daily_rate: "",
  current_mileage: "",
  next_service_km: "",
  notes: "",
  supports_airport_transfer: false,
  airport_transfer_base_rate: "",
  supports_wedding_service: false,
  wedding_base_rate: "",
};

export default function VehicleDetailsModal({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
}: VehicleDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!vehicle || !isOpen) return;
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      plate_number: vehicle.plate_number,
      vin: vehicle.vin ?? "",
      daily_rate: String(Number(vehicle.daily_rate)),
      current_mileage: String(vehicle.current_mileage),
      next_service_km: vehicle.next_service_km != null ? String(vehicle.next_service_km) : "",
      notes: vehicle.notes ?? "",
      supports_airport_transfer: !!vehicle.supports_airport_transfer,
      airport_transfer_base_rate:
        vehicle.airport_transfer_base_rate != null
          ? String(Number(vehicle.airport_transfer_base_rate))
          : "",
      supports_wedding_service: !!vehicle.supports_wedding_service,
      wedding_base_rate:
        vehicle.wedding_base_rate != null ? String(Number(vehicle.wedding_base_rate)) : "",
    });
  }, [vehicle, isOpen]);

  if (!isOpen || !vehicle) return null;

  const isInvestor = !!vehicle.owner_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    setLoading(true);

    try {
      const common = {
        daily_rate: Number(form.daily_rate) || 0,
        current_mileage: Number(form.current_mileage) || 0,
        next_service_km: form.next_service_km.trim() === "" ? null : Number(form.next_service_km),
        notes: form.notes.trim() === "" ? null : form.notes.trim(),
        supports_airport_transfer: form.supports_airport_transfer,
        airport_transfer_base_rate:
          form.supports_airport_transfer && form.airport_transfer_base_rate.trim() !== ""
            ? Number(form.airport_transfer_base_rate)
            : null,
        supports_wedding_service: form.supports_wedding_service,
        wedding_base_rate:
          form.supports_wedding_service && form.wedding_base_rate.trim() !== ""
            ? Number(form.wedding_base_rate)
            : null,
      };

      if (isInvestor) {
        await vehiclesApi.updateInvestorVehicle(vehicle.id, common);
      } else {
        await vehiclesApi.update(vehicle.id, {
          ...common,
          make: form.make.trim(),
          model: form.model.trim(),
          year: Number(form.year),
          plate_number: form.plate_number.trim().toUpperCase(),
          vin: form.vin.trim() === "" ? null : form.vin.trim().toUpperCase(),
        });
      }

      toast.success("Vehicle details updated");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; message?: string } } };
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Failed to update vehicle"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-10 px-3 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all";

  const labelClass =
    "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";

  const toggleClass = (on: boolean) =>
    `relative w-9 h-5 rounded-full transition-colors ${on ? "bg-[var(--color-primary)]" : "bg-[var(--color-surface-border)]"}`;

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[var(--color-surface)] rounded-t-[28px] sm:rounded-2xl border-t sm:border border-[var(--color-surface-border)] shadow-2xl sm:shadow-[var(--shadow-dropdown)] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-surface-border)] flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--color-ink)]">
              Edit Vehicle Details
            </h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
              {vehicle.make} {vehicle.model} · {vehicle.plate_number}
              {isInvestor && <span className="ml-1.5 text-purple-600 dark:text-purple-400 font-semibold">· Investor</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-[var(--color-ink-muted)]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {isInvestor && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Identity fields (make, model, year, plate, VIN) are locked for investor-owned vehicles. You can still edit pricing, mileage, service, and notes.
            </div>
          )}

          {/* Identity (agency only) */}
          {!isInvestor && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Make</label>
                  <input
                    required
                    type="text"
                    value={form.make}
                    onChange={(e) => setForm({ ...form, make: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Model</label>
                  <input
                    required
                    type="text"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Year</label>
                  <input
                    required
                    type="number"
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Plate</label>
                  <input
                    required
                    type="text"
                    value={form.plate_number}
                    onChange={(e) => setForm({ ...form, plate_number: e.target.value.toUpperCase() })}
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>VIN</label>
                <input
                  type="text"
                  value={form.vin}
                  onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
                  className={`${inputClass} font-mono`}
                  placeholder="Optional"
                />
              </div>
            </>
          )}

          {/* Pricing + Mileage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Daily Rate (KES)</label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={form.daily_rate}
                onChange={(e) => setForm({ ...form, daily_rate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Current Mileage (km)</label>
              <input
                required
                type="number"
                min={0}
                value={form.current_mileage}
                onChange={(e) => setForm({ ...form, current_mileage: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Next Service (km)</label>
            <input
              type="number"
              min={0}
              value={form.next_service_km}
              onChange={(e) => setForm({ ...form, next_service_km: e.target.value })}
              className={inputClass}
              placeholder="Optional"
            />
          </div>

          {/* Service toggles */}
          <div className="rounded-lg border border-[var(--color-surface-border)] p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--color-ink)]">Airport Transfer</p>
                <p className="text-[10px] text-[var(--color-ink-muted)]">Offer this vehicle for airport runs</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, supports_airport_transfer: !form.supports_airport_transfer })}
                className={toggleClass(form.supports_airport_transfer)}
                aria-pressed={form.supports_airport_transfer}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.supports_airport_transfer ? "translate-x-4" : ""}`} />
              </button>
            </div>
            {form.supports_airport_transfer && (
              <div>
                <label className={labelClass}>Airport Base Rate (KES)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.airport_transfer_base_rate}
                  onChange={(e) => setForm({ ...form, airport_transfer_base_rate: e.target.value })}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--color-surface-border)] p-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--color-ink)]">Wedding Service</p>
                <p className="text-[10px] text-[var(--color-ink-muted)]">Offer this vehicle for wedding events</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, supports_wedding_service: !form.supports_wedding_service })}
                className={toggleClass(form.supports_wedding_service)}
                aria-pressed={form.supports_wedding_service}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.supports_wedding_service ? "translate-x-4" : ""}`} />
              </button>
            </div>
            {form.supports_wedding_service && (
              <div>
                <label className={labelClass}>Wedding Base Rate (KES)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.wedding_base_rate}
                  onChange={(e) => setForm({ ...form, wedding_base_rate: e.target.value })}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`${inputClass} h-auto py-2 resize-none`}
              placeholder="Optional notes about this vehicle"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--color-surface-border)] flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-xs font-bold text-[var(--color-ink)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-10 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

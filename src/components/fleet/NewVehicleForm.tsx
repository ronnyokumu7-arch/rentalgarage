// src/components/fleet/NewVehicleForm.tsx
"use client";

import React from "react";
import {
  Car,
  CurrencyDollar as DollarSign,
  Shield,
  CheckCircle,
  FileText,
  WarningCircle as AlertCircle,
  CircleNotch as Loader2,
  CaretDown as ChevronDown,
  Calendar,
  Gauge,
  Hash,
  Note as StickyNote,
} from "@phosphor-icons/react/ssr";
import { CAR_DATA, YEARS } from "@/hooks/fleet/useNewVehicleForm";

interface NewVehicleFormProps {
  loading: boolean;
  formData: Record<string, string>;
  insuranceFile: File | null;
  setInsuranceFile: (f: File | null) => void;
  registrationFile: File | null;
  setRegistrationFile: (f: File | null) => void;
  inspectionFile: File | null;
  setInspectionFile: (f: File | null) => void;
  updateField: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const selectClass =
  "w-full px-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm appearance-none cursor-pointer";
const labelClass =
  "block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const sectionClass =
  "bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-3.5 sm:p-4";

export default function NewVehicleForm({
  loading,
  formData,
  insuranceFile,
  setInsuranceFile,
  registrationFile,
  setRegistrationFile,
  inspectionFile,
  setInspectionFile,
  updateField,
  handleSubmit,
}: NewVehicleFormProps) {
  const docCount = [insuranceFile, registrationFile, inspectionFile].filter(Boolean).length;
  const hasInsurance = !!formData.insurance_number && !!formData.insurance_expiry;

  const FileUploadSlot = ({
    label,
    icon: Icon,
    file,
    setFile,
  }: {
    label: string;
    icon: React.ElementType;
    file: File | null;
    setFile: (f: File | null) => void;
  }) => (
    <label className="group relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all cursor-pointer min-h-[70px]">
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      {file ? (
        <>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] flex items-center justify-center mb-1 flex-shrink-0">
            <CheckCircle size={12} aria-hidden="true" />
          </div>
          <p className="text-[9px] font-bold text-[var(--color-ink)] truncate max-w-[60px] sm:max-w-[70px] text-center">
            {file.name}
          </p>
        </>
      ) : (
        <>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] flex items-center justify-center mb-1 flex-shrink-0">
            <Icon size={12} aria-hidden="true" />
          </div>
          <p className="text-[9px] font-semibold text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] text-center leading-tight">
            {label}
          </p>
        </>
      )}
    </label>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-6xl mx-auto p-3.5 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start pb-12 sm:pb-6"
    >
      {/* LEFT COLUMN: Identity + Compliance */}
      <div className="space-y-3 sm:space-y-4">
        {/* Section 1: Identity */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
              <Car size={14} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Vehicle Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Make <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.make}
                  onChange={(e) => updateField("make", e.target.value)}
                  className={`${selectClass} pr-8`}
                  required
                >
                  <option value="">Select Make</option>
                  {Object.keys(CAR_DATA).map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" aria-hidden="true"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Model <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.model}
                  onChange={(e) => updateField("model", e.target.value)}
                  disabled={!formData.make}
                  className={`${selectClass} pr-8 disabled:opacity-50`}
                  required
                >
                  <option value="">{formData.make ? "Select Model" : "Select Make First"}</option>
                  {formData.make &&
                    CAR_DATA[formData.make]?.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" aria-hidden="true"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:contents">
              <div>
                <label className={labelClass}>
                  Year <span className="text-[var(--color-danger)]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.year}
                    onChange={(e) => updateField("year", e.target.value)}
                    className={`${selectClass} pr-8`}
                    required
                  >
                    <option value="">Select Year</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" aria-hidden="true"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Plate Number <span className="text-[var(--color-danger)]">*</span>
                </label>
                <div className="relative">
                  <Hash
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={formData.plate_number}
                    onChange={(e) => updateField("plate_number", e.target.value.toUpperCase())}
                    placeholder="KDA 123A"
                    className={`${inputClass} pl-8`}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>VIN (Optional)</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
                placeholder="17-character vehicle identification number"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Compliance */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
              <Shield size={14} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Compliance</h3>
          </div>

          {hasInsurance ? (
            <div className="mb-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
              <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
              <p className="text-[10px] sm:text-xs text-emerald-400 font-medium">
                Vehicle can be activated immediately after onboarding.
              </p>
            </div>
          ) : (
            <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle size={13} className="text-amber-500 flex-shrink-0" aria-hidden="true" />
              <p className="text-[10px] sm:text-xs text-amber-400 font-medium">
                Add insurance details to enable immediate activation.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelClass}>Insurance Policy Number</label>
              <input
                type="text"
                value={formData.insurance_number}
                onChange={(e) => updateField("insurance_number", e.target.value)}
                placeholder="POL-12345678"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Insurance Expiry Date</label>
              <div className="relative">
                <Calendar
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" aria-hidden="true"
                />
                <input
                  type="date"
                  value={formData.insurance_expiry}
                  onChange={(e) => updateField("insurance_expiry", e.target.value)}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Documents ({docCount}/3 uploaded)</label>
            <div className="grid grid-cols-3 gap-2">
              <FileUploadSlot
                label="Insurance"
                icon={FileText}
                file={insuranceFile}
                setFile={setInsuranceFile}
              />
              <FileUploadSlot
                label="Registration"
                icon={FileText}
                file={registrationFile}
                setFile={setRegistrationFile}
              />
              <FileUploadSlot
                label="Inspection"
                icon={FileText}
                file={inspectionFile}
                setFile={setInspectionFile}
              />
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Financials → Notes → CTA */}
      <aside className="lg:sticky lg:top-4 space-y-3 sm:space-y-4">
        {/* Financials */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <DollarSign size={14} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Financials & Usage</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>
                Daily Rate (KES) <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.daily_rate}
                onChange={(e) => updateField("daily_rate", e.target.value)}
                placeholder="0.00"
                className={inputClass}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Current Mileage</label>
                <div className="relative">
                  <Gauge
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" aria-hidden="true"
                  />
                  <input
                    type="number"
                    min="0"
                    value={formData.current_mileage}
                    onChange={(e) => updateField("current_mileage", e.target.value)}
                    placeholder="0"
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Next Service</label>
                <input
                  type="number"
                  min="0"
                  value={formData.next_service_km}
                  onChange={(e) => updateField("next_service_km", e.target.value)}
                  placeholder="km"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Internal Notes */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <StickyNote size={14} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Internal Notes</h3>
          </div>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm resize-none"
            placeholder="Any specific conditions, accessories, or notes about this vehicle..."
          />
        </section>

        {/* CTA Card */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Adding Vehicle...
              </>
            ) : (
              <>
                <CheckCircle size={16} aria-hidden="true" />
                Add Vehicle to Fleet
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-[var(--color-ink-muted)] mt-2">
            Vehicle will be added in pending activation state
          </p>
        </div>
      </aside>
    </form>
  );
}
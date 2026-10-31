// src/components/client/form/DrivingArrangementSection.tsx
"use client";

import {
  Car, UserCheck, Shield, FileText, Calendar, AlertCircle,
} from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import DocUploadSlot from "./DocUploadSlot";
import { formatDateToLocalYYYYMMDD } from "./types";
import type { SectionProps } from "./types";
import "@/styles/phone-input.css";

interface DrivingArrangementSectionProps extends SectionProps {
  dlFrontFile: File | null;
  setDlFrontFile: (f: File | null) => void;
  existingDlFront?: string | null;
  driverIdFrontFile: File | null;
  setDriverIdFrontFile: (f: File | null) => void;
  driverDlFrontFile: File | null;
  setDriverDlFrontFile: (f: File | null) => void;
  existingDriverIdFront?: string | null;
  existingDriverDlFront?: string | null;
}

const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const sectionClass =
  "bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5";
const inputBaseClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";

export default function DrivingArrangementSection({
  formData,
  updateField,
  fieldErrors,
  hasErr,
  inputCls,
  renderError,
  dlFrontFile,
  setDlFrontFile,
  existingDlFront,
  driverIdFrontFile,
  setDriverIdFrontFile,
  driverDlFrontFile,
  setDriverDlFrontFile,
  existingDriverIdFront,
  existingDriverDlFront,
}: DrivingArrangementSectionProps) {
  const drivingArrangement = formData.driving_arrangement || "self_drive";
  const isSelfDrive = drivingArrangement === "self_drive";
  const isOwnDriver = drivingArrangement === "own_driver";
  const isChauffeur = drivingArrangement === "chauffeur";

  return (
    <section className={sectionClass}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Car size={16} />
        </div>
        <h3 className="text-sm font-bold text-[var(--color-ink)]">
          Driving Arrangement
        </h3>
      </div>

      {/* Arrangement radios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <label
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            isSelfDrive
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
          }`}
        >
          <input
            type="radio"
            name="driving_arrangement"
            value="self_drive"
            checked={isSelfDrive}
            onChange={(e) => updateField("driving_arrangement", e.target.value)}
            className="sr-only"
          />
          <Car
            size={20}
            className={isSelfDrive ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)]"}
          />
          <span className="text-sm font-bold text-[var(--color-ink)]">Self Drive</span>
          <span className="text-[10px] text-[var(--color-ink-muted)] text-center">
            I'll drive myself
          </span>
        </label>

        <label
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            isOwnDriver
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
          }`}
        >
          <input
            type="radio"
            name="driving_arrangement"
            value="own_driver"
            checked={isOwnDriver}
            onChange={(e) => updateField("driving_arrangement", e.target.value)}
            className="sr-only"
          />
          <UserCheck
            size={20}
            className={isOwnDriver ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)]"}
          />
          <span className="text-sm font-bold text-[var(--color-ink)]">My Driver</span>
          <span className="text-[10px] text-[var(--color-ink-muted)] text-center">
            I have my own driver
          </span>
        </label>

        <label
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            isChauffeur
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
          }`}
        >
          <input
            type="radio"
            name="driving_arrangement"
            value="chauffeur"
            checked={isChauffeur}
            onChange={(e) => updateField("driving_arrangement", e.target.value)}
            className="sr-only"
          />
          <Shield
            size={20}
            className={isChauffeur ? "text-[var(--color-primary)]" : "text-[var(--color-ink-muted)]"}
          />
          <span className="text-sm font-bold text-[var(--color-ink)]">Chauffeur</span>
          <span className="text-[10px] text-[var(--color-ink-muted)] text-center">
            Assign agency driver
          </span>
        </label>
      </div>

      {/* SELF DRIVE: Client's own DL details + upload */}
      {isSelfDrive && (
        <div className="mt-2 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Car size={14} className="text-purple-500" />
            <h4 className="text-xs font-bold text-[var(--color-ink)]">
              Your Driving License
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="field-dl_number">
              <label className={labelClass}>
                DL Number <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="relative">
                <Car
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]"
                />
                <input
                  type="text"
                  value={formData.dl_number}
                  onChange={(e) => updateField("dl_number", e.target.value)}
                  placeholder="DL-01234"
                  className={`${inputCls("dl_number")} pl-9`}
                />
              </div>
              {renderError("dl_number")}
            </div>

            <div id="field-dl_expiry">
              <label className={labelClass}>
                Expiry Date <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="relative group">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10"
                />
                <Flatpickr
                  value={formData.dl_expiry}
                  onChange={(dates) => {
                    if (dates[0]) updateField("dl_expiry", formatDateToLocalYYYYMMDD(dates[0]));
                  }}
                  options={{ dateFormat: "Y-m-d", minDate: "today", disableMobile: true }}
                  className={`${inputBaseClass} pl-9`}
                  placeholder="Select date..."
                />
              </div>
            </div>

            <div id="field-dl_issued_date">
              <label className={labelClass}>Issue Date</label>
              <div className="relative group">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none z-10"
                />
                <Flatpickr
                  value={formData.dl_issued_date}
                  onChange={(dates) => {
                    if (dates[0]) updateField("dl_issued_date", formatDateToLocalYYYYMMDD(dates[0]));
                  }}
                  options={{ dateFormat: "Y-m-d", maxDate: "today", disableMobile: true }}
                  className={`${inputBaseClass} pl-9`}
                  placeholder="Select date..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Driving License Upload <span className="text-[var(--color-danger)]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <DocUploadSlot
                label="DL Front"
                icon={Car}
                file={dlFrontFile}
                setFile={setDlFrontFile}
                required
                existingUrl={existingDlFront}
                captureMode="environment"
                error={fieldErrors["dlFront"]}
                fieldId="field-dlFront"
              />
            </div>
          </div>
        </div>
      )}

      {/* MY DRIVER: Driver's details + required uploads */}
      {isOwnDriver && (
        <div className="mt-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <UserCheck size={14} className="text-blue-500" />
            <h4 className="text-xs font-bold text-[var(--color-ink)]">
              Driver Details
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div id="field-driver_full_name">
              <label className={labelClass}>
                Full Name <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="text"
                value={formData.driver_full_name || ""}
                onChange={(e) => updateField("driver_full_name", e.target.value)}
                placeholder="Full Name"
                className={inputCls("driver_full_name")}
              />
              {renderError("driver_full_name")}
            </div>

            <div id="field-driver_phone">
              <label className={labelClass}>
                Phone <span className="text-[var(--color-danger)]">*</span>
              </label>
              <PhoneInput
                international
                defaultCountry="KE"
                value={formData.driver_phone}
                onChange={(value) => updateField("driver_phone", value || "")}
                placeholder="+254 7..."
                className={`phone-input-custom ${hasErr("driver_phone") ? "phone-input-error" : ""}`}
                countryCallingCodeEditable={false}
              />
              {renderError("driver_phone")}
            </div>

            <div id="field-driver_id_number">
              <label className={labelClass}>
                ID Number <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="text"
                value={formData.driver_id_number || ""}
                onChange={(e) => updateField("driver_id_number", e.target.value)}
                placeholder="ID Number"
                className={inputCls("driver_id_number")}
              />
              {renderError("driver_id_number")}
            </div>

            <div id="field-driver_dl_number">
              <label className={labelClass}>
                DL Number <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="text"
                value={formData.driver_dl_number || ""}
                onChange={(e) => updateField("driver_dl_number", e.target.value)}
                placeholder="DL Number"
                className={inputCls("driver_dl_number")}
              />
              {renderError("driver_dl_number")}
            </div>

            <div id="field-driver_dl_expiry">
              <label className={labelClass}>
                DL Expiry Date <span className="text-[var(--color-danger)]">*</span>
              </label>
              <Flatpickr
                value={formData.driver_dl_expiry}
                onChange={(dates) => {
                  if (dates[0]) updateField("driver_dl_expiry", formatDateToLocalYYYYMMDD(dates[0]));
                }}
                options={{ dateFormat: "Y-m-d", minDate: "today", disableMobile: true }}
                className={inputBaseClass}
                placeholder="Select date..."
              />
              {renderError("driver_dl_expiry")}
            </div>

            <div id="field-driver_dl_issued_date">
              <label className={labelClass}>DL Issue Date</label>
              <Flatpickr
                value={formData.driver_dl_issued_date}
                onChange={(dates) => {
                  if (dates[0]) updateField("driver_dl_issued_date", formatDateToLocalYYYYMMDD(dates[0]));
                }}
                options={{ dateFormat: "Y-m-d", maxDate: "today", disableMobile: true }}
                className={inputBaseClass}
                placeholder="Select date..."
              />
              {renderError("driver_dl_issued_date")}
            </div>
          </div>

          {/* ✅ REQUIRED: Driver documents (backend KYC gate requires them) */}
          <div className="pt-2 border-t border-blue-500/10">
            <label className={labelClass}>
              Driver Documents <span className="text-[var(--color-danger)]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <DocUploadSlot
                label="Driver ID Front"
                icon={FileText}
                file={driverIdFrontFile}
                setFile={setDriverIdFrontFile}
                required
                existingUrl={existingDriverIdFront}
                captureMode="environment"
                error={fieldErrors["driverIdFront"]}
                fieldId="field-driverIdFront"
              />
              <DocUploadSlot
                label="Driver DL Front"
                icon={Car}
                file={driverDlFrontFile}
                setFile={setDriverDlFrontFile}
                required
                existingUrl={existingDriverDlFront}
                captureMode="environment"
                error={fieldErrors["driverDlFront"]}
                fieldId="field-driverDlFront"
              />
            </div>
          </div>
        </div>
      )}

      {/* CHAUFFEUR: informational note */}
      {isChauffeur && (
        <div className="mt-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[var(--color-ink)]">
              Agency will assign a driver
            </p>
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5 leading-relaxed">
              No driver details or license required from you. The agency will
              handle driver assignment, verification, and documentation.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

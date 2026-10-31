// src/components/client/form/DrivingArrangementSection.tsx
"use client";

import {
  Car, UserCheck, Shield, FileText,
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
  driverIdFrontFile: File | null;
  setDriverIdFrontFile: (f: File | null) => void;
  driverDlFrontFile: File | null;
  setDriverDlFrontFile: (f: File | null) => void;
}

const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const sectionClass =
  "bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5";

export default function DrivingArrangementSection({
  formData,
  updateField,
  fieldErrors,
  hasErr,
  inputCls,
  renderError,
  driverIdFrontFile,
  setDriverIdFrontFile,
  driverDlFrontFile,
  setDriverDlFrontFile,
}: DrivingArrangementSectionProps) {
  const drivingArrangement = formData.driving_arrangement || "self_drive";

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <label
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            drivingArrangement === "self_drive"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
          }`}
        >
          <input
            type="radio"
            name="driving_arrangement"
            value="self_drive"
            checked={drivingArrangement === "self_drive"}
            onChange={(e) => updateField("driving_arrangement", e.target.value)}
            className="sr-only"
          />
          <Car
            size={20}
            className={
              drivingArrangement === "self_drive"
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-ink-muted)]"
            }
          />
          <span className="text-sm font-bold text-[var(--color-ink)]">
            Self Drive
          </span>
          <span className="text-[10px] text-[var(--color-ink-muted)] text-center">
            I'll drive myself
          </span>
        </label>

        <label
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            drivingArrangement === "own_driver"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
          }`}
        >
          <input
            type="radio"
            name="driving_arrangement"
            value="own_driver"
            checked={drivingArrangement === "own_driver"}
            onChange={(e) => updateField("driving_arrangement", e.target.value)}
            className="sr-only"
          />
          <UserCheck
            size={20}
            className={
              drivingArrangement === "own_driver"
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-ink-muted)]"
            }
          />
          <span className="text-sm font-bold text-[var(--color-ink)]">
            My Driver
          </span>
          <span className="text-[10px] text-[var(--color-ink-muted)] text-center">
            I have my own driver
          </span>
        </label>

        <label
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            drivingArrangement === "chauffeur"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
          }`}
        >
          <input
            type="radio"
            name="driving_arrangement"
            value="chauffeur"
            checked={drivingArrangement === "chauffeur"}
            onChange={(e) => updateField("driving_arrangement", e.target.value)}
            className="sr-only"
          />
          <Shield
            size={20}
            className={
              drivingArrangement === "chauffeur"
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-ink-muted)]"
            }
          />
          <span className="text-sm font-bold text-[var(--color-ink)]">
            Chauffeur
          </span>
          <span className="text-[10px] text-[var(--color-ink-muted)] text-center">
            Assign agency driver
          </span>
        </label>
      </div>

      {drivingArrangement === "own_driver" && (
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
                Driver's Full Name <span className="text-[var(--color-danger)]">*</span>
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
                Driver's Phone <span className="text-[var(--color-danger)]">*</span>
              </label>
              <PhoneInput
                international
                defaultCountry="KE"
                value={formData.driver_phone}
                onChange={(value) => updateField("driver_phone", value || "")}
                placeholder="+254 7..."
                className={`phone-input-custom ${
                  hasErr("driver_phone") ? "phone-input-error" : ""
                }`}
                countryCallingCodeEditable={false}
              />
              {renderError("driver_phone")}
            </div>

            <div id="field-driver_id_number">
              <label className={labelClass}>
                Driver's ID Number <span className="text-[var(--color-danger)]">*</span>
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
                Driver's License Number <span className="text-[var(--color-danger)]">*</span>
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
                  if (dates[0])
                    updateField("driver_dl_expiry", formatDateToLocalYYYYMMDD(dates[0]));
                }}
                options={{ dateFormat: "Y-m-d", minDate: "today", disableMobile: true }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                placeholder="Select date..."
              />
              {renderError("driver_dl_expiry")}
            </div>

            <div id="field-driver_dl_issued_date">
              <label className={labelClass}>DL Issue Date</label>
              <Flatpickr
                value={formData.driver_dl_issued_date}
                onChange={(dates) => {
                  if (dates[0])
                    updateField("driver_dl_issued_date", formatDateToLocalYYYYMMDD(dates[0]));
                }}
                options={{ dateFormat: "Y-m-d", maxDate: "today", disableMobile: true }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                placeholder="Select date..."
              />
              {renderError("driver_dl_issued_date")}
            </div>
          </div>

          {/* Driver document uploads */}
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
                captureMode="environment"
                error={fieldErrors["driverIdFront"]}
              />
              <DocUploadSlot
                label="Driver DL Front"
                icon={Car}
                file={driverDlFrontFile}
                setFile={setDriverDlFrontFile}
                required
                captureMode="environment"
                error={fieldErrors["driverDlFront"]}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// src/components/client/form/ComplianceSection.tsx
"use client";

import {
  Shield, Car, Calendar, FileText, AlertCircle,
} from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import DocUploadSlot from "./DocUploadSlot";
import { formatDateToLocalYYYYMMDD } from "./types";
import type { SectionProps } from "./types";

interface ComplianceSectionProps extends SectionProps {
  idFrontFile: File | null;
  setIdFrontFile: (f: File | null) => void;
  idBackFile: File | null;
  setIdBackFile: (f: File | null) => void;
  dlFrontFile: File | null;
  setDlFrontFile: (f: File | null) => void;
  existingIdFront?: string | null;
  existingIdBack?: string | null;
  existingDlFront?: string | null;
}

const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const sectionClass =
  "bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5";
const inputBaseClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";

export default function ComplianceSection({
  formData,
  updateField,
  fieldErrors,
  inputCls,
  idFrontFile,
  setIdFrontFile,
  idBackFile,
  setIdBackFile,
  dlFrontFile,
  setDlFrontFile,
  existingIdFront,
  existingIdBack,
  existingDlFront,
}: ComplianceSectionProps) {
  const drivingArrangement = formData.driving_arrangement || "self_drive";
  const requiresSelfDriveDL = drivingArrangement === "self_drive";

  return (
    <section className={sectionClass}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <Shield size={16} />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[var(--color-ink)]">
            Compliance & Documents
          </h3>
          {!requiresSelfDriveDL && (
            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
              DL Optional
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass}>
            Driving License Number{" "}
            {!requiresSelfDriveDL && (
              <span className="text-[var(--color-ink-subtle)] font-normal">
                (Optional)
              </span>
            )}
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
        </div>

        <div>
          <label className={labelClass}>
            DL Expiry Date{" "}
            {!requiresSelfDriveDL && (
              <span className="text-[var(--color-ink-subtle)] font-normal">
                (Optional)
              </span>
            )}
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

        <div>
          <label className={labelClass}>
            DL Issue Date{" "}
            {!requiresSelfDriveDL && (
              <span className="text-[var(--color-ink-subtle)] font-normal">
                (Optional)
              </span>
            )}
          </label>
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

        <AddressAutocomplete
          value={formData.residential_address}
          onChange={(value) => updateField("residential_address", value)}
          label="Residential Address"
          placeholder="Search residential address..."
        />

        <AddressAutocomplete
          value={formData.work_address}
          onChange={(value) => updateField("work_address", value)}
          label="Work Address"
          placeholder="Search work address..."
        />
      </div>

      <div>
        <label className={labelClass}>Client Documents</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <DocUploadSlot
            label="ID Front"
            icon={FileText}
            file={idFrontFile}
            setFile={setIdFrontFile}
            required
            existingUrl={existingIdFront}
            captureMode="environment"
            error={fieldErrors["idFront"]}
            fieldId="field-idFront"
          />
          <DocUploadSlot
            label="ID Back"
            icon={FileText}
            file={idBackFile}
            setFile={setIdBackFile}
            required
            existingUrl={existingIdBack}
            captureMode="environment"
            error={fieldErrors["idBack"]}
            fieldId="field-idBack"
          />
          {requiresSelfDriveDL && (
            <DocUploadSlot
              label="DL Front"
              icon={Car}
              file={dlFrontFile}
              setFile={setDlFrontFile}
              required
              existingUrl={existingDlFront}
              captureMode="optional"
              error={fieldErrors["dlFront"]}
              fieldId="field-dlFront"
            />
          )}
        </div>
        {!requiresSelfDriveDL && (
          <p className="text-[10px] text-[var(--color-ink-muted)] mt-2 flex items-center gap-1.5">
            <AlertCircle size={12} className="text-amber-500" />
            Client DL not required for{" "}
            {drivingArrangement === "own_driver" ? "own driver" : "chauffeur"}{" "}
            arrangements.
          </p>
        )}
      </div>
    </section>
  );
}

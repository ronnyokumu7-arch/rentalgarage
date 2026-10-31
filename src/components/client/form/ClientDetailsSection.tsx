// src/components/client/form/ClientDetailsSection.tsx
"use client";

import {
  User, Camera, Upload, Mail, CreditCard, FileText, Eye,
} from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import SecureImage from "@/components/ui/SecureImage";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import DocUploadSlot from "./DocUploadSlot";
import type { SectionProps } from "./types";
import "@/styles/phone-input.css";

interface ClientDetailsSectionProps extends SectionProps {
  avatarFile: File | null;
  setAvatarFile: (f: File | null) => void;
  existingAvatar?: string | null;
  idFrontFile: File | null;
  setIdFrontFile: (f: File | null) => void;
  idBackFile: File | null;
  setIdBackFile: (f: File | null) => void;
  existingIdFront?: string | null;
  existingIdBack?: string | null;
}

const labelClass =
  "block text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const sectionClass =
  "bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4 sm:p-5";

export default function ClientDetailsSection({
  formData,
  updateField,
  fieldErrors,
  hasErr,
  inputCls,
  renderError,
  openLightbox,
  avatarFile,
  setAvatarFile,
  existingAvatar,
  idFrontFile,
  setIdFrontFile,
  idBackFile,
  setIdBackFile,
  existingIdFront,
  existingIdBack,
}: ClientDetailsSectionProps) {
  const idType = formData.id_type || "national_id";

  return (
    <section className={sectionClass}>
      {/* Header with avatar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <User size={16} />
          </div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">Client Details</h3>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <label className="relative group cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] group-hover:border-[var(--color-primary)] flex items-center justify-center overflow-hidden transition-all">
              {avatarFile ? (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : existingAvatar ? (
                <SecureImage
                  src={existingAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  fallback={<Camera size={16} className="text-[var(--color-ink-subtle)]" />}
                />
              ) : (
                <Camera
                  size={16}
                  className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] transition-colors"
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="user"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg border-2 border-[var(--color-surface)]">
              <Upload size={10} />
            </div>
          </label>

          {existingAvatar && !avatarFile && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openLightbox(existingAvatar!, "Avatar");
              }}
              className="flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-semibold hover:bg-[var(--color-primary)]/20 transition-colors"
            >
              <Eye size={10} />
              View
            </button>
          )}
        </div>
      </div>

      {/* Identity fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div id="field-first_name">
          <label className={labelClass}>
            First Name <span className="text-[var(--color-danger)]">*</span>
          </label>
          <div className="relative">
            <User
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]"
            />
            <input
              type="text"
              value={formData.first_name || ""}
              onChange={(e) => updateField("first_name", e.target.value)}
              placeholder="e.g. Rebecca"
              className={`${inputCls("first_name")} pl-9`}
            />
          </div>
          {renderError("first_name")}
        </div>

        <div id="field-last_name">
          <label className={labelClass}>
            Last Name <span className="text-[var(--color-danger)]">*</span>
          </label>
          <div className="relative">
            <User
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]"
            />
            <input
              type="text"
              value={formData.last_name || ""}
              onChange={(e) => updateField("last_name", e.target.value)}
              placeholder="e.g. Molly"
              className={`${inputCls("last_name")} pl-9`}
            />
          </div>
          {renderError("last_name")}
        </div>

        <div className="sm:col-span-2" id="field-email">
          <label className={labelClass}>Email Address</label>
          <div className="relative">
            <Mail
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]"
            />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="rebecca@example.com"
              className={`${inputCls("email")} pl-9`}
            />
          </div>
          {renderError("email")}
        </div>

        <div className="sm:col-span-2" id="field-phone">
          <label className={labelClass}>
            Phone Number <span className="text-[var(--color-danger)]">*</span>
          </label>
          <PhoneInput
            international
            defaultCountry="KE"
            value={formData.phone}
            onChange={(value) => updateField("phone", value || "")}
            placeholder="+254 712 345678"
            className={`phone-input-custom ${hasErr("phone") ? "phone-input-error" : ""}`}
            countryCallingCodeEditable={false}
          />
          {renderError("phone")}
        </div>
      </div>

      {/* Identity document */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Identity Document <span className="text-[var(--color-danger)]">*</span>
          </label>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                idType === "national_id"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
              }`}
            >
              <input
                type="radio"
                name="id_type"
                value="national_id"
                checked={idType === "national_id"}
                onChange={(e) => updateField("id_type", e.target.value)}
                className="sr-only"
              />
              <CreditCard
                size={16}
                className={
                  idType === "national_id"
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-ink-muted)]"
                }
              />
              <span className="text-sm font-semibold text-[var(--color-ink)]">
                National ID
              </span>
            </label>
            <label
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                idType === "passport"
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/50"
              }`}
            >
              <input
                type="radio"
                name="id_type"
                value="passport"
                checked={idType === "passport"}
                onChange={(e) => updateField("id_type", e.target.value)}
                className="sr-only"
              />
              <FileText
                size={16}
                className={
                  idType === "passport"
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-ink-muted)]"
                }
              />
              <span className="text-sm font-semibold text-[var(--color-ink)]">
                Passport
              </span>
            </label>
          </div>

          <div className="relative" id="field-id_number">
            <CreditCard
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]"
            />
            <input
              type="text"
              value={formData.id_number || ""}
              onChange={(e) => updateField("id_number", e.target.value)}
              placeholder={
                idType === "national_id" ? "National ID Number" : "Passport Number"
              }
              className={`${inputCls("id_number")} pl-9`}
            />
          </div>
          {renderError("id_number")}
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

      {/* Identity document uploads */}
      <div>
        <label className={labelClass}>Identity Documents</label>
        <div className="grid grid-cols-2 gap-3">
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
        </div>
      </div>
    </section>
  );
}

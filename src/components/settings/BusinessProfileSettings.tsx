// src/components/settings/BusinessProfileSettings.tsx
"use client";

import { useRef, useState } from "react";
import {
  Building2, Upload, Globe, Mail, Phone, MapPin, Hash, Shield,
  FileText, User, Save, Loader2, CheckCircle2, Pencil, X, AlertCircle,
} from "lucide-react";
import { useBusinessSettings } from "@/hooks/settings/useBusinessSettings";

type SectionKey = "company" | "footer" | "admin";

export default function BusinessProfileSettings() {
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const hadInvalid = useRef(false);
  const s = useBusinessSettings();

  const toggleSection = (section: SectionKey) => {
    if (editingSection === section) {
      s.discardChanges();
      setEditingSection(null);
    } else {
      if (editingSection) s.discardChanges();
      setEditingSection(section);
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    hadInvalid.current = false;
    const onInvalid = () => { hadInvalid.current = true; };

    if (editingSection === "admin" && s.isAdminDirty) {
      await s.handleSubmitAdmin(s.onSubmitAdmin, onInvalid)(e);
    } else if (editingSection === "company" && (s.isDirty || s.isLogoDirty)) {
      await s.handleSubmit(s.onSubmit, onInvalid)(e);
    } else if (editingSection === "footer" && s.isDirty) {
      await s.handleSubmit(s.onSubmit, onInvalid)(e);
    }

    if (!hadInvalid.current) setEditingSection(null);
  };

  if (s.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <form onSubmit={handleSaveSection}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* ─── LEFT COLUMN ──────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-5 lg:space-y-6">
            {/* Company Information */}
            <Section
              icon={Building2}
              title="Company Information"
              subtitle="Public details and operational contacts"
              isEditing={editingSection === "company"}
              onEdit={() => toggleSection("company")}
              onCancel={() => toggleSection("company")}
              onSave={handleSaveSection}
              isSaving={s.isSaving}
              isDirty={s.isDirty || s.isLogoDirty}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Company Name"
                  icon={Building2}
                  editing={editingSection === "company"}
                  display={s.businessData.company_name}
                  register={s.register("company_name")}
                  error={s.errors.company_name}
                  placeholder="e.g. Nairobi Car Rentals"
                  className="md:col-span-2"
                />
                <Field
                  label="Email Address"
                  icon={Mail}
                  editing={editingSection === "company"}
                  type="email"
                  display={s.businessData.email}
                  register={s.register("email")}
                  error={s.errors.email}
                  placeholder="contact@agency.com"
                />
                <Field
                  label="Phone Number"
                  icon={Phone}
                  editing={editingSection === "company"}
                  type="tel"
                  display={s.businessData.phone}
                  register={s.register("phone")}
                  error={s.errors.phone}
                  placeholder="+254 700 000 000"
                />
                <Field
                  label="Website"
                  icon={Globe}
                  editing={editingSection === "company"}
                  type="url"
                  link
                  display={s.businessData.website}
                  register={s.register("website")}
                  error={s.errors.website}
                  placeholder="website.com or https://www.website.com"
                  className="md:col-span-2"
                />
                <Field
                  label="Business Location"
                  icon={MapPin}
                  editing={editingSection === "company"}
                  display={s.businessData.business_location}
                  register={s.register("business_location")}
                  error={s.errors.business_location}
                  placeholder="e.g. Westlands, Nairobi"
                  className="md:col-span-2"
                />
                <Field
                  label="KRA PIN / Tax ID"
                  icon={Hash}
                  editing={editingSection === "company"}
                  mono
                  display={s.businessData.kra_pin}
                  register={s.register("kra_pin")}
                  error={s.errors.kra_pin}
                  placeholder="A000000000Z"
                  className="md:col-span-2"
                />
              </div>

              {/* Logo sub-section */}
              <div className="mt-5 pt-5 border-t border-[var(--color-surface-border)]/60">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[var(--color-surface-border)] flex items-center justify-center bg-[var(--color-surface-hover)]/50 shrink-0 overflow-hidden">
                    {s.logoPreview ? (
                      <img src={s.logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-[var(--color-ink-subtle)]" />
                    )}
                  </div>
                  {editingSection === "company" ? (
                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/20 cursor-pointer transition-all active:scale-95">
                        <Upload className="w-3.5 h-3.5" /> Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={s.handleLogoChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-[var(--color-ink-subtle)]">PNG, JPG, or SVG · Max 2MB</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--color-ink-muted)]">
                      {s.logoPreview ? "Logo active and visible on invoices." : "No logo uploaded yet."}
                    </p>
                  )}
                </div>
              </div>
            </Section>

            {/* Receipts & Document Footer */}
            <Section
              icon={FileText}
              title="Receipts & Document Footer"
              subtitle="Terms printed at the bottom of receipts"
              isEditing={editingSection === "footer"}
              onEdit={() => toggleSection("footer")}
              onCancel={() => toggleSection("footer")}
              onSave={handleSaveSection}
              isSaving={s.isSaving}
              isDirty={s.isDirty}
            >
              {editingSection === "footer" ? (
                <div>
                  <textarea
                    {...s.register("footer_text")}
                    rows={4}
                    className="w-full p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all resize-y min-h-[120px]"
                    placeholder="e.g. Vehicles must be returned with full tank..."
                  />
                  {s.errors.footer_text && (
                    <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {s.errors.footer_text.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] text-sm text-[var(--color-ink-muted)] leading-relaxed whitespace-pre-wrap">
                  {s.businessData.footer_text || (
                    <span className="italic text-[var(--color-ink-subtle)]">No footer text configured.</span>
                  )}
                </div>
              )}
            </Section>
          </div>

          {/* ─── RIGHT COLUMN ─────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5 lg:space-y-6">
            {/* Administrator Account */}
            <Section
              icon={Shield}
              title="Administrator Account"
              subtitle="Primary admin credentials"
              isEditing={editingSection === "admin"}
              onEdit={() => toggleSection("admin")}
              onCancel={() => toggleSection("admin")}
              onSave={handleSaveSection}
              isSaving={s.isSavingAdmin}
              isDirty={s.isAdminDirty}
            >
              <div className="space-y-4">
                <Field
                  label="Full Name"
                  icon={User}
                  editing={editingSection === "admin"}
                  display={s.adminData.full_name}
                  register={s.registerAdmin("full_name")}
                  error={s.adminErrors.full_name}
                  placeholder="Full name"
                />
                <Field
                  label="Email Address"
                  icon={Mail}
                  editing={editingSection === "admin"}
                  type="email"
                  display={s.adminData.email}
                  register={s.registerAdmin("email")}
                  error={s.adminErrors.email}
                  placeholder="admin@agency.com"
                />
                <Field
                  label="Phone Number"
                  icon={Phone}
                  editing={editingSection === "admin"}
                  type="tel"
                  display={s.adminData.phone_number}
                  register={s.registerAdmin("phone_number")}
                  error={s.adminErrors.phone_number}
                  placeholder="+254 700 000 000"
                />
              </div>

              {s.adminUser && editingSection !== "admin" && (
                <div className="pt-3 mt-3 border-t border-[var(--color-surface-border)]/60 flex items-center justify-between text-xs">
                  <span className="text-[var(--color-ink-subtle)]">Tenant ID</span>
                  <span className="font-mono font-semibold text-[var(--color-ink)]">#{s.adminUser.id}</span>
                </div>
              )}
            </Section>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── Section wrapper with inline edit controls ───────────────────── */

function Section({
  icon: Icon,
  title,
  subtitle,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
  isDirty,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean;
  isDirty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-sm overflow-hidden">
      {/* Header with inline pencil */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[var(--color-ink)] truncate">{title}</h3>
          <p className="text-[11px] text-[var(--color-ink-muted)] truncate">{subtitle}</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-primary)] transition-colors active:scale-95 shrink-0"
            aria-label={`Edit ${title}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5">{children}</div>

      {/* Inline save/cancel actions when editing */}
      {isEditing && (
        <div className="flex items-center justify-end gap-2 px-4 sm:px-5 py-3 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all active:scale-95"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            type="submit"
            onClick={onSave}
            disabled={!isDirty || isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
          >
            {isSaving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving</>
            ) : isDirty ? (
              <><Save className="w-3.5 h-3.5" /> Save</>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Field component ─────────────────────────────────────────────── */

function Field({
  label, icon: Icon, editing, display, register, error,
  type = "text", placeholder = "", mono = false, link = false, className = "",
}: {
  label: string;
  icon: React.ElementType;
  editing: boolean;
  display: string;
  register: any;
  error?: any;
  type?: string;
  placeholder?: string;
  mono?: boolean;
  link?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] mb-1.5">
        {label}
      </label>
      {editing ? (
        <>
          <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-subtle)]" />
            <input
              type={type}
              placeholder={placeholder}
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all"
              {...register}
            />
          </div>
          {error && (
            <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error.message}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] min-h-[44px]">
          <Icon className="w-4 h-4 text-[var(--color-ink-subtle)] shrink-0" />
          {display ? (
            link ? (
              <a
                href={`https://${display.replace(/^https?:\/\//i, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[var(--color-primary)] font-medium hover:underline truncate"
              >
                {display}
              </a>
            ) : (
              <span className={`text-sm text-[var(--color-ink)] truncate ${mono ? "font-mono text-xs" : ""}`}>
                {display}
              </span>
            )
          ) : (
            <span className="text-sm italic text-[var(--color-ink-subtle)]">Not set</span>
          )}
        </div>
      )}
    </div>
  );
}

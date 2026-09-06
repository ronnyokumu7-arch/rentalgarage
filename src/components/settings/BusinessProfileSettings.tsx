"use client";

import { useRef, useState } from "react";
import {
  Building2, Upload, Globe, Mail, Phone, MapPin, Hash, Shield,
  FileText, User, Save, Loader2, CheckCircle2, Edit3, ArrowLeft, AlertCircle,
} from "lucide-react";
import { useBusinessSettings } from "@/hooks/settings/useBusinessSettings";

export default function BusinessProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const hadInvalid = useRef(false);
  const s = useBusinessSettings();

  const toggleEdit = () => {
    if (isEditing) s.discardChanges();
    setIsEditing((p) => !p);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    hadInvalid.current = false;
    const onInvalid = () => { hadInvalid.current = true; };

    if (s.isAdminDirty) await s.handleSubmitAdmin(s.onSubmitAdmin, onInvalid)(e);
    // ✅ FIX: Submit business form if EITHER inputs OR logo changed
    if (s.isDirty || s.isLogoDirty) await s.handleSubmit(s.onSubmit, onInvalid)(e);

    if (!hadInvalid.current) setIsEditing(false);
  };

  if (s.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  // ✅ FIX: Enable Save button if logo changed (even without text edits)
  const isAnyDirty = s.isDirty || s.isAdminDirty || s.isLogoDirty;
  const isAnySaving = s.isSaving || s.isSavingAdmin;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-surface-border)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-ink)]">Business Settings</h2>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Manage company details, admin credentials, and legal disclaimers.
          </p>
        </div>
        <button onClick={toggleEdit} className="btn btn-secondary text-xs">
          {isEditing ? (
            <><ArrowLeft className="w-4 h-4" /> Cancel Editing</>
          ) : (
            <><Edit3 className="w-4 h-4 text-[var(--color-primary)]" /> Edit Settings</>
          )}
        </button>
      </div>

      <form onSubmit={handleSaveAll}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            {/* Company Card */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-surface-border)]">
                <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-ink)]">Company Information</h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">Public details and operational contacts</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Company Name" icon={Building2} editing={isEditing}
                  display={s.businessData.company_name} register={s.register("company_name")}
                  error={s.errors.company_name} placeholder="e.g. Nairobi Car Rentals" className="md:col-span-2" />
                <Field label="Email Address" icon={Mail} editing={isEditing} type="email"
                  display={s.businessData.email} register={s.register("email")}
                  error={s.errors.email} placeholder="contact@agency.com" />
                <Field label="Phone Number" icon={Phone} editing={isEditing} type="tel"
                  display={s.businessData.phone} register={s.register("phone")}
                  error={s.errors.phone} placeholder="+254 700 000 000" />
                <Field label="Website" icon={Globe} editing={isEditing} type="url" link
                  display={s.businessData.website} register={s.register("website")}
                  error={s.errors.website} placeholder="https://www.agency.com" className="md:col-span-2" />
                <Field label="Business Location" icon={MapPin} editing={isEditing}
                  display={s.businessData.business_location} register={s.register("business_location")}
                  error={s.errors.business_location} placeholder="e.g. Westlands, Nairobi" className="md:col-span-2" />
                <Field label="KRA PIN / Tax ID" icon={Hash} editing={isEditing} mono
                  display={s.businessData.kra_pin} register={s.register("kra_pin")}
                  error={s.errors.kra_pin} placeholder="A000000000Z" className="md:col-span-2" />
              </div>
            </div>

            {/* Footer Card */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-surface-border)]">
                <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-ink)]">Receipts & Document Footer</h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">Terms printed at the bottom of receipts and non-contract documents</p>
                </div>
              </div>

              {isEditing ? (
                <div>
                  <span className="label">Terms & Note Footer</span>
                  <textarea
                    {...s.register("footer_text")}
                    rows={4}
                    className="input resize-y min-h-[120px]"
                    placeholder="e.g. Vehicles must be returned with full tank..."
                  />
                  {s.errors.footer_text && (
                    <p className="text-xs text-[var(--color-danger-text)] mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {s.errors.footer_text.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] text-sm text-[var(--color-ink-muted)] leading-relaxed whitespace-pre-wrap">
                  {s.businessData.footer_text || (
                    <span className="italic text-[var(--color-ink-subtle)]">No footer text configured.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            {/* Admin Card */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-surface-border)]">
                <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-ink)]">Administrator Account</h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">Primary admin credentials</p>
                </div>
              </div>

              <div className="space-y-4">
                <Field label="Full Name" icon={User} editing={isEditing}
                  display={s.adminData.full_name} register={s.registerAdmin("full_name")}
                  error={s.adminErrors.full_name} placeholder="Full name" />
                <Field label="Email Address" icon={Mail} editing={isEditing} type="email"
                  display={s.adminData.email} register={s.registerAdmin("email")}
                  error={s.adminErrors.email} placeholder="admin@agency.com" />
                <Field label="Phone Number" icon={Phone} editing={isEditing} type="tel"
                  display={s.adminData.phone_number} register={s.registerAdmin("phone_number")}
                  error={s.adminErrors.phone_number} placeholder="+254 700 000 000" />
              </div>

              {s.adminUser && !isEditing && (
                <div className="pt-4 mt-4 border-t border-[var(--color-surface-border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--color-ink-subtle)]">Tenant ID</span>
                  <span className="font-mono font-semibold text-[var(--color-ink)]">#{s.adminUser.id}</span>
                </div>
              )}
            </div>

            {/* Logo Card */}
            <div className="card">
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-1">Company Logo</h3>
              <p className="text-xs text-[var(--color-ink-muted)] mb-4">Active logo rendered on generated documents</p>
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[var(--color-surface-border)] flex items-center justify-center bg-[var(--color-surface-hover)]/50 shrink-0 overflow-hidden">
                  {s.logoPreview ? (
                    <img src={s.logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-[var(--color-ink-subtle)]" />
                  )}
                </div>
                {isEditing && (
                  <div className="space-y-2">
                    <label className="btn btn-secondary text-xs cursor-pointer">
                      <Upload className="w-4 h-4 text-[var(--color-primary)]" /> Upload Logo
                      <input type="file" accept="image/*" onChange={s.handleLogoChange} className="hidden" />
                    </label>
                    <p className="text-[11px] text-[var(--color-ink-subtle)]">PNG, JPG, or SVG. Max 2MB.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Save Bar (edit mode only) */}
            {isEditing && (
              <div className="sticky top-6">
                <button
                  type="submit"
                  disabled={!isAnyDirty || isAnySaving}
                  className="btn btn-primary w-full py-3.5"
                >
                  {isAnySaving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
                  ) : isAnyDirty ? (
                    <><Save className="w-5 h-5" /> Save All Changes</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> All Changes Saved</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Field: renders read-only display OR input, in place ─────────────────────
function Field({
  label, icon: Icon, editing, display, register, error,
  type = "text", placeholder = "", mono = false, link = false, className = "",
}: {
  label: string;
  icon: any;
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
      <span className="label">{label}</span>
      {editing ? (
        <>
          <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-ink-subtle)]" />
            <input type={type} placeholder={placeholder} className="input pl-10" {...register} />
          </div>
          {error && (
            <p className="text-xs text-[var(--color-danger-text)] mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {error.message}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] min-h-[46px]">
          <Icon className="w-4 h-4 text-[var(--color-ink-subtle)] shrink-0" />
          {display ? (
            link ? (
              <a
                href={display.startsWith("http") ? display : `https://${display}`}
                target="_blank" rel="noreferrer"
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

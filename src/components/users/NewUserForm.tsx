"use client";

import { 
  User, Shield, CheckCircle, Mail, CreditCard, 
  Upload, Camera, FileText, Car, Loader2, Calendar, Lock, Briefcase, Info, Building2, Smartphone
} from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export interface UserInvitePreview {
  tenant_name: string;
  tenant_logo_url?: string | null;
  tenant_phone?: string | null;
  tenant_email?: string | null;
  expires_at?: string | null;
  expected_full_name: string;
  expected_email: string;
  department?: string | null;
  job_title?: string | null;
  role: string;
  is_driver: boolean;
  is_investor: boolean; // ✅ NEW: Flag for investor flow
}

interface NewUserFormProps {
  loading: boolean;
  preview: UserInvitePreview;
  formData: {
    full_name: string;
    email: string;
    phone_number: string;
    id_number: string;
    dl_number: string;
    dl_expiry: string;
    password: string;
    confirmPassword: string;
    // ✅ NEW: Investor Payout Details
    mpesa_phone?: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
  };
  updateField: (field: string, value: string) => void;
  avatarFile: File | null;
  setAvatarFile: (f: File | null) => void;
  idFrontFile: File | null;
  setIdFrontFile: (f: File | null) => void;
  dlFrontFile: File | null;
  setDlFrontFile: (f: File | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

// ✅ BULLETPROOF LOCAL DATE FORMATTER (Fixes timezone offset bug)
const formatDateToLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";
const sectionClass = "bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4";

export default function NewUserForm({
  loading, preview,
  formData, updateField,
  avatarFile, setAvatarFile,
  idFrontFile, setIdFrontFile,
  dlFrontFile, setDlFrontFile,
  handleSubmit,
}: NewUserFormProps) {

  const isDriver = preview.is_driver;
  const isInvestor = preview.is_investor; // ✅ NEW
  
  const docsRequired = isDriver ? 2 : 1; 
  const docsUploaded = (idFrontFile ? 1 : 0) + (isDriver && dlFrontFile ? 1 : 0);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const DocUploadSlot = ({
    label, icon: Icon, file, setFile, required = false,
  }: { 
    label: string; 
    icon: any; 
    file: File | null; 
    setFile: (f: File | null) => void; 
    required?: boolean;
  }) => (
    <div className="flex flex-col gap-1">
      <label className="group relative flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {file ? (
          <>
            <div className="w-7 h-7 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success-text)] flex items-center justify-center mb-1">
              <CheckCircle size={12} />
            </div>
            <p className="text-[9px] font-bold text-[var(--color-ink)] truncate max-w-[70px]">{file.name}</p>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] group-hover:text-[var(--color-primary)] flex items-center justify-center mb-1">
              <Icon size={12} />
            </div>
            <p className="text-[9px] font-semibold text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)]">
              {label} {required && <span className="text-[var(--color-danger)]">*</span>}
            </p>
          </>
        )}
      </label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
      
      {/* LEFT COLUMN: Identity + Compliance + Security */}
      <div className="space-y-3">

        {/* ✅ Tenant Branding Header */}
        <div className="bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 rounded-xl border border-[var(--color-primary)]/20 p-4">
          <div className="flex items-center gap-3">
            {preview.tenant_logo_url ? (
              <img src={preview.tenant_logo_url} alt={preview.tenant_name} className="w-12 h-12 rounded-lg object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center">
                <Briefcase size={24} />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">You've been invited by</p>
              <p className="text-lg font-extrabold text-[var(--color-ink)]">{preview.tenant_name}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Identity */}
        <section className={sectionClass}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                <User size={14} />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-ink)]">Your Identity</h3>
            </div>
            
            {/* Avatar upload */}
            <label className="relative group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface-hover)] border-2 border-dashed border-[var(--color-surface-border)] group-hover:border-[var(--color-primary)] flex items-center justify-center overflow-hidden transition-all">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={14} className="text-[var(--color-ink-subtle)] group-hover:text-[var(--color-primary)] transition-colors" />
                )}
              </div>
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg border-2 border-[var(--color-surface)]">
                <Upload size={8} />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Full Name <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <User size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                <input type="text" value={formData.full_name} onChange={(e) => updateField("full_name", e.target.value)} placeholder="Your full name" className={`${inputClass} pl-8`} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Address <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <Mail size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                <input type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@example.com" className={`${inputClass} pl-8`} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <PhoneInput
                international
                defaultCountry="KE"
                value={formData.phone_number}
                onChange={(value) => updateField("phone_number", value || "")}
                placeholder="+254 712 345678"
                className="phone-input-custom"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>National ID Number <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <CreditCard size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                <input type="text" value={formData.id_number} onChange={(e) => updateField("id_number", e.target.value)} placeholder="National ID Number" className={`${inputClass} pl-8`} required />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Compliance OR Payout Details (Dynamic) */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isInvestor ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-purple-500'}`}>
              {isInvestor ? <Building2 size={14} /> : <Shield size={14} />}
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">
              {isInvestor ? 'Payout & Banking Details' : 'Compliance & Documents'}
            </h3>
          </div>

          {isInvestor ? (
            // ✅ INVESTOR PAYOUT FIELDS
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2">
                <Info size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                  You're joining as a <span className="font-bold">Host Investor</span>. Please provide your preferred payout details. You can update these anytime in your settings.
                </p>
              </div>
              
              <div>
                <label className={labelClass}>M-Pesa Phone Number</label>
                <div className="relative">
                  <Smartphone size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)] z-10 pointer-events-none" />
                  <PhoneInput
                    international
                    defaultCountry="KE"
                    value={formData.mpesa_phone}
                    onChange={(value) => updateField("mpesa_phone", value || "")}
                    placeholder="+254 712 345678"
                    className="phone-input-custom pl-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Bank Name</label>
                  <input type="text" value={formData.bank_name || ""} onChange={(e) => updateField("bank_name", e.target.value)} placeholder="e.g. KCB, Equity, NCBA" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Account Number</label>
                  <input type="text" value={formData.bank_account_number || ""} onChange={(e) => updateField("bank_account_number", e.target.value)} placeholder="1234567890" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Account Name</label>
                  <input type="text" value={formData.bank_account_name || ""} onChange={(e) => updateField("bank_account_name", e.target.value)} placeholder="Your Name" className={inputClass} />
                </div>
              </div>
            </div>
          ) : (
            // ✅ STAFF / DRIVER COMPLIANCE FIELDS
            <>
              {isDriver && (
                <div className="mb-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
                  <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    You're joining as a <span className="font-bold">Driver</span>. Your Driver's License details and DL image are required.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={labelClass}>Driving License Number {isDriver && <span className="text-[var(--color-danger)]">*</span>}</label>
                  <div className="relative">
                    <Car size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                    <input type="text" value={formData.dl_number} onChange={(e) => updateField("dl_number", e.target.value)} placeholder="DL-01234" className={`${inputClass} pl-8`} required={isDriver} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>DL Expiry Date {isDriver && <span className="text-[var(--color-danger)]">*</span>}</label>
                  <div className="relative group">
                    <Calendar size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)] pointer-events-none z-10" />
                    <Flatpickr
                      value={formData.dl_expiry}
                      onChange={(dates) => {
                        if (dates[0]) {
                          updateField("dl_expiry", formatDateToLocalYYYYMMDD(dates[0]));
                        }
                      }}
                      options={{
                        dateFormat: "Y-m-d",
                        minDate: "today",
                        disableMobile: true,
                      }}
                      className={`${inputClass} pl-8`}
                      placeholder="Select date..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClass}>Documents ({docsUploaded}/{docsRequired} uploaded)</label>
                <div className="grid grid-cols-2 gap-2">
                  <DocUploadSlot label="ID Front" icon={FileText} file={idFrontFile} setFile={setIdFrontFile} required />
                  <DocUploadSlot label="DL Front" icon={Car} file={dlFrontFile} setFile={setDlFrontFile} required={isDriver} />
                </div>
              </div>
            </>
          )}
        </section>

        {/* Section 3: Security */}
        <section className={sectionClass}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[var(--color-success-bg)] text-[var(--color-success-text)] flex items-center justify-center">
              <Lock size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Set Your Password</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Password <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <Lock size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                <input type="password" value={formData.password} onChange={(e) => updateField("password", e.target.value)} placeholder="Min 8 characters" className={`${inputClass} pl-8`} required minLength={8} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm Password <span className="text-[var(--color-danger)]">*</span></label>
              <div className="relative">
                <Lock size={12} className="absolute left-2.5 top-2.5 text-[var(--color-ink-subtle)]" />
                <input type="password" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} placeholder="Re-enter password" className={`${inputClass} pl-8`} required />
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-[10px] font-semibold text-[var(--color-danger-text)] mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* RIGHT COLUMN: Role → Preview → CTA */}
      <aside className="lg:sticky lg:top-4 space-y-3">
        
        {/* Role Card */}
        <section className={`${sectionClass} ${isInvestor ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isInvestor ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'}`}>
              <Briefcase size={14} />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Your Role</h3>
          </div>
          <div className="space-y-2 text-xs">
            {isInvestor ? (
              <>
                <div className="flex justify-between">
                  <span className="text-[var(--color-ink-muted)]">Position</span>
                  <span className="font-bold text-[var(--color-ink)]">Host Investor</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-center text-[10px] uppercase tracking-wider">
                  Investor — Payout Details Required
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-[var(--color-ink-muted)]">Position</span>
                  <span className="font-bold text-[var(--color-ink)]">{preview.job_title || "Team Member"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-ink-muted)]">Department</span>
                  <span className="font-semibold text-[var(--color-ink)]">{preview.department || "—"}</span>
                </div>
                {isDriver && (
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-center text-[10px] uppercase tracking-wider">
                    Driver — DL Required
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Live Preview */}
        <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)] rounded-xl border border-[var(--color-surface-border)] p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-3">Preview</div>
          
          <div className="flex items-start gap-3 mb-3">
            {avatarFile ? (
              <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                <User size={20} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[var(--color-ink)] truncate">
                {formData.full_name || preview.expected_full_name}
              </div>
              <div className="text-[11px] text-[var(--color-ink-muted)] truncate">
                {formData.email || preview.expected_email}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-[var(--color-surface-border)] text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">Phone</span>
              <span className="font-semibold text-[var(--color-ink)] truncate max-w-[120px]">{formData.phone_number || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">National ID</span>
              <span className="font-semibold text-[var(--color-ink)]">{formData.id_number || "—"}</span>
            </div>
            {isInvestor ? (
               <div className="flex justify-between">
               <span className="text-[var(--color-ink-muted)]">Bank</span>
               <span className="font-semibold text-[var(--color-ink)] truncate max-w-[120px]">{formData.bank_name || "—"}</span>
             </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-[var(--color-ink-muted)]">Documents</span>
                <span className="font-semibold text-[var(--color-ink)]">{docsUploaded}/{docsRequired}</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Card */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] p-4">
          <button 
            type="submit" 
            disabled={loading || (formData.confirmPassword !== "" && !passwordsMatch)} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Activate Account
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-[var(--color-ink-muted)] mt-2">
            You'll be redirected to login after activation
          </p>
        </div>

      </aside>
    </form>
  );
}

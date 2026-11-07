// src/app/dashboard/users/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, User, Shield, Phone, CheckCircle,
  Envelope as Mail, CreditCard, Briefcase, Lock, CircleNotch as Loader2
} from "@phosphor-icons/react/ssr";
import toast from "react-hot-toast";
import { usersApi, type UserCreatePayload } from "@/lib/api/users";

// ── Design System Constants ─────────────────────────────────────────────────
const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm";
const selectClass = "w-full px-4 py-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all duration-200 text-sm appearance-none";
const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2";

// ✅ STRICT SYSTEM-ALIGNED TITLES (No fluff, only operational roles)
const ADMIN_TITLES = ["Director", "Manager", "HR"];
const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  "Finance": ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

const steps = [
  { id: 1, label: "Role & Access", icon: Shield },
  { id: 2, label: "Identity", icon: User },
  { id: 3, label: "Compliance", icon: CreditCard },
  { id: 4, label: "Review", icon: CheckCircle },
];

type RoleType = "admin" | "staff" | null;

export default function NewUserPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [roleType, setRoleType] = useState<RoleType>(null);
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    id_number: "",
    dl_number: "",
    dl_expiry: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ PREVENT AUTO-SUBMIT: Move focus to next input on Enter (Form Level)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && e.target instanceof HTMLElement) {
      e.preventDefault();
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        const form = e.currentTarget;
        const inputs = Array.from(form.querySelectorAll('input:not([type="submit"]), select'));
        const currentIndex = inputs.indexOf(e.target as HTMLElement);
        
        if (currentIndex > -1 && currentIndex < inputs.length - 1) {
          (inputs[currentIndex + 1] as HTMLElement).focus();
        }
      }
    }
  };

  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (!roleType) { toast.error("Please select a role type."); return false; }
      if (!jobTitle) { toast.error("Please select a job title."); return false; }
      if (roleType === "staff" && !department) { toast.error("Please select a department."); return false; }
    }
    if (currentStep === 2) {
      if (!formData.full_name || !formData.email || !formData.password) {
        toast.error("Please fill in all required identity fields."); return false;
      }
    }
    if (currentStep === 3) {
      if (roleType === "staff" && !formData.id_number) { toast.error("ID Number is required for staff."); return false; }
      if (jobTitle === "Driver" && !formData.dl_number) { toast.error("Driver's License is required for Drivers."); return false; }
      if (jobTitle === "Driver" && !formData.dl_expiry) { toast.error("DL Expiry Date is required for Drivers."); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setCurrentStep(s => Math.min(4, s + 1)); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    try {
      // ✅ SANITIZED PAYLOAD: Ensures empty strings become undefined to match backend Optional[str]
      const payload: UserCreatePayload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: roleType === "admin" ? "tenant_admin" : "tenant_staff",
        phone_number: formData.phone_number.trim() || undefined,
        department: roleType === "admin" ? "Executive" : (department || undefined), 
        job_title: jobTitle || undefined,
        id_number: formData.id_number.trim() || undefined,
        dl_number: formData.dl_number.trim() || undefined,
        dl_expiry: formData.dl_expiry || undefined,
      };
      
      await usersApi.create(payload);
      toast.success("Team member added successfully!");
      router.push("/dashboard/users");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = () => {
    if (roleType === "admin") return jobTitle || "Admin";
    if (jobTitle) return jobTitle;
    return "Staff";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--color-bg)] p-4 sm:p-8 flex items-start justify-center">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/dashboard/users")}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to Team
          </button>
          <h1 className="text-xl font-bold text-[var(--color-ink)] hidden sm:block">Add Team Member</h1>
          <div className="w-24" /> {/* Spacer for balance */}
        </div>

        {/* Wizard Card */}
        <div className="bg-[var(--color-surface)] rounded-3xl shadow-[var(--shadow-xl)] border border-[var(--color-surface-border)] overflow-hidden">
          
          {/* Step Indicator */}
          <div className="px-8 py-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? "bg-[var(--color-primary)] text-white shadow-[0_0_0_4px_var(--color-primary-muted)]" 
                          : isCompleted 
                            ? "bg-[var(--color-success)] text-white" 
                            : "bg-[var(--color-surface)] border-2 border-[var(--color-surface-border)] text-[var(--color-ink-subtle)]"
                      }`}>
                        {isCompleted ? <CheckCircle size={18} aria-hidden="true" /> : <Icon size={18} aria-hidden="true" />}
                      </div>
                      <span className={`mt-2 text-xs font-bold uppercase tracking-wider ${
                        isActive ? "text-[var(--color-primary)]" : isCompleted ? "text-[var(--color-success-text)]" : "text-[var(--color-ink-subtle)]"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-4 rounded-full transition-all duration-500 ${
                        currentStep > step.id ? "bg-[var(--color-success)]" : "bg-[var(--color-surface-border)]"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-8 sm:p-10">
            
            {/* STEP 1: ROLE & ACCESS */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Select Access Level</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Define their operational role and permissions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                  {/* Admin Card */}
                  <button 
                    type="button" 
                    onClick={() => { setRoleType("admin"); setDepartment(""); setJobTitle(""); }}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      roleType === "admin" 
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                        : "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-surface-border-strong)]"
                    }`}
                  >
                    <Shield className={`mb-3 ${roleType === "admin" ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"}`} size={24} aria-hidden="true" />
                    <p className="font-bold text-[var(--color-ink)]">Admin</p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1">Leadership, HR, and full agency management access.</p>
                  </button>
                  
                  {/* Staff Card */}
                  <button 
                    type="button" 
                    onClick={() => { setRoleType("staff"); setDepartment(""); setJobTitle(""); }}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${
                      roleType === "staff" 
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                        : "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-surface-border-strong)]"
                    }`}
                  >
                    <Briefcase className={`mb-3 ${roleType === "staff" ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"}`} size={24} aria-hidden="true" />
                    <p className="font-bold text-[var(--color-ink)]">Operational Staff</p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1">Day-to-day operations, drivers, finance, and support.</p>
                  </button>
                </div>

                {/* Conditional Dropdowns */}
                <div className="max-w-2xl mx-auto">
                  {roleType === "admin" && (
                    <div className="space-y-4 pt-6 border-t border-[var(--color-surface-border)]">
                      <label className={labelClass}>Admin Title</label>
                      <select value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={selectClass}>
                        <option value="">Select Title...</option>
                        {ADMIN_TITLES.map((title) => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {roleType === "staff" && (
                    <div className="space-y-4 pt-6 border-t border-[var(--color-surface-border)]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Department</label>
                          <select 
                            value={department} 
                            onChange={(e) => { setDepartment(e.target.value); setJobTitle(""); }}
                            className={selectClass}
                          >
                            <option value="">Select Department...</option>
                            {Object.keys(STAFF_DEPARTMENTS).map((dept) => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Job Title / Position</label>
                          <select 
                            value={jobTitle} 
                            onChange={(e) => setJobTitle(e.target.value)}
                            disabled={!department}
                            className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <option value="">Select Position...</option>
                            {department && STAFF_DEPARTMENTS[department]?.map((title) => (
                              <option key={title} value={title}>{title}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: IDENTITY & CONTACT */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Identity & Contact</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Create their login credentials and contact info.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Full Name <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => updateField("full_name", e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email Address <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="jane@agency.com"
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => updateField("phone_number", e.target.value)}
                        placeholder="+254 7..."
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Temporary Password <span className="text-[var(--color-danger)]">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder="Min 8 characters"
                        className={`${inputClass} pl-11`}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: COMPLIANCE */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Compliance Details</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">
                    {jobTitle === "Driver" ? "ID & Driver's License required for operational safety." : "National ID required for staff records."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="md:col-span-2">
                    <label className={labelClass}>National ID Number {roleType === "staff" && <span className="text-[var(--color-danger)]">*</span>}</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                      <input
                        type="text"
                        value={formData.id_number}
                        onChange={(e) => updateField("id_number", e.target.value)}
                        placeholder="e.g. 12345678"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                  
                  {roleType === "staff" && (
                    <>
                      <div>
                        <label className={labelClass}>Driver's License Number {jobTitle === "Driver" && <span className="text-[var(--color-danger)]">*</span>}</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-3.5 h-4 w-4 text-[var(--color-ink-subtle)]" aria-hidden="true" />
                          <input
                            type="text"
                            value={formData.dl_number}
                            onChange={(e) => updateField("dl_number", e.target.value)}
                            placeholder="e.g. DL-01234"
                            className={`${inputClass} pl-11`}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>DL Expiry Date {jobTitle === "Driver" && <span className="text-[var(--color-danger)]">*</span>}</label>
                        <input
                          type="date"
                          value={formData.dl_expiry}
                          onChange={(e) => updateField("dl_expiry", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-[var(--color-ink)]">Review & Submit</h2>
                  <p className="text-sm text-[var(--color-ink-muted)] mt-2">Verify all details before creating the account.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                  {/* Role Section */}
                  <div className="md:col-span-2 p-6 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20">
                    <h3 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield size={14} aria-hidden="true" /> Role & Access
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-[var(--color-ink)]">{getRoleDisplay()}</span>
                      <span className="text-xs text-[var(--color-ink-muted)]">({roleType === "admin" ? "Executive" : department})</span>
                    </div>
                  </div>

                  {/* Identity Summary */}
                  <div className="p-6 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <h3 className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4">Identity</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">Name</span><span className="font-semibold text-[var(--color-ink)]">{formData.full_name || "—"}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">Email</span><span className="font-semibold text-[var(--color-ink)]">{formData.email || "—"}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">Phone</span><span className="font-semibold text-[var(--color-ink)]">{formData.phone_number || "—"}</span></div>
                    </div>
                  </div>

                  {/* Compliance Summary */}
                  <div className="p-6 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
                    <h3 className="text-xs font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-4">Compliance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">ID Number</span><span className="font-semibold text-[var(--color-ink)]">{formData.id_number || "—"}</span></div>
                      {roleType === "staff" && (
                        <>
                          <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">DL Number</span><span className="font-semibold text-[var(--color-ink)]">{formData.dl_number || "—"}</span></div>
                          <div className="flex justify-between text-xs"><span className="text-[var(--color-ink-muted)]">DL Expiry</span><span className="font-semibold text-[var(--color-ink)]">{formData.dl_expiry || "—"}</span></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-[var(--color-surface-border)]">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} aria-hidden="true" /> Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all"
                >
                  Next Step <ArrowRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <CheckCircle size={16} aria-hidden="true" />}
                  {loading ? "Creating Account..." : "Create Team Member"}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

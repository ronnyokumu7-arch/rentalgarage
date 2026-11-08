// src/components/users/QuickInviteModal.tsx
import { useState, useEffect } from "react";
import { UserPlus, CircleNotch as Loader2, Check, Copy, Envelope as Mail, Chat as MessageSquare, Phone, Shield, Briefcase } from "@phosphor-icons/react/ssr";
import Modal from "@/components/ui/Modal";

const ADMIN_TITLES = ["Director", "Manager", "HR"];
const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  "Finance": ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

type RoleType = "admin" | "staff" | null;

interface QuickInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    full_name: string; 
    email: string; 
    phone_number?: string;
    role: "tenant_admin" | "tenant_staff";
    department: string; 
    job_title: string;
    password: string;
  }) => Promise<void>;
  loading: boolean;
  successMessage: string | null;
}

export default function QuickInviteModal({ 
  isOpen, onClose, onSubmit, loading, successMessage 
}: QuickInviteModalProps) {
  const [roleType, setRoleType] = useState<RoleType>(null);
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [formData, setFormData] = useState({ 
    full_name: "", 
    email: "", 
    phone_number: "",
    password: ""
  });
  const [copied, setCopied] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRoleType(null);
      setDepartment("");
      setJobTitle("");
      setFormData({ 
        full_name: "", 
        email: "", 
        phone_number: "",
        password: ""
      });
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleType || !jobTitle) return;
    
    await onSubmit({
      full_name: formData.full_name,
      email: formData.email,
      phone_number: formData.phone_number.trim() || undefined,
      role: roleType === "admin" ? "tenant_admin" : "tenant_staff",
      department: roleType === "admin" ? "Executive" : department,
      job_title: jobTitle,
      password: formData.password,
    });
  };

  const isFormValid = 
    roleType &&
    jobTitle &&
    formData.full_name.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8;

  const handleCopyCredentials = () => {
    const credentials = `Email: ${formData.email}\nPassword: ${formData.password}`;
    navigator.clipboard.writeText(credentials);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = `Your account has been created!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nPlease log in and change your password.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShareSMS = () => {
    const message = `Your account: ${formData.email} / ${formData.password}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = "Your Account Credentials";
    const body = `Email: ${formData.email}\nPassword: ${formData.password}\n\nPlease log in and change your password.`;
    window.open(`mailto:${formData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      ariaLabel={successMessage ? "Account Created" : "Add Member Manually"}
      bodyClassName="p-5 sm:p-6"
      header={
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
            {successMessage ? <Check size={20} aria-hidden="true" /> : <UserPlus size={20} aria-hidden="true" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[var(--color-ink)]">{successMessage ? "Account Created!" : "Add Member Manually"}</h3>
            <p className="text-xs text-[var(--color-ink-muted)]">
              {successMessage || "Create an account and share their credentials."}
            </p>
          </div>
        </div>
      }
    >
        {!successMessage ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STEP 1: Access Level Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">
                Access Level <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  onClick={() => { setRoleType("admin"); setDepartment(""); setJobTitle(""); }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    roleType === "admin" 
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                      : "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-surface-border-strong)]"
                  }`}
                >
                  <Shield className={`mb-1.5 ${roleType === "admin" ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"}`} size={18} aria-hidden="true" />
                  <p className="text-sm font-bold text-[var(--color-ink)]">Admin</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">Leadership & management</p>
                </button>
                
                <button 
                  type="button" 
                  onClick={() => { setRoleType("staff"); setDepartment(""); setJobTitle(""); }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    roleType === "staff" 
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                      : "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-surface-border-strong)]"
                  }`}
                >
                  <Briefcase className={`mb-1.5 ${roleType === "staff" ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"}`} size={18} aria-hidden="true" />
                  <p className="text-sm font-bold text-[var(--color-ink)]">Operational Staff</p>
                  <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">Day-to-day operations</p>
                </button>
              </div>
            </div>

            {/* Conditional Role Fields */}
            {roleType === "admin" && (
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Admin Title <span className="text-[var(--color-danger)]">*</span></label>
                <select 
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none"
                  value={jobTitle} 
                  onChange={e => setJobTitle(e.target.value)}
                >
                  <option value="">Select Title...</option>
                  {ADMIN_TITLES.map((title) => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>
            )}

            {roleType === "staff" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Department <span className="text-[var(--color-danger)]">*</span></label>
                  <select 
                    required 
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none"
                    value={department} 
                    onChange={e => { setDepartment(e.target.value); setJobTitle(""); }}
                  >
                    <option value="">Select Dept...</option>
                    {Object.keys(STAFF_DEPARTMENTS).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Job Title <span className="text-[var(--color-danger)]">*</span></label>
                  <select 
                    required 
                    disabled={!department} 
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    value={jobTitle} 
                    onChange={e => setJobTitle(e.target.value)}
                  >
                    <option value="">{department ? "Select Title..." : "Dept first"}</option>
                    {department && STAFF_DEPARTMENTS[department]?.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Identity Fields (show after role selected) */}
            {roleType && (
              <>
                <div className="border-t border-[var(--color-surface-border)] pt-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">Identity & Contact</label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Full Name <span className="text-[var(--color-danger)]">*</span></label>
                      <input 
                        type="text"
                        required 
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                        value={formData.full_name} 
                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                        placeholder="e.g. Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Email Address <span className="text-[var(--color-danger)]">*</span></label>
                      <input 
                        type="email"
                        required 
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="jane@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Phone Number</label>
                      <input 
                        type="tel"
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                        value={formData.phone_number} 
                        onChange={e => setFormData({...formData, phone_number: e.target.value})}
                        placeholder="+254 7..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">Temporary Password <span className="text-[var(--color-danger)]">*</span></label>
                      <input 
                        type="password"
                        required 
                        minLength={8}
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="Min 8 characters"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !isFormValid} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />}
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            {/* Unified Share Buttons */}
            <div className="space-y-2 pt-2">
              <button 
                onClick={handleCopyCredentials}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
              >
                {copied ? <Check size={16} className="text-emerald-600" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                {copied ? "Copied!" : "Copy Credentials"}
              </button>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
                >
                  <MessageSquare size={14} aria-hidden="true" />
                  WhatsApp
                </button>
                <button 
                  onClick={handleShareSMS}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
                >
                  <Phone size={14} aria-hidden="true" />
                  SMS
                </button>
                <button 
                  onClick={handleShareEmail}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
                >
                  <Mail size={14} aria-hidden="true" />
                  Email
                </button>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all mt-4"
            >
              Done
            </button>
          </div>
        )}
    </Modal>
  );
}

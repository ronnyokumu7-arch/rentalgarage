// src/components/users/InviteUserModal.tsx
import { useState, useEffect } from "react";
import { LinkSimple as Link2, CircleNotch as Loader2, Check, Copy, Chat as MessageSquare, Phone, Shield, Briefcase } from "@phosphor-icons/react/ssr";

const ADMIN_TITLES = ["Director", "Manager", "HR"];
const STAFF_DEPARTMENTS: Record<string, string[]> = {
  "Fleet & Operations": ["Fleet Manager", "Dispatcher", "Driver"],
  "Finance": ["Accountant", "Cashier"],
  "Sales & Contracts": ["Sales Agent", "Contracts Officer"],
};

type RoleType = "admin" | "staff" | null;

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    full_name: string; 
    phone_number?: string;
    role: "tenant_admin" | "tenant_staff";
    department: string;
    job_title: string;
  }) => Promise<void>;
  loading: boolean;
  inviteLink: string | null;
}

export default function InviteUserModal({ 
  isOpen, onClose, onSubmit, loading, inviteLink 
}: InviteUserModalProps) {
  const [formData, setFormData] = useState({ full_name: "", phone_number: "" });
  const [roleType, setRoleType] = useState<RoleType>(null);
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [copied, setCopied] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ full_name: "", phone_number: "" });
      setRoleType(null);
      setDepartment("");
      setJobTitle("");
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleType || !jobTitle) return;
    await onSubmit({
      full_name: formData.full_name,
      phone_number: formData.phone_number.trim() || undefined,
      role: roleType === "admin" ? "tenant_admin" : "tenant_staff",
      department: roleType === "admin" ? "Executive" : department,
      job_title: jobTitle,
    });
  };

  const isFormValid = 
    !!formData.full_name.trim() && 
    !!roleType && 
    !!jobTitle && 
    (roleType === "admin" || !!department);

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMessage = `You've been invited to join the team! Complete your account setup here: ${inviteLink}`;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  const handleSMS = () => {
    window.open(`sms:${formData.phone_number}?body=${encodeURIComponent(shareMessage)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
        {!inviteLink ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Link2 size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite User</h3>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  They'll complete their own details and set a password via a secure link.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                  Full Name <span className="text-[var(--color-danger)]">*</span>
                </label>
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
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                  Phone Number
                </label>
                <input 
                  type="tel"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  value={formData.phone_number} 
                  onChange={e => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="+254 7..."
                />
              </div>
            </div>

            {/* ✅ LOCKED ROLE: Admin assigns department & title — user cannot change these */}
            <div className="border-t border-[var(--color-surface-border)] pt-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">
                Role & Department <span className="text-[var(--color-danger)]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => { setRoleType("admin"); setDepartment(""); setJobTitle(""); }}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                    roleType === "admin" 
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                      : "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-surface-border-strong)]"
                  }`}
                >
                  <Shield className={`mb-1 ${roleType === "admin" ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"}`} size={16} aria-hidden="true" />
                  <p className="text-xs font-bold text-[var(--color-ink)]">Admin</p>
                </button>
                
                <button 
                  type="button" 
                  onClick={() => { setRoleType("staff"); setDepartment(""); setJobTitle(""); }}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                    roleType === "staff" 
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                      : "border-[var(--color-surface-border)] bg-[var(--color-surface-hover)] hover:border-[var(--color-surface-border-strong)]"
                  }`}
                >
                  <Briefcase className={`mb-1 ${roleType === "staff" ? "text-[var(--color-primary)]" : "text-[var(--color-ink-subtle)]"}`} size={16} aria-hidden="true" />
                  <p className="text-xs font-bold text-[var(--color-ink)]">Staff</p>
                </button>
              </div>

              {roleType === "admin" && (
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
              )}

              {roleType === "staff" && (
                <div className="grid grid-cols-2 gap-2">
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
              )}
            </div>

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
                {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
                {loading ? "Generating..." : "Invite"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <Check size={32} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Link Ready!</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Share this link with <span className="font-bold text-[var(--color-ink)]">{formData.full_name}</span>. 
              The link expires in 48 hours.
            </p>
            
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
              <code className="flex-1 text-xs text-[var(--color-ink)] truncate text-left">{inviteLink}</code>
              <button 
                onClick={handleCopy} 
                className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all active:scale-95" 
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              </button>
            </div>

            {/* Unified Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
              >
                <MessageSquare size={14} aria-hidden="true" />
                WhatsApp
              </button>
              <button 
                onClick={handleSMS}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
              >
                <Phone size={14} aria-hidden="true" />
                SMS
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all mt-2"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

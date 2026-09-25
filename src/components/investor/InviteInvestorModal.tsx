"use client";

import { useState, useEffect } from "react";
import { Link2, Loader2, Check, Copy, MessageSquare, Phone, UserPlus } from "lucide-react";
import apiClient from "@/lib/api-client";
import toast from "react-hot-toast";

interface InviteInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteInvestorModal({ isOpen, onClose }: InviteInvestorModalProps) {
  const [formData, setFormData] = useState({ full_name: "", email: "", phone_number: "" });
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ full_name: "", email: "", phone_number: "" });
      setInviteLink(null);
      setCopied(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiClient.post("/investors/invite", {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number.trim() || undefined,
      });

      setInviteLink(res.data.invite_link);
      toast.success("Investor invite created successfully!");
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Failed to send invite";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMessage = `You've been invited to join as a Host Investor! Complete your secure account setup here: ${inviteLink}`;

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
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Investor</h3>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  They'll complete their profile, payout details, and set a password via a secure link.
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
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                  Email Address <span className="text-[var(--color-danger)]">*</span>
                </label>
                <input 
                  type="email"
                  required 
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="investor@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-ink-muted)] mb-1">
                  Phone Number (Optional)
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
                disabled={loading || !formData.full_name.trim() || !formData.email.trim()} 
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
                {loading ? "Generating..." : "Send Invite"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <Check size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-ink)]">Invite Link Ready!</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Share this link with <span className="font-bold text-[var(--color-ink)]">{formData.full_name}</span>. 
              The link expires in 7 days.
            </p>
            
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
              <code className="flex-1 text-xs text-[var(--color-ink)] truncate text-left">{inviteLink}</code>
              <button 
                onClick={handleCopy} 
                className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all active:scale-95" 
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all"
              >
                <MessageSquare size={14} />
                WhatsApp
              </button>
              <button 
                onClick={handleSMS}
                disabled={!formData.phone_number}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-hover)]/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Phone size={14} />
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

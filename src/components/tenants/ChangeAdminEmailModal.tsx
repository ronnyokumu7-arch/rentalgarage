// src/components/tenants/ChangeAdminEmailModal.tsx
import { useState } from 'react';
import { Shield, Envelope as Mail, Phone, UserCheck, CircleNotch as Loader2, Warning as AlertTriangle, Eye, EyeSlash as EyeOff } from "@phosphor-icons/react/ssr";
import toast from 'react-hot-toast';
import { tenantsApi } from '@/lib/api/tenants';
import type { ChangeAdminEmailPayload } from '@/lib/api/tenants';
import { getApiErrorMessage } from '@/lib/api-error';
import Modal from '@/components/ui/Modal';

interface ChangeAdminEmailModalProps {
  tenantId: number | string;
  currentAdminEmail: string;
  currentAdminPhone?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

type VerificationMethod = 'email' | 'phone' | 'manual_override';

export function ChangeAdminEmailModal({
  tenantId,
  currentAdminEmail,
  currentAdminPhone,
  onClose,
  onSuccess,
}: ChangeAdminEmailModalProps) {
  const [newEmail, setNewEmail] = useState('');
  const [method, setMethod] = useState<VerificationMethod>('email');
  const [reason, setReason] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const isManualOverride = method === 'manual_override';
  const canSubmit = 
    newEmail.length > 0 && 
    reason.length >= 10 && 
    (isManualOverride || otp.length === 6) &&
    !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      const payload: ChangeAdminEmailPayload = {
        new_email: newEmail,
        verification_method: method,
        reason,
        otp: isManualOverride ? undefined : otp,
      };

      await tenantsApi.changeAdminEmail(tenantId, payload);
      toast.success('Admin email updated successfully');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to update admin email'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      ariaLabel="Change Admin Email"
      headerClassName="p-0 border-0"
      bodyClassName="p-0"
      header={
        <div className="relative px-6 py-4 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shrink-0">
              <Shield size={20} aria-hidden="true" />
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-0.5">Change Admin Email</h3>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                High-security action. All changes are permanently logged in the audit trail. You are advised to proceed with caution.
              </p>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--color-surface-hover)]/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Shield size={16} aria-hidden="true" />}
            {isLoading ? 'Processing...' : 'Confirm Change'}
          </button>
        </div>
      }
    >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Current vs New Email */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">Current Admin Email</span>
              <span className="text-sm font-medium text-[var(--color-ink)] truncate ml-2">{currentAdminEmail}</span>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5 block">
                New Admin Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@newdomain.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Compact Verification Method Selector */}
          <div>
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2 block">
              Verification Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'email' as const, label: 'Email', icon: Mail, disabled: false },
                { id: 'phone' as const, label: 'SMS', icon: Phone, disabled: !currentAdminPhone },
                { id: 'manual_override' as const, label: 'Manual', icon: UserCheck, disabled: false },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = method === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => setMethod(opt.id)}
                    className={`
                      flex flex-col items-center gap-1 p-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500' 
                        : opt.disabled 
                          ? 'border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 text-[var(--color-ink-subtle)] cursor-not-allowed opacity-50'
                          : 'border-[var(--color-surface-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink-subtle)] hover:bg-[var(--color-surface-hover)]'}
                    `}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* OTP Input (Conditional) */}
          {!isManualOverride && (
            <div>
              <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5 block">
                6-Digit OTP Code
              </label>
              <div className="relative">
                <input
                  type={showOtp ? "text" : "password"}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] hover:text-[var(--color-ink)] transition-colors"
                >
                  {showOtp ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              <p className="text-[9px] text-[var(--color-ink-subtle)] mt-1">
                Sent to {method === 'email' ? currentAdminEmail : currentAdminPhone}
              </p>
            </div>
          )}

          {/* Justification Field - Grows naturally when typing */}
          <div>
            <label className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5 block">
              Justification (Required for audit)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this change is necessary (min 10 characters)..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y min-h-[60px]"
              required
              minLength={10}
            />
          </div>

          {/* Security Warning */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10">
            <AlertTriangle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-[9px] text-rose-400/80 leading-relaxed">
              This action will immediately change the primary login email. A notification will be sent to the old contact channel. A 24-hour cooldown will be enforced.
            </p>
          </div>
        </form>
    </Modal>
  );
}

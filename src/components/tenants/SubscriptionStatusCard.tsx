// src/components/tenants/SubscriptionStatusCard.tsx
import { useState } from 'react';
import { 
  CreditCard, Calendar, AlertTriangle, CheckCircle2, XCircle, 
  Clock, Loader2, Zap, Shield, Plus, Ban
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantsApi } from '@/lib/api/tenants';
import type { Tenant } from '@/lib/types';

interface SubscriptionStatusCardProps {
  tenant: Tenant;
  onUpdated: () => void;
}

export function SubscriptionStatusCard({ tenant, onUpdated }: SubscriptionStatusCardProps) {
  const [isExtending, setIsExtending] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Calculate days remaining for trial
  const getTrialDaysRemaining = () => {
    if (!tenant.trial_ends_at) return null;
    
    const endDate = new Date(tenant.trial_ends_at);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const trialDays = getTrialDaysRemaining();
  const isTrialEndingSoon = trialDays !== null && trialDays <= 7 && trialDays > 0;
  const isTrialExpired = trialDays !== null && trialDays <= 0;

  // Format date for display
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Status badge configuration
  const getStatusBadge = () => {
    const status = tenant.subscription_status;
    
    switch (status) {
      case 'trial':
        return { icon: Clock, label: 'Free Trial', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'starter_trial':
        return { icon: Clock, label: 'Starter Trial', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'active':
        return { icon: CheckCircle2, label: 'Active', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'past_due':
        return { icon: AlertTriangle, label: 'Past Due', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'suspended':
        return { icon: XCircle, label: 'Suspended', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'cancelled':
        return { icon: XCircle, label: 'Cancelled', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
      default:
        return { icon: CreditCard, label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const handleExtendTrial = async () => {
    setIsExtending(true);
    try {
      // TODO: Implement extend trial API endpoint
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
      toast.success('Trial extended by 14 days');
      onUpdated();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to extend trial');
    } finally {
      setIsExtending(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    try {
      if (tenant.is_active) {
        await tenantsApi.suspend(tenant.id, { reason: 'Suspended by Super Admin' });
        toast.success('Tenant suspended');
      } else {
        await tenantsApi.activate(tenant.id);
        toast.success('Tenant activated');
      }
      onUpdated();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Action failed');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <CreditCard size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Subscription & Billing</h2>
            <p className="text-[11px] text-[var(--color-ink-muted)] leading-none mt-0.5">Plan status and lifecycle</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusBadge.color}`}>
          <StatusIcon size={12} />
          {statusBadge.label}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-5">
        
        {/* Current Plan - Fixed Layout */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest">
            <Zap size={12} /> Current Plan
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-[var(--color-ink)] capitalize truncate">
              {tenant.plan.replace('_', ' ')}
            </p>
            {trialDays !== null && trialDays > 0 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                {trialDays}d left
              </span>
            )}
          </div>
        </div>

        {/* Key Dates Grid */}
        <div className="grid grid-cols-1 gap-3 pt-2 border-t border-[var(--color-surface-border)]/50">
          {tenant.trial_ends_at && (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                <Calendar size={14} className="opacity-50" />
                <span>Trial Ends</span>
              </div>
              <span className={`text-xs font-semibold ${
                isTrialExpired ? 'text-rose-400' : isTrialEndingSoon ? 'text-amber-400' : 'text-[var(--color-ink)]'
              }`}>
                {formatDate(tenant.trial_ends_at)}
              </span>
            </div>
          )}
          
          {tenant.subscription_ends_at && (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                <Calendar size={14} className="opacity-50" />
                <span>Sub Ends</span>
              </div>
              <span className="text-xs font-semibold text-[var(--color-ink)]">
                {formatDate(tenant.subscription_ends_at)}
              </span>
            </div>
          )}
        </div>

        {/* Grace Period Warning */}
        {tenant.grace_period_ends_at && tenant.subscription_status === 'past_due' && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-400/80 leading-relaxed">
              Suspends on {formatDate(tenant.grace_period_ends_at)} if unpaid.
            </p>
          </div>
        )}

        {/* Spacer to push actions to bottom */}
        <div className="flex-1" />

        {/* Action Buttons - Premium Outline Style */}
        <div className="space-y-3 pt-4 border-t border-[var(--color-surface-border)]">
          <div className="grid grid-cols-2 gap-2">
            {(tenant.subscription_status === 'trial' || tenant.subscription_status === 'starter_trial') && (
              <button
                onClick={handleExtendTrial}
                disabled={isExtending}
                title="Add 14 days to current trial period"
                className="group relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all disabled:opacity-50"
              >
                {isExtending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Extend
              </button>
            )}

            {!tenant.is_archived && (
              <button
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
                title={tenant.is_active ? "Suspend account access immediately" : "Reactivate suspended account"}
                className={`
                  group relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-50
                  ${tenant.is_active 
                    ? 'text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40' 
                    : 'text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40'}
                `}
              >
                {isTogglingStatus ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : tenant.is_active ? (
                  <Ban size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {tenant.is_active ? 'Suspend' : 'Activate'}
              </button>
            )}
          </div>

          {/* Default Payment Method Indicator */}
          {tenant.default_payment_method && (
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--color-ink-subtle)]">
              <Shield size={10} />
              <span>Default: {tenant.default_payment_method.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

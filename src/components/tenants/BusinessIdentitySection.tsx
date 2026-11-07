// src/components/tenants/BusinessIdentitySection.tsx
import { useState, useEffect } from 'react';
import { Buildings as Building2, Envelope as Mail, Phone, Hash, MapPin, NotePencil as Edit3, FloppyDisk as Save, X, CircleNotch as Loader2, Globe } from "@phosphor-icons/react/ssr";
import toast from 'react-hot-toast';
import { tenantProfileApi } from '@/lib/api/tenant-profile';
import type { Tenant } from '@/lib/types';

interface BusinessIdentitySectionProps {
  tenant: Tenant;
  onUpdated: () => void; // Triggers the parent hook to refetch data
}

export function BusinessIdentitySection({ tenant, onUpdated }: BusinessIdentitySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // ✅ FIX: Prioritize tenant.profile data, fallback to base tenant data
  const getInitialData = () => ({
    company_name: tenant.profile?.company_name || tenant.name,
    email: tenant.profile?.email || tenant.admin_email || tenant.email,
    phone: tenant.profile?.phone || tenant.admin_phone || tenant.phone_number || '',
    business_location: tenant.profile?.address || '',
    website: tenant.profile?.website || '',
    kra_pin: tenant.profile?.tax_number || '',
  });

  const [formData, setFormData] = useState(getInitialData());

  // ✅ FIX: Reset form when tenant data changes (e.g., after parent refetches)
  useEffect(() => {
    setFormData(getInitialData());
  }, [tenant]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // ✅ FIX: Update the TenantProfile, not the base Tenant
      await tenantProfileApi.update({
        company_name: formData.company_name,
        email: formData.email,
        phone: formData.phone,
        business_location: formData.business_location,
        website: formData.website || undefined,
        kra_pin: formData.kra_pin || undefined,
      });
      
      toast.success('Business profile updated successfully');
      setIsEditing(false);
      onUpdated(); // Refresh parent data
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      const errorMsg = Array.isArray(detail) 
        ? detail.map((e: any) => e.msg).join(', ') 
        : (detail || 'Failed to update business profile');
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(getInitialData());
    setIsEditing(false);
  };

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Building2 size={18} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Business Identity</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Core company details and contact information</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] transition-colors disabled:opacity-50"
              >
                <X size={14} aria-hidden="true" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-colors"
            >
              <Edit3 size={14} aria-hidden="true" /> Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Section Body */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Building2 size={12} aria-hidden="true" /> Company Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">{formData.company_name || '—'}</p>
          )}
        </div>

        {/* Primary Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={12} aria-hidden="true" /> Primary Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">{formData.email || '—'}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={12} aria-hidden="true" /> Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">{formData.phone || '—'}</p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={12} aria-hidden="true" /> Website
          </label>
          {isEditing ? (
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              placeholder="https://example.com"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">{formData.website || '—'}</p>
          )}
        </div>

        {/* Business Location */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={12} aria-hidden="true" /> Business Location
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.business_location}
              onChange={(e) => setFormData({ ...formData, business_location: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--color-ink)] py-2">{formData.business_location || '—'}</p>
          )}
        </div>

        {/* KRA PIN */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-medium text-[var(--color-ink-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Hash size={12} aria-hidden="true" /> KRA PIN (Tax ID)
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.kra_pin}
              onChange={(e) => setFormData({ ...formData, kra_pin: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
              placeholder="A012345678B"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--color-ink)] py-2 font-mono">{formData.kra_pin || '—'}</p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { User, Envelope as Mail, Phone, CreditCard, PencilSimple as Pencil, FloppyDisk as Save, X, Camera, Check, Calendar } from "@phosphor-icons/react/ssr";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import type { Client } from "@/lib/types";

interface PersonalInfoCardProps {
  client: Client;
  onSave: (data: Partial<Client>) => void;
}

// ✅ BULLETPROOF LOCAL DATE FORMATTER
const formatDateToLocalYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PersonalInfoCard({ client, onSave }: PersonalInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: client.full_name,
    email: client.email || "",
    phone: client.phone,
    id_number: client.id_number || "",
    dl_expiry: client.dl_expiry || "",
  });

  const getInitials = (name: string) => {
    if (!name) return "C";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(client.full_name);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: client.full_name,
      email: client.email || "",
      phone: client.phone,
      id_number: client.id_number || "",
      dl_expiry: client.dl_expiry || "",
    });
    setIsEditing(false);
  };

  // ✅ Reusable Input Component using your global .label and .input classes
  const PremiumInput = ({ 
    label, icon: Icon, type = "text", value, onChange, placeholder 
  }: { 
    label: string; icon: any; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string 
  }) => (
    <div>
      <label className="label">{label}</label>
      <div className="relative group">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] group-focus-within:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input pl-10"
        />
      </div>
    </div>
  );

  // ✅ PREMIUM DATE PICKER COMPONENT
  const PremiumDatePicker = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    onChange: (dates: Date[]) => void;
  }) => {
    return (
      <div>
        <label className="label">{label}</label>
        <div className="relative group">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] group-focus-within:text-[var(--color-primary)] transition-colors pointer-events-none z-10" aria-hidden="true" />
          <Flatpickr
            value={value}
            onChange={onChange}
            options={{
              dateFormat: "Y-m-d",
              minDate: "today",
              disableMobile: true,
            }}
            className="input pl-10"
            placeholder="Select expiry date..."
          />
        </div>
      </div>
    );
  };

  // ✅ PREMIUM EDIT MODE
  if (isEditing) {
    return (
      <div className="card p-0 overflow-hidden">
        {/* Elegant Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-muted)] flex items-center justify-center">
              <User size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[var(--color-ink)] font-semibold">Edit Profile</h3>
              <p className="text-[var(--color-ink-muted)] text-sm">Update personal information</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-all"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Spacious Form Layout */}
        <div className="p-5 space-y-5">
          <PremiumInput 
            label="Full Name" 
            icon={User} 
            value={formData.full_name} 
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
            placeholder="Enter full name"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PremiumInput 
              label="Email Address" 
              icon={Mail} 
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              placeholder="email@example.com"
            />
            <PremiumInput 
              label="Phone Number" 
              icon={Phone} 
              type="tel"
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              placeholder="+254 700 000 000"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PremiumInput 
              label="National ID Number" 
              icon={CreditCard} 
              value={formData.id_number} 
              onChange={(e) => setFormData({ ...formData, id_number: e.target.value })} 
              placeholder="ID number"
            />
            
            {/* ✅ PREMIUM FLATPICKR DATE PICKER */}
            <PremiumDatePicker
              label="Driver's License Expiry"
              value={formData.dl_expiry}
              onChange={(dates) => {
                if (dates[0]) {
                  const localDateStr = formatDateToLocalYYYYMMDD(dates[0]);
                  setFormData({ ...formData, dl_expiry: localDateStr });
                }
              }}
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/30">
          <button
            onClick={handleCancel}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary btn-sm"
          >
            <Save size={14} aria-hidden="true" />
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  // ✅ PREMIUM VIEW MODE
  return (
    <div className="card p-0 overflow-hidden">
      {/* Elegant Header with Avatar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-surface-border)]">
        <div className="flex items-center gap-4">
          {/* Premium Avatar */}
          <div className="relative group">
            {client.avatar_image ? (
              <img
                src={client.avatar_image}
                alt={client.full_name}
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-[var(--color-surface-border)]"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)] flex items-center justify-center font-bold text-sm ring-1 ring-[var(--color-primary)]/20">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Camera size={14} className="text-white" aria-hidden="true" />
            </div>
          </div>

          <div>
            <h3 className="text-[var(--color-ink)] font-bold text-lg leading-tight">
              {client.full_name}
            </h3>
            <p className="text-[var(--color-ink-muted)] text-sm font-medium mt-1">
              Client Profile
            </p>
          </div>
        </div>

        {/* ✅ FIXED: Using btn-ghost for subtle, premium edit button */}
        <button
          onClick={() => setIsEditing(true)}
          className="btn btn-ghost btn-sm text-[var(--color-ink-muted)] hover:text-[var(--color-primary)]"
        >
          <Pencil size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      </div>

      {/* Information Grid - Invisible by default, reveals on hover */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Email */}
          <div className="p-4 rounded-xl border border-transparent hover:border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-muted)] text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                <Mail size={14} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">
                  Email
                </span>
                <span className="text-[var(--color-ink)] font-medium truncate block">
                  {client.email || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="p-4 rounded-xl border border-transparent hover:border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-success-bg)] text-[var(--color-success)] flex items-center justify-center shrink-0 mt-0.5">
                <Phone size={14} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">
                  Phone
                </span>
                <span className="text-[var(--color-ink)] font-medium truncate block">
                  {client.phone || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          {/* ID Number */}
          <div className="p-4 rounded-xl border border-transparent hover:border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] transition-all duration-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-muted)] text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard size={14} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">
                  National ID
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-ink)] font-medium truncate block">
                    {client.id_number || "Not provided"}
                  </span>
                  {client.id_number && (
                    <Check size={12} className="text-[var(--color-success)] shrink-0" aria-hidden="true" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
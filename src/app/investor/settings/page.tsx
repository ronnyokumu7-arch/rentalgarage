"use client";

import { useState, useEffect } from "react";
import { User, Wallet, Shield, Save, Loader2, Smartphone, Building2, CreditCard, Lock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import apiClient from "@/lib/api-client";
import toast from "react-hot-toast";

export default function InvestorSettingsPage() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Profile State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");

  // Payout State
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  // Password State
  const [_currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Initialize form with user data when it loads
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhoneNumber(user.phone_number || "");
      setIdNumber(user.id_number || "");
      setMpesaPhone(user.mpesa_phone || "");
      setBankName(user.bank_name || "");
      setBankAccountNumber(user.bank_account_number || "");
      setBankAccountName(user.bank_account_name || "");
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.patch("/users/me", {
        full_name: fullName,
        phone_number: phoneNumber,
        id_number: idNumber,
      });
      toast.success("Profile updated successfully");
      await refresh(); // Refresh auth context to update UI
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayouts = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.patch("/users/me", {
        mpesa_phone: mpesaPhone || null,
        bank_name: bankName || null,
        bank_account_number: bankAccountNumber || null,
        bank_account_name: bankAccountName || null,
      });
      toast.success("Payout details updated successfully");
      await refresh();
    } catch {
      toast.error("Failed to update payout details");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // Note: Backend might require current_password for security. 
      // If your backend requires it, add current_password to this payload.
      await apiClient.patch("/users/me", {
        password: newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to change password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-[var(--color-ink-muted)] mb-1.5";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">Account Settings</h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">Manage your profile, payout details, and security preferences.</p>
      </div>

      {/* 1. Profile Information */}
      <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-ink)]">Profile Information</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Your personal and identification details.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <input type="email" value={user?.email || ""} className={`${inputClass} bg-[var(--color-surface-hover)] cursor-not-allowed`} disabled />
              <p className="text-[10px] text-[var(--color-ink-subtle)] mt-1">Contact support to change your email.</p>
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} placeholder="+254 7..." />
            </div>
            <div>
              <label className={labelClass}>National ID Number</label>
              <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className={inputClass} placeholder="12345678" />
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile
            </button>
          </div>
        </form>
      </section>

      {/* 2. Payout Preferences */}
      <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-ink)]">Payout Preferences</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Where we will send your earnings and revenue share.</p>
          </div>
        </div>

        <form onSubmit={handleSavePayouts} className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-4">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              💡 You can provide both M-Pesa and Bank details. The agency will use your preferred method for payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>M-Pesa Phone Number</label>
              <div className="relative">
                <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input type="tel" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} className={`${inputClass} pl-10`} placeholder="254712345678" />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px flex-1 bg-[var(--color-surface-border)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">Or Bank Transfer</span>
                <div className="h-px flex-1 bg-[var(--color-surface-border)]" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Bank Name</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className={`${inputClass} pl-10`} placeholder="e.g. KCB, Equity" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Account Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className={`${inputClass} pl-10`} placeholder="Account Holder Name" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Account Number</label>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                <input type="text" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className={`${inputClass} pl-10`} placeholder="1234567890" />
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Payout Details
            </button>
          </div>
        </form>
      </section>

      {/* 3. Security */}
      <section className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-ink)]">Security</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Update your password to keep your account secure.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className={labelClass}>New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputClass} pl-10`} required minLength={8} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`${inputClass} pl-10`} required minLength={8} />
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[10px] font-semibold text-[var(--color-danger)] mt-1">Passwords do not match</p>
            )}
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading || newPassword !== confirmPassword} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              Update Password
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

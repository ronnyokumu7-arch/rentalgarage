// src/app/dashboard/profile/page.tsx
"use client";

import { User, Mail, Phone, MapPin, Shield, Bell, Key } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your account settings, contact information, and security preferences." 
        icon={User}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile" }
        ]}
      />

      {/* ── Profile Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Personal Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Full Name</label>
                <input type="text" defaultValue="John Doe" className="input" readOnly />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Email Address</label>
                <input type="email" defaultValue="admin@agency.com" className="input" readOnly />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Phone Number</label>
                <input type="tel" defaultValue="+254 700 000 000" className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Role</label>
                <input type="text" defaultValue="Agency Administrator" className="input bg-surface-hover cursor-not-allowed" readOnly />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Address & Location" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Street Address</label>
                <input type="text" placeholder="Enter your street address" className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">City</label>
                <input type="text" placeholder="e.g. Nairobi" className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">Country</label>
                <input type="text" placeholder="e.g. Kenya" className="input" />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Security & Preferences */}
        <div className="space-y-6">
          <SectionCard title="Security" icon={Shield}>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-surface-border hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Key size={16} className="text-ink-muted" />
                  <span className="text-sm font-semibold text-ink">Change Password</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-surface-border hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-ink-muted" />
                  <span className="text-sm font-semibold text-ink">Two-Factor Auth</span>
                </div>
                <span className="text-xs font-bold text-success-text bg-success-bg px-2 py-0.5 rounded-full">Enabled</span>
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Notifications" icon={Bell}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Email Notifications</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-surface-border text-accent-dark focus:ring-accent-dark" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">SMS Alerts</span>
                <input type="checkbox" className="h-4 w-4 rounded border-surface-border text-accent-dark focus:ring-accent-dark" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Booking Reminders</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-surface-border text-accent-dark focus:ring-accent-dark" />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

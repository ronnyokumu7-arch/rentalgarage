// src/app/dashboard/vault/page.tsx
"use client";

import { useState } from "react";
import {
  CalendarDays,
  Users,
  Car,
  FileText,
  CreditCard,
  CheckSquare,
  Shield,
  Building2,
  Archive,
} from "lucide-react";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";

const VAULT_TABS = [
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "clients", label: "Clients", icon: Users },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "financials", label: "Financials", icon: FileText },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "users", label: "Users", icon: Shield },
  { id: "tenants", label: "Tenants", icon: Building2 },
];

export default function VaultPage() {
  const [activeTab, setActiveTab] = useState("bookings");

  return (
    <div className="space-y-6">
      {/* Header — Vault signature icon container, aligned to standard pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {/* ✅ Vault signature: tinted container kept, hidden on mobile */}
            <span className="hidden sm:inline-flex">
              <div className="p-3 rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                <Archive size={24} className="text-[var(--color-primary)]" />
              </div>
            </span>

            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              History Library
            </h1>
          </div>
          {/* ✅ Subheading aligns to container's left edge */}
          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
            Access archived records, voided documents, and completed history.
          </p>
        </div>
      </div>

      {/* Tab Navigation + Content Card */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Tab Switcher — stays inside the card */}
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50">
          <PremiumTabSwitcher
            tabs={VAULT_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content Area */}
        <div className="p-6 min-h-[400px]">
          {/* We will replace these placeholders with the actual Tab components in the next steps */}
          {activeTab === "bookings" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays size={48} className="text-[var(--color-ink-subtle)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Bookings Vault</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
                Loading archived and cancelled bookings...
              </p>
            </div>
          )}

          {activeTab === "clients" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={48} className="text-[var(--color-ink-subtle)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Clients Vault</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
                Loading archived client records...
              </p>
            </div>
          )}

          {activeTab === "vehicles" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Car size={48} className="text-[var(--color-ink-subtle)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Vehicles Vault</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
                Loading retired and archived vehicles...
              </p>
            </div>
          )}

          {activeTab === "financials" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText size={48} className="text-[var(--color-ink-subtle)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Financials Vault</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
                Loading voided invoices and contracts...
              </p>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard size={48} className="text-[var(--color-ink-subtle)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Payments History</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
                Loading completed and voided payment records...
              </p>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckSquare size={48} className="text-[var(--color-ink-subtle)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Tasks Archive</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
                Loading completed and archived tasks...
              </p>
            </div>
          )}

          {activeTab === "users" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield size={48} className="text-[var(--color-ink-subtle)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Users Vault</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
                Loading inactive and suspended user accounts...
              </p>
            </div>
          )}

          {activeTab === "tenants" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 size={48} className="text-[var(--color-ink-subtle)] mb-4" />
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Tenants Vault</h3>
              <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
                Loading archived and cancelled agency accounts...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

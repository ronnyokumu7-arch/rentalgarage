// src/app/dashboard/investors/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  User as UserIcon,
  Phone,
  Mail,
  Car,
  FileText,
  Loader2,
  Archive,
  CheckCircle2,
  CreditCard,
  Building2,
  Shield,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  LayoutGrid,
} from "lucide-react";
import toast from "react-hot-toast";

import ProfileLayout, { ProfileField } from "@/components/profile/ProfileLayout";
import SectionCard from "@/components/ui/SectionCard";
import DataTable from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";

import { usersApi } from "@/lib/api/users";
import { vehiclesApi } from "@/lib/api/vehicles";
import { investorContractsApi } from "@/lib/api/investorContracts";
import type { User, Vehicle, InvestorContract } from "@/lib/types";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "vehicles", label: "Vehicles", icon: Car },
  { id: "contracts", label: "Contracts", icon: FileText },
];

const VALID_TABS = new Set(["overview", "vehicles", "contracts"]);

const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);

export default function InvestorDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const investorId = Number(id);

  const tabFromUrl = searchParams.get("tab") || "overview";
  const activeTab = VALID_TABS.has(tabFromUrl) ? tabFromUrl : "overview";

  const [investor, setInvestor] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [contracts, setContracts] = useState<InvestorContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTabChange = (tabId: string) => {
    router.push(`/dashboard/investors/${investorId}?tab=${tabId}`, { scroll: false });
  };

  useEffect(() => {
    async function fetchData() {
      if (!investorId) return;
      setLoading(true);
      try {
        const userData = await usersApi.get(investorId);
        if (userData.role !== "investor") {
          setNotFound(true);
          return;
        }
        setInvestor(userData);

        const allVehicles = await vehiclesApi.list();
        const ownedVehicles = allVehicles.filter((v: Vehicle) => v.owner_id === investorId);
        setVehicles(ownedVehicles);

        const allContracts = await investorContractsApi.list();
        const vehicleIds = new Set(ownedVehicles.map((v) => v.id));
        setContracts(allContracts.filter((c) => vehicleIds.has(c.vehicle_id)));
      } catch (error: any) {
        if (error?.response?.status === 404) setNotFound(true);
        else toast.error("Failed to load investor details");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [investorId]);

  const handleStatusAction = async () => {
    if (!investor) return;
    const isSuspending = !investor.is_suspended;
    if (isSuspending && !confirm("Are you sure you want to suspend this investor?")) return;

    setActionLoading(true);
    try {
      if (isSuspending) await usersApi.suspend(investorId, "Suspended via investor profile");
      else await usersApi.reactivate(investorId);
      
      const updated = await usersApi.get(investorId);
      setInvestor(updated);
      toast.success(`Investor ${isSuspending ? "suspended" : "reactivated"}`);
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const statusKind = investor?.is_suspended ? "suspended" : investor?.is_onboarded ? "active" : "pending";
  const statusLabel = statusKind === "suspended" ? "Suspended" : statusKind === "active" ? "Active" : "Pending";

  const activeVehicles = vehicles.filter((v) => v.status === "rented").length;
  const activeContracts = contracts.filter((c) => c.status === "signed").length;
  
  const estimatedEarnings = contracts
    .filter((c) => c.status === "signed")
    .reduce((sum, c) => sum + (c.lease_rate || 0), 0);
  const projectedMonthly = Math.round(estimatedEarnings * 4);

  return (
    <ProfileLayout
      title={investor?.full_name || "Investor"}
      subtitle={`Host Investor · Joined ${investor ? new Date(investor.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : ""}`}
      initials={investor?.full_name.substring(0, 2).toUpperCase() || "IN"}
      status={statusKind as "active" | "pending" | "suspended"}
      statusLabel={statusLabel}
      backHref="/dashboard/investors"
      backLabel="Investors"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      loading={loading}
      notFound={notFound || (!loading && !investor)}
      actionNode={
        investor && (
          <button
            onClick={handleStatusAction}
            disabled={actionLoading}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
              statusKind === "suspended"
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-[var(--color-surface)] text-rose-600 border border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20"
            }`}
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : statusKind === "suspended" ? <CheckCircle2 size={16} /> : <Archive size={16} />}
            {statusKind === "suspended" ? "Reactivate" : "Suspend"}
          </button>
        )
      }
    >
      {investor && (
        <>
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                <SectionCard title="Identity & Contact" icon={UserIcon}>
                  <div className="flex flex-col">
                    <ProfileField label="Full Name" value={investor.full_name} icon={UserIcon} />
                    <ProfileField label="Email Address" value={investor.email} icon={Mail} />
                    <ProfileField label="Phone Number" value={investor.phone_number} icon={Phone} isMono />
                    <ProfileField label="Account Role" value="Host Investor" icon={Shield} />
                  </div>
                </SectionCard>

                <SectionCard title="Payout Details" icon={CreditCard}>
                  <div className="flex flex-col">
                    <ProfileField label="M-Pesa Number" value={investor.mpesa_phone} icon={Phone} isMono />
                    <ProfileField label="Bank Name" value={investor.bank_name} icon={Building2} />
                    <ProfileField label="Account Number" value={investor.bank_account_number} icon={CreditCard} isMono />
                    <ProfileField label="Account Name" value={investor.bank_account_name} icon={UserIcon} />
                  </div>
                </SectionCard>
              </div>

              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                {/* Money Counter */}
                <div className="rounded-2xl border border-[var(--color-surface-border)] bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-surface)] to-[var(--color-surface)] shadow-[var(--shadow-card)] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[var(--color-surface-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center">
                        <Wallet size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-ink)]">Earnings</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">Lifetime projection</p>
                      </div>
                    </div>
                    <TrendingUp size={16} className="text-emerald-500" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)] mb-1">Estimated Lifetime</p>
                      <p className="text-3xl font-black text-[var(--color-ink)] tracking-tight tabular-nums">{fmtMoney(estimatedEarnings)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[var(--color-surface-hover)]/60 border border-[var(--color-surface-border)]/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">Monthly Est.</p>
                        <p className="text-sm font-extrabold text-[var(--color-ink)] tabular-nums">{fmtMoney(projectedMonthly)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[var(--color-surface-hover)]/60 border border-[var(--color-surface-border)]/60">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1">Contracts</p>
                        <p className="text-sm font-extrabold text-[var(--color-ink)] tabular-nums">{activeContracts}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTabChange("contracts")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 transition-all"
                    >
                      View Contracts <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Portfolio Snapshot */}
                <SectionCard title="Portfolio" icon={Car}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)]">
                      <span className="text-sm font-medium text-[var(--color-ink)]">Total Vehicles</span>
                      <span className="text-lg font-bold tabular-nums px-2.5 py-0.5 rounded-lg text-[var(--color-primary)] bg-[var(--color-primary)]/10">{vehicles.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)]">
                      <span className="text-sm font-medium text-[var(--color-ink)]">Rented Out</span>
                      <span className="text-lg font-bold tabular-nums px-2.5 py-0.5 rounded-lg text-blue-500 bg-blue-500/10">{activeVehicles}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)]">
                      <span className="text-sm font-medium text-[var(--color-ink)]">Active Contracts</span>
                      <span className="text-lg font-bold tabular-nums px-2.5 py-0.5 rounded-lg text-emerald-500 bg-emerald-500/10">{activeContracts}</span>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {activeTab === "vehicles" && (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
              {vehicles.length === 0 ? (
                <div className="p-12 text-center">
                  <Car size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
                  <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No Vehicles Yet</h3>
                  <p className="text-sm text-[var(--color-ink-muted)]">This investor hasn't added any vehicles to the platform.</p>
                </div>
              ) : (
                <>
                  <div className="block md:hidden p-4">
                    <CardGrid
                      data={vehicles}
                      getCardId={(v) => v.id}
                      renderCardHeader={({ item }) => (
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => router.push(`/dashboard/fleet/${item.id}`)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                            <Car size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--color-ink)]">{item.make} {item.model}</p>
                            <p className="text-xs font-mono text-[var(--color-ink-muted)]">{item.plate_number}</p>
                          </div>
                        </div>
                      )}
                      renderCardBody={({ item }) => (
                        <div
                          className="mt-3 pt-3 border-t border-[var(--color-surface-border)] flex items-center justify-between cursor-pointer"
                          onClick={() => router.push(`/dashboard/fleet/${item.id}`)}
                        >
                          <span className="text-xs text-[var(--color-ink-muted)]">Status</span>
                          <span className="text-xs font-bold uppercase text-[var(--color-primary)]">{item.status}</span>
                        </div>
                      )}
                    />
                  </div>
                  <div className="hidden md:block">
                    <DataTable
                      data={vehicles}
                      columns={[
                        { header: "Vehicle", accessorKey: "make", cell: ({ row }) => (
                          <div className="flex items-center gap-3">
                            <Car size={16} className="text-[var(--color-ink-subtle)]" />
                            <span className="font-semibold text-[var(--color-ink)]">{row.original.make} {row.original.model}</span>
                          </div>
                        )},
                        { header: "Plate", accessorKey: "plate_number", cell: ({ row }) => <span className="font-mono text-[var(--color-ink)]">{row.original.plate_number}</span> },
                        { header: "Status", accessorKey: "status", cell: ({ row }) => <span className="text-xs font-bold uppercase text-[var(--color-primary)]">{row.original.status}</span> }
                      ]}
                      onRowClick={(v) => router.push(`/dashboard/fleet/${v.id}`)}
                      viewMode="desktop"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "contracts" && (
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
              {contracts.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
                  <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No Contracts Found</h3>
                  <p className="text-sm text-[var(--color-ink-muted)]">No lease contracts have been generated for this investor's vehicles yet.</p>
                </div>
              ) : (
                <div className="hidden md:block">
                  <DataTable
                    data={contracts}
                    columns={[
                      { header: "Contract #", accessorKey: "contract_number", cell: ({ row }) => <span className="font-mono text-[var(--color-ink)]">{row.original.contract_number}</span> },
                      { header: "Type", accessorKey: "lease_rate_type", cell: ({ row }) => <span className="capitalize">{row.original.lease_rate_type}</span> },
                      { header: "Status", accessorKey: "status", cell: ({ row }) => <span className="text-xs font-bold uppercase text-[var(--color-primary)]">{row.original.status.replace("_", " ")}</span> }
                    ]}
                    viewMode="desktop"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </ProfileLayout>
  );
}

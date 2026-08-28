// src/app/dashboard/drivers/page.tsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Phone,
  Pencil,
  Archive,
  RotateCcw,
  UserCircle,
  Filter,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import FilterDropdown from "@/components/ui/FilterDropdown";
import DataTable, { RowAction } from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import { useDrivers } from "@/hooks/drivers/useDrivers";
import type { DriverListItem, DriverStatus, DriverPayMode } from "@/lib/types";

type DriverTab = "company" | "contract";

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] outline-none transition-all text-sm";
const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5";

const STATUS_STYLES: Record<DriverStatus, { bg: string; text: string }> = {
  available: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success-text)]" },
  on_trip: { bg: "bg-[var(--color-primary-muted)]", text: "text-[var(--color-primary-text)]" },
  on_leave: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning-text)]" },
  suspended: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger-text)]" },
};

const STATUS_LABELS: Record<DriverStatus, string> = {
  available: "Available",
  on_trip: "On Trip",
  on_leave: "On Leave",
  suspended: "Suspended",
};

const PAY_LABELS: Record<DriverPayMode, string> = {
  commission: "Commission",
  fixed_per_job: "Fixed / Job",
  payroll: "Payroll",
};

// ✅ Licence health: expired (red) / expiring ≤30d (amber) / valid (muted)
const dlState = (expiry?: string | null) => {
  if (!expiry) return { label: "N/A", cls: "text-[var(--color-ink-muted)]" };
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "EXPIRED", cls: "text-[var(--color-danger)] font-bold" };
  if (days <= 30) return { label: `${days}d LEFT`, cls: "text-[var(--color-warning-text)] font-bold" };
  return { label: "VALID", cls: "text-[var(--color-success-text)] font-bold" };
};

const emptyForm = {
  full_name: "", phone: "", email: "", id_number: "", dl_number: "", dl_expiry: "",
  status: "available" as DriverStatus,
  pay_mode: "commission" as DriverPayMode,
  daily_fee: "", overtime_hourly_fee: "", night_accommodation_fee: "", delivery_commission: "",
};

// ✅ REUSABLE: Premium Sliding Tab Switcher (Matches all other pages)
function PremiumTabSwitcher({ activeTab, setActiveTab }: { activeTab: DriverTab; setActiveTab: (tab: DriverTab) => void }) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; top: number; height: number } | null>(null);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        const containerRect = activeEl.parentElement?.getBoundingClientRect();
        if (containerRect) {
          setIndicatorStyle({
            left: rect.left - containerRect.left,
            width: rect.width,
            top: rect.top - containerRect.top,
            height: rect.height,
          });
        }
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  return (
    <div className="relative w-full sm:w-auto">
      {/* Sliding Indicator Pill */}
      {indicatorStyle && (
        <div
          className="absolute z-0 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-lg shadow-[var(--color-primary)]/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            top: indicatorStyle.top,
            height: indicatorStyle.height,
          }}
        />
      )}

      {/* Tab Container - No Scrollbar, Snap Centering */}
      <div 
        className="relative z-10 flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-hide snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {[
          { id: "company" as DriverTab, label: "Company", icon: Users },
          { id: "contract" as DriverTab, label: "Contract", icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 
                whitespace-nowrap touch-manipulation cursor-pointer snap-center flex-shrink-0
                ${isActive 
                  ? "text-[var(--color-ink)]" 
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]/50"
                }
              `}
            >
              <Icon size={isActive ? 16 : 14} className={`transition-all duration-300 ${isActive ? "text-[var(--color-primary)]" : "opacity-70"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Subtle bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[var(--color-surface-border)]/50 -z-10" />
    </div>
  );
}

export default function DriversPage() {
  const [activeTab, setActiveTab] = useState<DriverTab>("company");

  const {
    loading,
    drivers,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    includeArchived,
    setIncludeArchived,
    selectedDriver,
    detailLoading,
    loadDriverDetail,
    clearSelection,
    createDriver,
    updateDriver,
    archiveDriver,
    restoreDriver,
  } = useDrivers();

  // ✅ Local pagination (matches useClientsList contract)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(drivers.length / pageSize));
  const paginatedDrivers = useMemo(
    () => drivers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [drivers, currentPage],
  );

  useEffect(() => setCurrentPage(1), [search, statusFilter, includeArchived]);

  const driverMetrics = useMemo(() => {
    const total = drivers.length;
    const available = drivers.filter((d) => d.status === "available").length;
    const onTrip = drivers.filter((d) => d.status === "on_trip").length;
    return { total, available, onTrip };
  }, [drivers]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  // Pre-fill when editing (after detail loads)
  useEffect(() => {
    if (editingId && selectedDriver) {
      setForm({
        full_name: selectedDriver.full_name,
        phone: selectedDriver.phone,
        email: selectedDriver.email || "",
        id_number: selectedDriver.id_number,
        dl_number: selectedDriver.dl_number,
        dl_expiry: selectedDriver.dl_expiry ? selectedDriver.dl_expiry.split("T")[0] : "",
        status: selectedDriver.status,
        pay_mode: selectedDriver.pay_mode,
        daily_fee: selectedDriver.daily_fee !== null ? String(selectedDriver.daily_fee) : "",
        overtime_hourly_fee: selectedDriver.overtime_hourly_fee !== null ? String(selectedDriver.overtime_hourly_fee) : "",
        night_accommodation_fee: selectedDriver.night_accommodation_fee !== null ? String(selectedDriver.night_accommodation_fee) : "",
        delivery_commission: selectedDriver.delivery_commission !== null ? String(selectedDriver.delivery_commission) : "",
      });
    }
  }, [editingId, selectedDriver]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (id: number) => {
    setEditingId(id);
    setForm({ ...emptyForm });
    setModalOpen(true);
    loadDriverDetail(id);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    clearSelection();
  };

  const num = (v: string) => (v.trim() === "" ? undefined : parseFloat(v));

  const handleSubmit = async () => {
    setSaving(true);
    const payload = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || undefined,
      id_number: form.id_number,
      dl_number: form.dl_number,
      dl_expiry: form.dl_expiry || undefined,
      status: form.status,
      pay_mode: form.pay_mode,
      daily_fee: num(form.daily_fee),
      overtime_hourly_fee: num(form.overtime_hourly_fee),
      night_accommodation_fee: num(form.night_accommodation_fee),
      delivery_commission: num(form.delivery_commission),
    };
    const ok = editingId ? await updateDriver(editingId, payload) : await createDriver(payload);
    setSaving(false);
    if (ok) closeModal();
  };

  // ✅ Reusable row actions for both table and cards
  const getDriverActions = (driver: DriverListItem): RowAction<DriverListItem>[] => [
    {
      label: "Edit Driver",
      icon: Pencil,
      onClick: () => openEdit(driver.id),
    },
    driver.is_archived
      ? {
          label: "Restore Driver",
          icon: RotateCcw,
          variant: "primary",
          onClick: () => restoreDriver(driver.id),
        }
      : {
          label: "Archive Driver",
          icon: Archive,
          variant: "danger",
          separator: true,
          onClick: () => archiveDriver(driver.id),
        },
  ];

  // ✅ Dynamic Header Info
  const currentTabInfo = {
    company: {
      title: "Company Drivers",
      description: "In-house driver pool — delivery tasks & chauffeur assignments.",
      icon: <Users size={20} />,
    },
    contract: {
      title: "Contract Drivers",
      description: "External contracted drivers, freelancers, and temporary staffing.",
      icon: <Briefcase size={20} />,
    },
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* Header with Premium Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
              {currentTabInfo.icon}
            </div>
            <span>{currentTabInfo.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        {/* ✅ Premium Sliding Tab Switcher */}
        <PremiumTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Conditional Segment View Engine */}
      {activeTab === "company" ? (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
          {/* Toolbar: Metrics + Search + Filter + CTA */}
          <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
            {/* Metrics Counter */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-sm overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Drivers</span>
                <span className="text-xs font-bold text-[var(--color-ink)] tabular-nums">{driverMetrics.total}</span>
              </div>
              <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">Available</span>
                <span className="text-xs font-bold text-[var(--color-success-text)] tabular-nums">{driverMetrics.available}</span>
              </div>
              <div className="w-px h-3 bg-[var(--color-surface-border)] flex-shrink-0" />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-medium text-[var(--color-ink-muted)]">On Trip</span>
                <span className="text-xs font-bold text-[var(--color-primary-text)] tabular-nums">{driverMetrics.onTrip}</span>
              </div>
            </div>

            {/* Controls: Search + Filter + Archived + CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:w-80">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search drivers..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                  />
                </div>

                <FilterDropdown
                  filterId="driver-status"
                  label="Status"
                  options={[
                    { label: "Available", value: "available" },
                    { label: "On Trip", value: "on_trip" },
                    { label: "On Leave", value: "on_leave" },
                    { label: "Suspended", value: "suspended" },
                  ]}
                  value={statusFilter}
                  onChange={(v) => setStatusFilter(v as DriverStatus | "")}
                  icon={Filter}
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink-muted)] whitespace-nowrap cursor-pointer px-2">
                <input
                  type="checkbox"
                  checked={includeArchived}
                  onChange={(e) => setIncludeArchived(e.target.checked)}
                  className="accent-[var(--color-primary)]"
                />
                Show archived
              </label>

              <button
                onClick={openCreate}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98]"
              >
                <Plus size={16} /> Add Driver
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-12 text-center text-[var(--color-ink-muted)] flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading drivers...
            </div>
          ) : drivers.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
                <UserCircle size={24} className="text-[var(--color-ink-subtle)]" />
              </div>
              <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No drivers yet</h3>
              <p className="text-sm text-[var(--color-ink-muted)] mb-4">
                Add your first in-house driver to start assigning deliveries.
              </p>
            </div>
          ) : (
            <>
              {/* ✅ MOBILE: Premium Driver CardGrid with Glass Effect */}
              <div className="block md:hidden">
                <CardGrid
                  data={paginatedDrivers}
                  getCardId={(d) => d.id}
                  compact={true}
                  showGlassEffect={true}
                  cardClassName="!p-3 hover:!border-[var(--color-primary)]/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] transition-all duration-300"
                  containerClassName="px-2 pb-4"
                  maxHeight="calc(100vh - 160px)"
                  
                  renderCardHeader={({ item }) => {
                    const statusDot: Record<DriverStatus, string> = {
                      available: "bg-emerald-500",
                      on_trip: "bg-[var(--color-primary)]",
                      on_leave: "bg-amber-500",
                      suspended: "bg-red-500",
                    };
                    return (
                      <div 
                        className="flex items-center justify-between w-full cursor-pointer"
                        onClick={() => openEdit(item.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Premium Icon Container with Glow */}
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center shadow-md">
                              <UserCircle size={16} className="text-[var(--color-primary)]" />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5">
                              <div className={`w-3 h-3 rounded-full ${statusDot[item.status]} ring-2 ring-[var(--color-surface)] shadow-sm`} />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight uppercase">
                                {item.full_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-[var(--color-ink-muted)] font-medium">
                                {PAY_LABELS[item.pay_mode]}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <ChevronRight size={16} className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1" />
                      </div>
                    );
                  }}
                  
                  renderCardBody={({ item }) => {
                    const dl = dlState(item.dl_expiry);
                    const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.suspended;
                    
                    return (
                      <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60">
                        
                        {/* Contact & ID Section */}
                        <div className="flex items-center gap-3 mb-3">
                          {/* Phone */}
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)]/80 flex items-center justify-center flex-shrink-0">
                              <Phone size={12} className="text-[var(--color-ink-subtle)]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[var(--color-ink)] truncate leading-tight">
                                {item.phone}
                              </p>
                              <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">
                                Contact
                              </span>
                            </div>
                          </div>

                          {/* ID */}
                          <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                            <div className="min-w-0 text-right">
                              <p className="text-xs font-semibold text-[var(--color-ink)] truncate leading-tight font-mono">
                                {item.id_number_masked || "N/A"}
                              </p>
                              <span className="text-[9px] text-[var(--color-ink-muted)] font-medium">
                                National ID
                              </span>
                            </div>
                            <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)]/80 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-bold text-[var(--color-ink-subtle)]">ID</span>
                            </div>
                          </div>
                        </div>

                        {/* Unified Bottom Status Section - Clean & Minimal */}
                        <div className="rounded-xl px-3 py-2.5 border bg-[var(--color-surface-hover)]/50 border-[var(--color-surface-border)]/50">
                          <div className="flex items-center justify-between">
                            {/* DL Info */}
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
                                DL
                              </span>
                              <span className="text-[10px] font-semibold font-mono text-[var(--color-ink)] truncate">
                                {item.dl_number_masked || "N/A"}
                              </span>
                              <span className={`text-[8px] font-bold ${dl.cls}`}>{dl.label}</span>
                            </div>

                            {/* Status Label */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={`w-2 h-2 rounded-full ${
                                item.status === 'available' ? 'bg-emerald-500' :
                                item.status === 'on_trip' ? 'bg-blue-500' :
                                item.status === 'on_leave' ? 'bg-amber-500' : 'bg-red-500'
                              } flex-shrink-0`} />
                              <span className={`text-[9px] font-bold uppercase tracking-wide ${statusStyle.text}`}>
                                {STATUS_LABELS[item.status]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                  
                  rowActions={getDriverActions}
                />
              </div>

              {/* ✅ DESKTOP: Reusable DataTable */}
              <div className="hidden md:block">
                <DataTable
                  data={paginatedDrivers}
                  columns={[
                    {
                      header: "Driver",
                      accessorKey: "full_name",
                      cell: ({ row }) => (
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center text-[var(--color-ink-subtle)] shrink-0">
                            <UserCircle size={16} />
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className="text-sm font-semibold text-[var(--color-ink)] truncate">
                              {row.original.full_name}
                            </span>
                            <span className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">
                              {PAY_LABELS[row.original.pay_mode]}
                            </span>
                          </div>
                        </div>
                      ),
                    },
                    {
                      header: "Contact",
                      accessorKey: "phone",
                      cell: ({ row }) => (
                        <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                          <Phone size={12} className="text-[var(--color-ink-subtle)] flex-shrink-0" />
                          <span className="font-medium">{row.original.phone}</span>
                        </div>
                      ),
                    },
                    {
                      header: "National ID",
                      accessorKey: "id_number_masked",
                      cell: ({ row }) => (
                        <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">
                          {row.original.id_number_masked || "N/A"}
                        </span>
                      ),
                    },
                    {
                      header: "Driving License",
                      accessorKey: "dl_number_masked",
                      cell: ({ row }) => {
                        const dl = dlState(row.original.dl_expiry);
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[var(--color-ink)] tracking-wide font-mono">
                              {row.original.dl_number_masked || "N/A"}
                            </span>
                            <span className={`text-[10px] ${dl.cls}`}>{dl.label}</span>
                          </div>
                        );
                      },
                    },
                    {
                      header: "Status",
                      accessorKey: "status",
                      cell: ({ row }) => {
                        const style = STATUS_STYLES[row.original.status];
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                            {STATUS_LABELS[row.original.status]}
                          </span>
                        );
                      },
                    },
                  ]}
                  rowActions={getDriverActions}
                  getRowId={(d) => d.id}
                  onRowClick={(d) => openEdit(d.id)}
                  loading={loading}
                  emptyMessage="No drivers found"
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={drivers.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  viewMode="desktop"
                />
              </div>
            </>
          )}
        </div>
      ) : (
        /* ✅ CONTRACT TAB: Premium "Coming Soon" Placeholder */
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-muted)] flex items-center justify-center mb-4">
            <Briefcase size={24} className="text-[var(--color-primary-text)]" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
            Contract Drivers Hub
          </h3>
          <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
            External contractor management, freelance driver invoicing, temporary staffing, and on-demand availability tracking coming soon.
          </p>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit Driver" : "Add Driver"}
        subtitle="In-house staff driver — compliance & pay configuration"
        size="md"
      >
        {editingId && detailLoading ? (
          <div className="flex items-center justify-center py-12 text-[var(--color-ink-muted)]">
            <Loader2 size={18} className="animate-spin mr-2" /> Loading driver...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Full Name <span className="text-[var(--color-danger)]">*</span></label>
                <input className={inputClass} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="e.g. James Mwangi" />
              </div>
              <div>
                <label className={labelClass}>Phone <span className="text-[var(--color-danger)]">*</span></label>
                <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+2547..." />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email (optional)</label>
              <input className={inputClass} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="driver@company.com" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>ID Number <span className="text-[var(--color-danger)]">*</span></label>
                <input className={inputClass} value={form.id_number} onChange={(e) => set("id_number", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>DL Number <span className="text-[var(--color-danger)]">*</span></label>
                <input className={inputClass} value={form.dl_number} onChange={(e) => set("dl_number", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>DL Expiry</label>
                <input className={inputClass} type="date" value={form.dl_expiry} onChange={(e) => set("dl_expiry", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Pay Mode</label>
                <select className={inputClass} value={form.pay_mode} onChange={(e) => set("pay_mode", e.target.value)}>
                  <option value="commission">Commission</option>
                  <option value="fixed_per_job">Fixed / Job</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Daily Fee</label>
                <input className={inputClass} type="number" step="0.01" value={form.daily_fee} onChange={(e) => set("daily_fee", e.target.value)} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>OT Hr Fee</label>
                <input className={inputClass} type="number" step="0.01" value={form.overtime_hourly_fee} onChange={(e) => set("overtime_hourly_fee", e.target.value)} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>Night Fee</label>
                <input className={inputClass} type="number" step="0.01" value={form.night_accommodation_fee} onChange={(e) => set("night_accommodation_fee", e.target.value)} placeholder="—" />
              </div>
              <div>
                <label className={labelClass}>Delivery Comm.</label>
                <input className={inputClass} type="number" step="0.01" value={form.delivery_commission} onChange={(e) => set("delivery_commission", e.target.value)} placeholder="—" />
              </div>
            </div>

            <p className="text-[10px] text-[var(--color-ink-muted)]">
              Blank fee fields fall back to your tenant service pricing config. ID/DL numbers are masked in list views.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-surface-border)]">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.full_name || !form.phone || !form.id_number || !form.dl_number}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Driver"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

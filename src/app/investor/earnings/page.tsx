"use client";

import { useState, useMemo } from "react";
import { 
  Wallet, TrendingUp, Clock, CheckCircle, Search, Filter, 
  ArrowDownRight, Minus
} from "lucide-react";
import DataTable from "@/components/ui/DataTable";
import CardGrid from "@/components/ui/CardGrid";
import FilterDropdown from "@/components/ui/FilterDropdown";
import type { InvestorEarning, EarningStatus, EarningType } from "@/lib/types";

const useInvestorEarnings = () => {
  const earnings: InvestorEarning[] = [
    { id: 1, vehicle_id: 101, vehicle_plate: "KBA 123X", transaction_type: "revenue_share", amount: 15000, currency_code: "KES", status: "cleared", description: "Weekly revenue share (Oct 16-22)", created_at: "2023-10-24T10:00:00Z" },
    { id: 2, vehicle_id: 102, vehicle_plate: "KBC 456Y", transaction_type: "revenue_share", amount: 12500, currency_code: "KES", status: "pending", description: "Weekly revenue share (Oct 16-22)", created_at: "2023-10-22T10:00:00Z" },
    { id: 3, vehicle_id: 101, vehicle_plate: "KBA 123X", transaction_type: "maintenance_deduction", amount: -4500, currency_code: "KES", status: "cleared", description: "Routine service & oil change", created_at: "2023-10-20T14:30:00Z" },
    { id: 4, vehicle_id: 103, vehicle_plate: "KBD 789Z", transaction_type: "payout", amount: 45000, currency_code: "KES", status: "paid", description: "Monthly payout to M-Pesa", created_at: "2023-10-01T09:00:00Z" },
    { id: 5, vehicle_id: 102, vehicle_plate: "KBC 456Y", transaction_type: "revenue_share", amount: 13200, currency_code: "KES", status: "cleared", description: "Weekly revenue share (Oct 09-15)", created_at: "2023-10-16T10:00:00Z" },
  ];

  return { earnings };
};

const STATUS_FILTER_OPTIONS: { value: EarningStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "cleared", label: "Cleared" },
  { value: "paid", label: "Paid" },
];

const statusStyles: Record<EarningStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  cleared: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  paid: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
};

const statusLabels: Record<EarningStatus, string> = {
  pending: "Pending",
  cleared: "Cleared",
  paid: "Paid",
};

const typeIcons: Record<EarningType, React.ElementType> = {
  revenue_share: TrendingUp,
  maintenance_deduction: Minus,
  payout: Wallet,
};

const typeColors: Record<EarningType, string> = {
  revenue_share: "text-emerald-600 dark:text-emerald-400",
  maintenance_deduction: "text-rose-600 dark:text-rose-400",
  payout: "text-blue-600 dark:text-blue-400",
};

export default function InvestorEarningsPage() {
  const { earnings } = useInvestorEarnings();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EarningStatus | "">("");

  const stats = useMemo(() => {
    const total = earnings.reduce((sum, e) => e.transaction_type !== "maintenance_deduction" ? sum + e.amount : sum, 0);
    const pending = earnings.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);
    const lastPayout = earnings.find(e => e.transaction_type === "payout" && e.status === "paid");
    
    return {
      totalEarnings: total,
      pendingPayout: pending,
      lastPayoutAmount: lastPayout ? lastPayout.amount : 0,
      lastPayoutDate: lastPayout ? new Date(lastPayout.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    };
  }, [earnings]);

  const filteredEarnings = useMemo(() => {
    return earnings.filter((e) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        e.vehicle_plate.toLowerCase().includes(searchLower) || 
        e.description.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === "" || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [earnings, search, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatAmount = (amount: number, isDeduction: boolean) => {
    const prefix = isDeduction ? "-" : "";
    return `${prefix}KES ${Math.abs(amount).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">Earnings & Payouts</h1>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">Track your revenue share, deductions, and payout history.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">Total Earnings</span>
          </div>
          <p className="text-xl font-bold text-[var(--color-ink)]">KES {stats.totalEarnings.toLocaleString()}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">Pending Payout</span>
          </div>
          <p className="text-xl font-bold text-[var(--color-ink)]">KES {stats.pendingPayout.toLocaleString()}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Wallet size={16} className="text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">Last Payout</span>
          </div>
          <p className="text-xl font-bold text-[var(--color-ink)]">KES {stats.lastPayoutAmount.toLocaleString()}</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <CheckCircle size={16} className="text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-[var(--color-ink-muted)]">Last Payout Date</span>
          </div>
          <p className="text-xl font-bold text-[var(--color-ink)]">{stats.lastPayoutDate}</p>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-subtle)] pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vehicle or description..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-[var(--color-ink)] placeholder-[var(--color-ink-subtle)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
              />
            </div>
            <FilterDropdown
              filterId="earnings-status"
              label="Status"
              options={STATUS_FILTER_OPTIONS.filter((opt) => opt.value !== "").map((opt) => ({
                ...opt,
                count: filteredEarnings.filter((e) => e.status === opt.value).length,
              }))}
              value={statusFilter || null}
              onChange={(value) => setStatusFilter((value || "") as EarningStatus | "")}
              icon={Filter}
            />
          </div>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-surface-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-all">
            <ArrowDownRight size={14} />
            Export CSV
          </button>
        </div>

        {filteredEarnings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
              <Wallet size={24} className="text-[var(--color-ink-subtle)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">No earnings found</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">
              {search || statusFilter ? "Try adjusting your search query or filters." : "Your earnings ledger will appear here once your vehicles start generating revenue."}
            </p>
          </div>
        ) : (
          <>
            <div className="block md:hidden">
              <CardGrid
                data={filteredEarnings}
                getCardId={(e) => e.id}
                compact={true}
                showGlassEffect={true}
                cardClassName="!p-4 hover:!border-[var(--color-primary)]/40 transition-all duration-300"
                containerClassName="px-2 pb-4"
                maxHeight="calc(100vh - 200px)"
                renderCardHeader={({ item }) => {
                  const Icon = typeIcons[item.transaction_type];
                  const color = typeColors[item.transaction_type];
                  return (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color.replace('text-', 'bg-').replace('600', '500/10').replace('400', '500/10')}`}>
                          <Icon size={18} className={color} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-[var(--color-ink)] truncate">{item.vehicle_plate}</p>
                          <p className="text-[10px] text-[var(--color-ink-muted)] truncate">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold tabular-nums ${item.transaction_type === 'maintenance_deduction' ? 'text-rose-600' : 'text-[var(--color-ink)]'}`}>
                          {formatAmount(item.amount, item.transaction_type === 'maintenance_deduction')}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusStyles[item.status].bg} ${statusStyles[item.status].text}`}>
                          {statusLabels[item.status]}
                        </span>
                      </div>
                    </div>
                  );
                }}
                renderCardBody={({ item }) => (
                  <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/60 flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
                    <span>Recorded on</span>
                    <span className="font-medium">{formatDate(item.created_at)}</span>
                  </div>
                )}
              />
            </div>

            <div className="hidden md:block">
              <DataTable
                data={filteredEarnings}
                columns={[
                  {
                    header: "Date",
                    accessorKey: "created_at",
                    cell: ({ row }) => (
                      <span className="text-sm text-[var(--color-ink-muted)] whitespace-nowrap">
                        {formatDate(row.original.created_at)}
                      </span>
                    ),
                  },
                  {
                    header: "Vehicle",
                    accessorKey: "vehicle_plate",
                    cell: ({ row }) => (
                      <span className="text-sm font-semibold text-[var(--color-ink)] font-mono">
                        {row.original.vehicle_plate}
                      </span>
                    ),
                  },
                  {
                    header: "Type",
                    accessorKey: "transaction_type",
                    cell: ({ row }) => {
                      const type = row.original.transaction_type;
                      const Icon = typeIcons[type];
                      const color = typeColors[type];
                      const label = type === "revenue_share" ? "Revenue Share" : type === "maintenance_deduction" ? "Maintenance" : "Payout";
                      return (
                        <div className="flex items-center gap-2">
                          <Icon size={16} className={color} />
                          <span className="text-sm font-medium text-[var(--color-ink)]">{label}</span>
                        </div>
                      );
                    },
                  },
                  {
                    header: "Description",
                    accessorKey: "description",
                    cell: ({ row }) => (
                      <span className="text-sm text-[var(--color-ink-muted)] line-clamp-1">
                        {row.original.description}
                      </span>
                    ),
                  },
                  {
                    header: "Status",
                    accessorKey: "status",
                    cell: ({ row }) => {
                      const style = statusStyles[row.original.status];
                      return (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${style.bg} ${style.text}`}>
                          {statusLabels[row.original.status]}
                        </span>
                      );
                    },
                  },
                  {
                    header: "Amount",
                    accessorKey: "amount",
                    cell: ({ row }) => {
                      const isDeduction = row.original.transaction_type === "maintenance_deduction";
                      return (
                        <span className={`text-sm font-bold tabular-nums text-right ${isDeduction ? "text-rose-600 dark:text-rose-400" : "text-[var(--color-ink)]"}`}>
                          {formatAmount(row.original.amount, isDeduction)}
                        </span>
                      );
                    },
                  },
                ]}
                getRowId={(e) => e.id}
                emptyMessage="No earnings found"
                viewMode="desktop"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

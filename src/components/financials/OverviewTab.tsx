// src/components/financials/OverviewTab.tsx
"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Clock, Calendar, CalendarDays, Rocket, Zap } from "lucide-react";
import { useFinancialOverview } from "@/hooks/financials/useFinancialOverview";

import RevenueOverviewWidget from "./overview/RevenueOverviewWidget";
import InvoiceStatusWidget from "./overview/InvoiceStatusWidget";
import ContractHealthWidget from "./overview/ContractHealthWidget";
import ActivityFeed from "./overview/ActivityFeed";
import QuickActions from "./overview/QuickActions";

// ✅ NEW: Import the modals
import CreateInvoiceModal from "./invoices/CreateInvoiceModal";
import RecordPaymentModal from "./invoices/RecordPaymentModal";
import GenerateContractModal from "./contracts/GenerateContractModal";

type TimeFilter = "today" | "week" | "month";

export default function OverviewTab() {
  // ✅ REMOVED: useRouter (no longer needed for quick actions)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const { data, loading, error, refetch } = useFinancialOverview();

  // ✅ NEW: Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-[var(--color-ink-muted)]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-primary)]" />
        <p className="text-sm font-medium">Loading financial cockpit...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-[var(--color-danger-text)]">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p className="text-sm font-medium mb-2">Failed to load dashboard data</p>
        <button 
          onClick={refetch}
          className="text-xs px-4 py-2 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Filter activities based on time selection (client-side filtering)
  const filterActivitiesByTime = (activities: typeof data.recent_activity) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return activities.filter(activity => {
      // ✅ FIXED: Use activity.created_at (raw ActivityLog field)
      const activityDate = new Date(activity.created_at);
      if (timeFilter === "today") return activityDate >= today;
      if (timeFilter === "week") return activityDate >= weekAgo;
      if (timeFilter === "month") return activityDate >= monthAgo;
      return true;
    }).slice(0, 10); // ✅ Feed window shows ~3 cards; the rest scrolls
  };

  const filteredActivities = filterActivitiesByTime(data.recent_activity);

  // ✅ Modal callbacks - These refetch the data after an action is completed
  const handleInvoiceCreated = () => {
    setIsInvoiceModalOpen(false);
    refetch();
  };

  const handlePaymentRecorded = () => {
    setIsPaymentModalOpen(false);
    refetch();
  };

  const handleContractGenerated = () => {
    setIsContractModalOpen(false);
    refetch();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-6">
        <RevenueOverviewWidget data={data.revenue_overview} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InvoiceStatusWidget data={data.invoice_status} />
          <ContractHealthWidget data={data.contract_health} />
        </div>
      </div>

      <div className="space-y-6">
        {/* ✅ Activity Feed Container with Premium Header */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-5 border-b border-[var(--color-surface-border)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                <Rocket size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Recent Activity</p>
                <p className="text-[10px] text-[var(--color-ink-subtle)]">Live feed of your business</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTimeFilter("today")}
                className={`p-1.5 rounded-lg transition-all ${
                  timeFilter === "today" 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
                title="Today"
              >
                <Clock size={14} />
              </button>
              <button
                onClick={() => setTimeFilter("week")}
                className={`p-1.5 rounded-lg transition-all ${
                  timeFilter === "week" 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
                title="This Week"
              >
                <Calendar size={14} />
              </button>
              <button
                onClick={() => setTimeFilter("month")}
                className={`p-1.5 rounded-lg transition-all ${
                  timeFilter === "month" 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                }`}
                title="This Month"
              >
                <CalendarDays size={14} />
              </button>
            </div>
          </div>

          {/* ✅ ActivityFeed handles its own scrolling - shows 3 full cards + half of 4th */}
          <ActivityFeed activities={filteredActivities} />
        </div>

        {/* ✅ Quick Actions Container with Premium Header */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap size={16} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">Quick Actions</p>
              <p className="text-[10px] text-[var(--color-ink-subtle)]">Common tasks at your fingertips</p>
            </div>
          </div>
          
          {/* ✅ NEW: Open modals instead of redirecting to tabs */}
          <QuickActions 
            onOpenCreateInvoice={() => setIsInvoiceModalOpen(true)}
            onOpenRecordPayment={() => setIsPaymentModalOpen(true)}
            onOpenGenerateContract={() => setIsContractModalOpen(true)}
          />
        </div>
      </div>

      {/* ✅ NEW: Render Modals at the bottom */}
      <CreateInvoiceModal
        open={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onCreated={handleInvoiceCreated}
      />

      <RecordPaymentModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentRecorded={handlePaymentRecorded}
        invoice={null} // ✅ Default to no invoice; user selects one inside the modal
      />

      <GenerateContractModal
        open={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onGenerated={handleContractGenerated}
      />
    </div>
  );
}

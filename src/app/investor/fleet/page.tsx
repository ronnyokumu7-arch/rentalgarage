"use client";

import { useState } from "react";
import { Car, Plus, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import InvestorFleetList from "@/components/investor/InvestorFleetList";
import { useInvestorFleetList } from "@/hooks/investor/useInvestorFleetList";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import AddVehicleModal from "@/components/investor/AddVehicleModal";

type TabMode = "fleet" | "performance";

const TABS: { id: TabMode; label: string; icon: React.ElementType }[] = [
  { id: "fleet", label: "My Vehicles", icon: Car },
  { id: "performance", label: "Performance", icon: BarChart3 },
];

export default function InvestorFleetPage() {
  const [activeTab, setActiveTab] = useState<TabMode>("fleet");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fleetData = useInvestorFleetList();

  const currentTabInfo = {
    fleet: {
      title: "My Fleet",
      description: "Overview of your leased vehicles, their current status, and performance.",
      icon: <Car size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
    performance: {
      title: "Fleet Performance",
      description: "Deep insights into your fleet's utilization and profitability.",
      icon: <BarChart3 size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    },
  }[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {currentTabInfo.icon}
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              {currentTabInfo.title}
            </h1>
          </div>
          <p className="ml-10 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        <PremiumTabSwitcher 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={(tabId) => setActiveTab(tabId as TabMode)} 
        />
      </div>

      {activeTab === "fleet" ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden"
        >
          <InvestorFleetList 
            {...fleetData} 
            onAddVehicle={() => setIsModalOpen(true)} 
          />
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 text-center"
        >
          <BarChart3 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Performance Analytics</h3>
          <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
            Advanced fleet performance metrics, real-time vehicle utilization analysis, and customized profitability timelines coming soon.
          </p>
        </motion.div>
      )}

      {/* Floating Action Button */}
      {activeTab === "fleet" && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-50 group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full shadow-[var(--shadow-xl)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
          title="Add New Vehicle"
        >
          <Plus size={24} className="sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden md:block absolute right-full mr-4 px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-ink)] text-xs font-bold rounded-lg shadow-[var(--shadow-dropdown)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-[var(--color-surface-border)]">
            Add Vehicle
          </span>
        </button>
      )}

      {/* Add Vehicle Modal */}
      <AddVehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fleetData.refetch} 
      />
    </div>
  );
}

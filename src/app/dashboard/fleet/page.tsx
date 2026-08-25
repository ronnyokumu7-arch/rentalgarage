"use client";

import { useRouter } from "next/navigation";
import { Car, Plus, BarChart3, Wrench } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useFleetList } from "@/hooks/fleet/useFleetList";
import FleetList from "@/components/fleet/FleetList";
import QuickGarageModal from "@/components/ui/QuickGarageModal";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

type TabMode = "fleet" | "performance" | "garage";

interface TabItem {
  id: TabMode;
  label: string;
  icon: React.ElementType;
  hiddenOnMobile?: boolean;
}

const TABS: TabItem[] = [
  { id: "fleet", label: "Vehicles", icon: Car },
  { id: "performance", label: "Performance", icon: BarChart3, hiddenOnMobile: true },
  { id: "garage", label: "Garage", icon: Wrench },
];

export default function FleetPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabMode>("fleet");
  const [activeRentals, setActiveRentals] = useState<Record<number, Booking>>({});

  const fleetData = useFleetList();

  // Fetch active rentals for trip progress bar
  useEffect(() => {
    async function fetchActiveRentals() {
      try {
        // Fetch all bookings (you might want to add pagination params)
        const allBookings = await bookingsApi.list({ 
          page: 1, 
          page_size: 100 
        });
        
        // Filter to active or confirmed bookings
        const active = allBookings.filter(
          b => b.status === 'active' || b.status === 'confirmed'
        );
        
        // Create map: vehicle_id -> booking
        const rentalMap: Record<number, Booking> = {};
        active.forEach(booking => {
          if (booking.vehicle_id) {
            rentalMap[booking.vehicle_id] = booking;
          }
        });
        
        setActiveRentals(rentalMap);
      } catch (error) {
        console.error('Failed to fetch active rentals:', error);
      }
    }

    fetchActiveRentals();
  }, []);

  // Dynamic Header Info
  const currentTabInfo = useMemo(() => {
    if (activeTab === "fleet") {
      return {
        title: "Fleet Management",
        description: "Oversee your vehicles, track performance statuses, and manage your garage pipelines.",
        icon: <Car size={20} />,
      };
    }
    if (activeTab === "performance") {
      return {
        title: "Performance Analytics",
        description: "Deep insights into your fleet's performance, utilization, and profitability.",
        icon: <BarChart3 size={20} />,
      };
    }
    return {
      title: "Garage Operations",
      description: "Onboard new vehicles, manage maintenance, and track service schedules.",
      icon: <Wrench size={20} />,
    };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header with Tab Switcher */}
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-border)] shadow-sm self-start sm:self-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  tab.hiddenOnMobile ? "hidden md:flex" : "flex"
                } items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Segment View Engine */}
      {activeTab === "fleet" ? (
        // ✅ WRAPPED FleetList with activeRentals prop
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] overflow-hidden animate-in fade-in duration-300">
          <FleetList 
            {...fleetData} 
            activeRentals={activeRentals}
          />
        </div>
      ) : activeTab === "performance" ? (
        // ✅ MATCHED empty state pattern from Clients page exactly
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 text-center animate-in fade-in duration-300">
          <BarChart3 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">Performance Analytics</h3>
          <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
            Advanced fleet performance metrics, real-time vehicle utilization analysis, and customized profitability timelines coming soon.
          </p>
        </div>
      ) : (
        // ✅ MATCHED garage hub card patterns from Clients page
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Garage Hub Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Quick Garage Card */}
            <div
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-4 sm:p-6 group cursor-pointer hover:border-[var(--color-primary)]/30 transition-all flex flex-row sm:flex-col items-start gap-3.5 sm:gap-0"
              onClick={() => {
                const awaitingVehicle = fleetData.filteredVehicles.find(
                  (v) => v.mileage_due === true
                );
                if (awaitingVehicle) {
                  fleetData.setGarageVehicle(awaitingVehicle);
                  fleetData.setGarageModalOpen(true);
                }
              }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-warning-bg)] flex items-center justify-center text-[var(--color-warning-text)] sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Wrench size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-[var(--color-ink)] mb-1 sm:mb-2">
                  Quick Garage
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mb-2 sm:mb-4">
                  Update mileage and service status for vehicles awaiting inspection.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)]">
                  <span>
                    {fleetData.filteredVehicles.filter((v) => v.mileage_due).length} vehicles pending mileage
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            {/* Maintenance Queue Card */}
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-4 sm:p-6 group cursor-pointer hover:border-[var(--color-primary)]/30 transition-all flex flex-row sm:flex-col items-start gap-3.5 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-danger-bg)] flex items-center justify-center text-[var(--color-danger-text)] sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Car size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-[var(--color-ink)] mb-1 sm:mb-2">
                  Maintenance Queue
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mb-2 sm:mb-4">
                  Track vehicles currently in service and their repair status.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)]">
                  <span>
                    {fleetData.filteredVehicles.filter((v) => v.status === "maintenance").length} in maintenance
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            {/* Service Due Card */}
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-4 sm:p-6 group cursor-pointer hover:border-[var(--color-primary)]/30 transition-all flex flex-row sm:flex-col items-start gap-3.5 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-primary-muted)] flex items-center justify-center text-[var(--color-primary-text)] sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <BarChart3 size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-[var(--color-ink)] mb-1 sm:mb-2">
                  Service Due Soon
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mb-2 sm:mb-4">
                  Vehicles approaching their next scheduled service interval.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)]">
                  <span>View schedule</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card - MATCHED Clients page empty state pattern */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-warning-bg)] flex items-center justify-center mb-4">
              <Wrench size={24} className="text-[var(--color-warning-text)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
              Garage Hub
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              Comprehensive maintenance scheduling, parts inventory, mechanic assignments, and automated service reminders coming soon.
            </p>
          </div>
        </div>
      )}

      {/* Quick Garage Modal */}
      <QuickGarageModal
        vehicle={fleetData.garageVehicle}
        open={fleetData.garageModalOpen}
        onClose={() => {
          fleetData.setGarageModalOpen(false);
          fleetData.setGarageVehicle(null);
        }}
        onSave={fleetData.handleGarageSave}
      />

      {/* FLOATING ACTION BUTTON - Kept as-is, matches system patterns */}
      {activeTab === "garage" && (
        <button
          onClick={() => router.push("/dashboard/fleet/new")}
          className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-50 group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full shadow-[var(--shadow-xl)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
          title="Add New Vehicle"
        >
          <Plus size={24} className="sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform duration-300" />
          <span className="hidden md:block absolute right-full mr-4 px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-ink)] text-xs font-bold rounded-lg shadow-[var(--shadow-dropdown)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-[var(--color-surface-border)]">
            Add Vehicle
          </span>
        </button>
      )}
    </div>
  );
}

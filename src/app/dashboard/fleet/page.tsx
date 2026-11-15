"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Car, ChartBar as BarChart3, Wrench, CarProfile as CarFront, ChartLine as LineChart, Wrench as WrenchIcon,
} from "@phosphor-icons/react/ssr";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useFleetList } from "@/hooks/fleet/useFleetList"; // ✅ SINGLE HOOK
import { useFleetTour } from "@/hooks/fleet/useFleetTour";
import { useSetPageHeader } from "@/context/page-header-context";
import QuickGarageModal from "@/components/ui/QuickGarageModal";
import InvestorVehiclePricingModal from "@/components/fleet/InvestorVehiclePricingModal";
import VehicleDetailsModal from "@/components/fleet/VehicleDetailsModal";
import FleetTourSheet from "@/components/fleet/FleetTourSheet";
import { bookingsApi } from "@/lib/api/bookings";
import { vehiclesApi } from "@/lib/api/vehicles";
import type { Booking, Vehicle } from "@/lib/types";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import MobileFleetList from "@/components/fleet/MobileFleetList";
import DesktopFleetList from "@/components/fleet/DesktopFleetList";
import toast from "react-hot-toast";

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

const MOBILE_TABS: TabItem[] = TABS.filter((t) => !t.hiddenOnMobile);
const VALID_TABS = new Set<TabMode>(["fleet", "performance", "garage"]);

export default function FleetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabFromUrl = searchParams.get("tab") as TabMode | null;
  const initialTab: TabMode = tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : "fleet";
  const [activeTab, setActiveTab] = useState<TabMode>(initialTab);

  const [activeRentals, setActiveRentals] = useState<Record<number, Booking>>({});
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ✅ SINGLE INSTANCE of the base hook (fixes double-fetch / out-of-sync bug)
  const fleet = useFleetList();
  const tour = useFleetTour();

  useEffect(() => {
    const t = searchParams.get("tab") as TabMode | null;
    if (t && VALID_TABS.has(t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tabId: string) => {
    if (!VALID_TABS.has(tabId as TabMode)) return;
    const next = tabId as TabMode;
    if (next === activeTab) return;
    setActiveTab(next);
    router.push(`/dashboard/fleet?tab=${next}`, { scroll: false });
  };

  useEffect(() => {
    async function fetchActiveRentals() {
      try {
        const allBookings = await bookingsApi.list({ page: 1, page_size: 100 });
        const active = allBookings.filter(
          (b) => b.status === "active" || b.status === "confirmed"
        );
        const rentalMap: Record<number, Booking> = {};
        active.forEach((booking) => {
          if (booking.vehicle_id) {
            rentalMap[booking.vehicle_id] = booking;
          }
        });
        setActiveRentals(rentalMap);
      } catch (error) {
        console.error("Failed to fetch active rentals:", error);
      }
    }
    fetchActiveRentals();
  }, []);

  // ✅ Derived status options computed ONCE from the single filtered list
  const statusOptions = useMemo(() => {
    const opts = [
      { value: "pending_activation", label: "Pending Activation" },
      { value: "available", label: "Available" },
      { value: "rented", label: "Rented" },
      { value: "maintenance", label: "Maintenance" },
      { value: "retired", label: "Retired" },
    ];
    return opts.map((o) => ({
      ...o,
      count: fleet.filteredVehicles.filter((v) => v.status === o.value).length,
    }));
  }, [fleet.filteredVehicles]);

  const handleGarageSave = useCallback(
    async (payload: { current_mileage: number; next_service_km?: number | null }) => {
      if (!fleet.garageVehicle) return;
      try {
        if (fleet.garageVehicle.mileage_due) {
          await vehiclesApi.updateMileage(fleet.garageVehicle.id, payload);
          toast.success("Mileage updated and vehicle is now available!");
        } else {
          await vehiclesApi.update(fleet.garageVehicle.id, payload);
          toast.success("Vehicle mileage updated!");
        }
        fleet.setGarageModalOpen(false);
        fleet.setGarageVehicle(null);
        await fleet.refetch();
      } catch (error: unknown) {
        const err = error as { response?: { data?: { detail?: string; message?: string } } };
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.detail ||
            "Failed to update mileage"
        );
        throw error;
      }
    },
    [fleet]
  );

  const handleStatusAction = useCallback(
    async (id: number, action: string) => {
      const vehicle = fleet.filteredVehicles.find((v) => v.id === id);
      if (action === "activate" && vehicle?.owner_id) {
        fleet.setPricingVehicle(vehicle);
        fleet.setIsPricingModalOpen(true);
        return;
      }
      await fleet.handleStatusAction(id, action);
    },
    [fleet]
  );

  const currentTabInfo = useMemo(() => {
    if (activeTab === "fleet") {
      return {
        title: "Fleet Management",
        mobileTitle: "Manage Fleet",
        description: "Oversee your vehicles, track performance statuses, and manage your garage pipelines.",
        icon: <CarFront size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
      };
    }
    if (activeTab === "performance") {
      return {
        title: "Performance Analytics",
        mobileTitle: "Performance",
        description: "Deep insights into your fleet's performance, utilization, and profitability.",
        icon: <LineChart size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
      };
    }
    return {
      title: "Garage Operations",
      mobileTitle: "Garage",
      description: "Onboard new vehicles, manage maintenance, and track service schedules.",
      icon: <WrenchIcon size={28} weight="light" className="text-[var(--color-primary)]" aria-hidden="true" />,
    };
  }, [activeTab]);

  useSetPageHeader(currentTabInfo.mobileTitle, currentTabInfo.description, tour.open);

  return (
    <div className="space-y-6">
      {/* DESKTOP-ONLY HEADER */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">{currentTabInfo.icon}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              {currentTabInfo.title}
            </h1>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
            {currentTabInfo.description}
          </p>
        </div>

        <div className="hidden md:block">
          <PremiumTabSwitcher
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "fleet" && (
        <>
          <MobileFleetList
            loading={fleet.loading}
            search={fleet.search}
            setSearch={fleet.setSearch}
            statusFilter={fleet.statusFilter}
            setStatusFilter={fleet.setStatusFilter}
            statusOptions={statusOptions}
            activeTab={activeTab}
            handleTabChange={handleTabChange}
            mobileTabs={MOBILE_TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
            filteredVehicles={fleet.filteredVehicles} // ✅ Full list for mobile (no pagination)
            setGarageVehicle={fleet.setGarageVehicle}
            setGarageModalOpen={fleet.setGarageModalOpen}
            setPricingVehicle={fleet.setPricingVehicle}
            setIsPricingModalOpen={fleet.setIsPricingModalOpen}
            setEditVehicle={setEditVehicle}
            setIsEditModalOpen={setIsEditModalOpen}
            handleStatusAction={handleStatusAction}
            handleArchive={fleet.handleArchive}
            handleRetire={fleet.handleRetire}
            onAddVehicle={() => router.push("/dashboard/fleet/new")}
          />

          <DesktopFleetList
            loading={fleet.loading}
            search={fleet.search}
            setSearch={fleet.setSearch}
            statusFilter={fleet.statusFilter}
            setStatusFilter={fleet.setStatusFilter}
            currentPage={fleet.currentPage}
            setCurrentPage={fleet.setCurrentPage}
            pageSize={fleet.pageSize}
            totalPages={fleet.totalPages}
            filteredVehicles={fleet.filteredVehicles}
            paginatedVehicles={fleet.paginatedVehicles} // ✅ Sliced to 10 for desktop
            totalVehicles={fleet.totalVehicles}
            availableVehicles={fleet.availableVehicles}
            rentedVehicles={fleet.rentedVehicles}
            mileageDueCount={fleet.mileageDueCount}
            activeRentals={activeRentals}
            setGarageVehicle={fleet.setGarageVehicle}
            setGarageModalOpen={fleet.setGarageModalOpen}
            setPricingVehicle={fleet.setPricingVehicle}
            setIsPricingModalOpen={fleet.setIsPricingModalOpen}
            handleStatusAction={handleStatusAction}
            handleArchive={fleet.handleArchive}
            handleRetire={fleet.handleRetire}
            onAddVehicle={() => router.push("/dashboard/fleet/new")}
          />
        </>
      )}

      {activeTab === "performance" && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 text-center animate-in fade-in duration-300">
          <BarChart3 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" aria-hidden="true" />
          <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
            Performance Analytics
          </h3>
          <p className="text-sm text-[var(--color-ink-muted)] max-w-md mx-auto">
            Advanced fleet performance metrics, real-time vehicle utilization
            analysis, and customized profitability timelines coming soon.
          </p>
        </div>
      )}

      {activeTab === "garage" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <div
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-4 sm:p-6 group cursor-pointer hover:border-[var(--color-primary)]/30 transition-all flex flex-row sm:flex-col items-start gap-3.5 sm:gap-0"
              onClick={() => {
                const awaitingVehicle = fleet.filteredVehicles.find(
                  (v) => v.mileage_due === true
                );
                if (awaitingVehicle) {
                  fleet.setGarageVehicle(awaitingVehicle);
                  fleet.setGarageModalOpen(true);
                }
              }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-warning-bg)] flex items-center justify-center text-[var(--color-warning-text)] sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Wrench size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
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
                    {fleet.filteredVehicles.filter((v) => v.mileage_due).length} vehicles pending mileage
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-4 sm:p-6 group cursor-pointer hover:border-[var(--color-primary)]/30 transition-all flex flex-row sm:flex-col items-start gap-3.5 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-danger-bg)] flex items-center justify-center text-[var(--color-danger-text)] sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Car size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
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
                    {fleet.filteredVehicles.filter((v) => v.status === "maintenance").length} in maintenance
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-4 sm:p-6 group cursor-pointer hover:border-[var(--color-primary)]/30 transition-all flex flex-row sm:flex-col items-start gap-3.5 sm:gap-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--color-primary-muted)] flex items-center justify-center text-[var(--color-primary-text)] sm:mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <BarChart3 size={20} className="sm:w-6 sm:h-6" aria-hidden="true" />
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

          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-warning-bg)] flex items-center justify-center mb-4">
              <Wrench size={24} className="text-[var(--color-warning-text)]" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">
              Garage Hub
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-md">
              Comprehensive maintenance scheduling, parts inventory, mechanic
              assignments, and automated service reminders coming soon.
            </p>
          </div>
        </div>
      )}

      {/* MODALS */}
      <VehicleDetailsModal
        vehicle={editVehicle}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditVehicle(null);
        }}
        onSuccess={async () => {
          await fleet.refetch();
        }}
      />

      <QuickGarageModal
        vehicle={fleet.garageVehicle}
        open={fleet.garageModalOpen}
        onClose={() => {
          fleet.setGarageModalOpen(false);
          fleet.setGarageVehicle(null);
        }}
        onSave={handleGarageSave}
      />

      <InvestorVehiclePricingModal
        vehicle={fleet.pricingVehicle}
        isOpen={fleet.isPricingModalOpen}
        onClose={() => {
          fleet.setIsPricingModalOpen(false);
          fleet.setPricingVehicle(null);
        }}
        onSuccess={async () => {
          await fleet.refetch();
        }}
      />

      <FleetTourSheet isOpen={tour.isOpen} onClose={tour.close} />
    </div>
  );
}

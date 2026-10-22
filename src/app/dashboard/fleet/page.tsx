// src/app/dashboard/fleet/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Car, BarChart3, Wrench, CarFront, LineChart, Wrench as WrenchIcon,
  Info, X,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useMobileFleet } from "@/hooks/fleet/useMobileFleet";
import { useDesktopFleet } from "@/hooks/fleet/useDesktopFleet";
import QuickGarageModal from "@/components/ui/QuickGarageModal";
import InvestorVehiclePricingModal from "@/components/fleet/InvestorVehiclePricingModal";
import VehicleDetailsModal from "@/components/fleet/VehicleDetailsModal";
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
  const initialTab: TabMode =
    tabFromUrl && VALID_TABS.has(tabFromUrl) ? tabFromUrl : "fleet";
  const [activeTab, setActiveTab] = useState<TabMode>(initialTab);

  const [activeRentals, setActiveRentals] = useState<Record<number, Booking>>({});

  const [garageVehicle, setGarageVehicle] = useState<Vehicle | null>(null);
  const [garageModalOpen, setGarageModalOpen] = useState(false);
  const [pricingVehicle, setPricingVehicle] = useState<Vehicle | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  const mobile = useMobileFleet();
  const desktop = useDesktopFleet();

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

  const handleGarageSave = useCallback(
    async (payload: { current_mileage: number; next_service_km?: number | null }) => {
      if (!garageVehicle) return;
      try {
        if (garageVehicle.mileage_due) {
          await vehiclesApi.updateMileage(garageVehicle.id, payload);
          toast.success("Mileage updated and vehicle is now available!");
        } else {
          await vehiclesApi.update(garageVehicle.id, payload);
          toast.success("Vehicle mileage updated!");
        }
        setGarageModalOpen(false);
        setGarageVehicle(null);
        await Promise.all([mobile.refetch(), desktop.refetch()]);
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
    [garageVehicle, mobile, desktop]
  );

  const handleStatusAction = useCallback(
    async (id: number, action: string) => {
      const vehicle = mobile.filteredVehicles.find((v) => v.id === id);
      if (action === "activate" && vehicle?.owner_id) {
        setPricingVehicle(vehicle);
        setIsPricingModalOpen(true);
        return;
      }
      await mobile.handleStatusAction(id, action);
      await desktop.refetch();
    },
    [mobile, desktop]
  );

  const currentTabInfo = useMemo(() => {
    if (activeTab === "fleet") {
      return {
        title: "Fleet Management",
        mobileTitle: "Fleet",
        description:
          "Oversee your vehicles, track performance statuses, and manage your garage pipelines.",
        tour: [
          "Search vehicles by make, model, or plate number.",
          "Tap the filter icon to show status filters.",
          "Tap a vehicle card to open its profile or long-press to select multiple.",
          "Use the pull-up menu at the bottom to switch between Fleet, Garage, and Performance.",
        ],
        icon: <CarFront size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
      };
    }
    if (activeTab === "performance") {
      return {
        title: "Performance Analytics",
        mobileTitle: "Performance",
        description:
          "Deep insights into your fleet's performance, utilization, and profitability.",
        tour: [
          "Track utilization, revenue, and profitability across your fleet.",
          "Compare performance across time periods.",
          "Identify your most and least profitable vehicles.",
        ],
        icon: <LineChart size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
      };
    }
    return {
      title: "Garage Operations",
      mobileTitle: "Garage",
      description:
        "Onboard new vehicles, manage maintenance, and track service schedules.",
      tour: [
        "See vehicles awaiting mileage updates.",
        "Track vehicles currently in maintenance.",
        "Review service schedules and upcoming due dates.",
      ],
      icon: <WrenchIcon size={28} strokeWidth={1.5} className="text-[var(--color-primary)]" />,
    };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* ─── HEADER ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex">{currentTabInfo.icon}</span>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-ink)] tracking-tight">
              <span className="sm:hidden">{currentTabInfo.mobileTitle}</span>
              <span className="hidden sm:inline">{currentTabInfo.title}</span>
            </h1>
            <button
              onClick={() => setTourOpen(true)}
              className="sm:hidden p-1 rounded-full text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
              aria-label="About this page"
            >
              <Info size={16} />
            </button>
          </div>
          <p className="hidden sm:block text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] mt-1">
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

      {/* ─── TAB CONTENT ─────────────────────────────────────── */}
      {activeTab === "fleet" && (
        <>
          <MobileFleetList
            loading={mobile.loading}
            search={mobile.search}
            setSearch={mobile.setSearch}
            statusFilter={mobile.statusFilter}
            setStatusFilter={mobile.setStatusFilter}
            statusOptions={mobile.statusOptions}
            activeTab={activeTab}
            handleTabChange={handleTabChange}
            mobileTabs={MOBILE_TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
            filteredVehicles={mobile.filteredVehicles}
            activeRentals={activeRentals}
            setGarageVehicle={setGarageVehicle}
            setGarageModalOpen={setGarageModalOpen}
            setPricingVehicle={setPricingVehicle}
            setIsPricingModalOpen={setIsPricingModalOpen}
            setEditVehicle={setEditVehicle}
            setIsEditModalOpen={setIsEditModalOpen}
            handleStatusAction={handleStatusAction}
            handleArchive={mobile.handleArchive}
            handleRetire={mobile.handleRetire}
            onAddVehicle={() => router.push("/dashboard/fleet/new")}
          />

          <DesktopFleetList
            loading={desktop.loading}
            search={desktop.search}
            setSearch={desktop.setSearch}
            statusFilter={desktop.statusFilter}
            setStatusFilter={desktop.setStatusFilter}
            currentPage={desktop.currentPage}
            setCurrentPage={desktop.setCurrentPage}
            pageSize={desktop.pageSize}
            totalPages={desktop.totalPages}
            filteredVehicles={desktop.filteredVehicles}
            paginatedVehicles={desktop.paginatedVehicles}
            totalVehicles={desktop.totalVehicles}
            availableVehicles={desktop.availableVehicles}
            rentedVehicles={desktop.rentedVehicles}
            mileageDueCount={desktop.mileageDueCount}
            activeRentals={activeRentals}
            setGarageVehicle={setGarageVehicle}
            setGarageModalOpen={setGarageModalOpen}
            setPricingVehicle={setPricingVehicle}
            setIsPricingModalOpen={setIsPricingModalOpen}
            handleStatusAction={handleStatusAction}
            handleArchive={desktop.handleArchive}
            handleRetire={desktop.handleRetire}
            onAddVehicle={() => router.push("/dashboard/fleet/new")}
          />
        </>
      )}

      {activeTab === "performance" && (
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 text-center animate-in fade-in duration-300">
          <BarChart3 size={48} className="mx-auto text-[var(--color-ink-subtle)] mb-4" />
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
                const awaitingVehicle = mobile.filteredVehicles.find(
                  (v) => v.mileage_due === true
                );
                if (awaitingVehicle) {
                  setGarageVehicle(awaitingVehicle);
                  setGarageModalOpen(true);
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
                    {mobile.filteredVehicles.filter((v) => v.mileage_due).length} vehicles pending mileage
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

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
                    {mobile.filteredVehicles.filter((v) => v.status === "maintenance").length} in maintenance
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>

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

          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-warning-bg)] flex items-center justify-center mb-4">
              <Wrench size={24} className="text-[var(--color-warning-text)]" />
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

      {/* ─── MODALS ──────────────────────────────────────────── */}
      <VehicleDetailsModal
        vehicle={editVehicle}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditVehicle(null);
        }}
        onSuccess={async () => {
          await Promise.all([mobile.refetch(), desktop.refetch()]);
        }}
      />

      <QuickGarageModal
        vehicle={garageVehicle}
        open={garageModalOpen}
        onClose={() => {
          setGarageModalOpen(false);
          setGarageVehicle(null);
        }}
        onSave={handleGarageSave}
      />

      <InvestorVehiclePricingModal
        vehicle={pricingVehicle}
        isOpen={isPricingModalOpen}
        onClose={() => {
          setIsPricingModalOpen(false);
          setPricingVehicle(null);
        }}
        onSuccess={async () => {
          await Promise.all([mobile.refetch(), desktop.refetch()]);
        }}
      />

      {/* ─── FLOATING RETURN-TO-FLEET (garage only) ─────────── */}
      {activeTab === "garage" && (
        <div
          data-fab-stack
          className="lg:hidden fixed right-4 bottom-[108px] z-[65] pointer-events-none"
        >
          <button
            type="button"
            onClick={() => handleTabChange("fleet")}
            aria-label="Back to Vehicles"
            className="pointer-events-auto w-14 h-14 rounded-xl bg-[var(--color-primary)]/20 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-primary)]/30 transition-all"
          >
            <CarFront size={22} strokeWidth={2} className="text-[var(--color-primary)]" />
          </button>
        </div>
      )}

      {/* ─── TOUR BOTTOM SHEET ─────────────────────────────────── */}
      {tourOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setTourOpen(false)}
        >
          <div
            className="bg-[var(--color-surface)] w-full rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--color-ink-subtle)]/30" />
            </div>

            <div className="px-5 pb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Info size={18} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-[var(--color-ink)]">{currentTabInfo.title}</h2>
                  <p className="text-xs text-[var(--color-ink-muted)]">{currentTabInfo.description}</p>
                </div>
              </div>
              <button
                onClick={() => setTourOpen(false)}
                className="p-2 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5">
              <div className="space-y-2 mt-1">
                {currentTabInfo.tour.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)]/60"
                  >
                    <span className="w-5 h-5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs text-[var(--color-ink)] leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// src/app/dashboard/fleet/[id]/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Loader2, AlertCircle } from "lucide-react";
import { useVehicleDetail } from "@/hooks/fleet/useVehicleDetail";
import { useVehicleActions } from "@/hooks/fleet/useVehicleActions";
import { useFleetList } from "@/hooks/fleet/useFleetList";
import VehicleHero from "@/components/fleet/VehicleHero";
import VehicleStatusStrip from "@/components/fleet/VehicleStatusStrip";
import VehicleCurrentTripBanner from "@/components/fleet/VehicleCurrentTripBanner";
import VehicleSpecsPanel from "@/components/fleet/VehicleSpecsPanel";
import VehicleLeaseSidebar from "@/components/fleet/VehicleLeaseSidebar";
import VehicleBookingsTab from "@/components/fleet/VehicleBookingsTab";
import VehicleDocumentsTab from "@/components/fleet/VehicleDocumentsTab";
import VehicleDetailsModal from "@/components/fleet/VehicleDetailsModal";
import QuickGarageModal from "@/components/ui/QuickGarageModal";
import InvestorVehiclePricingModal from "@/components/fleet/InvestorVehiclePricingModal";
import PremiumTabSwitcher from "@/components/ui/PremiumTabSwitcher";
import type { Vehicle } from "@/lib/types";

type Tab = "overview" | "bookings" | "documents";

const TABS = [
  { id: "overview" as const, label: "Overview" },
  { id: "bookings" as const, label: "Bookings" },
  { id: "documents" as const, label: "Documents" },
];

export default function VehicleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const vehicleId = Number(params.id);
  const router = useRouter();

  const { vehicle, bookings, loading, error, stats, refetch } = useVehicleDetail(vehicleId);
  const fleetList = useFleetList();

  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getVehicleActions = useVehicleActions({
    setGarageVehicle: fleetList.setGarageVehicle,
    setGarageModalOpen: fleetList.setGarageModalOpen,
    setPricingVehicle: fleetList.setPricingVehicle,
    setIsPricingModalOpen: fleetList.setIsPricingModalOpen,
    setEditVehicle,
    setIsEditModalOpen,
    handleStatusAction: fleetList.handleStatusAction,
    handleArchive: async (vid: number) => {
      await fleetList.handleArchive(vid);
      router.push("/dashboard/fleet");
    },
    handleRetire: fleetList.handleRetire,
  });

  const [tab, setTab] = useState<Tab>("overview");
  const [actionsOpen, setActionsOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[var(--color-ink-muted)] gap-2">
        <Loader2 size={20} className="animate-spin" /> Loading vehicle…
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-surface-border)] p-12 text-center">
        <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
        <p className="text-sm font-bold text-[var(--color-ink)] mb-1">Vehicle not found</p>
        <p className="text-xs text-[var(--color-ink-muted)] mb-4">
          {error || "It may have been archived or removed."}
        </p>
        <button
          onClick={() => router.push("/dashboard/fleet")}
          className="text-xs font-bold text-[var(--color-primary)] hover:opacity-80"
        >
          ← Back to Fleet
        </button>
      </div>
    );
  }

  const actions = getVehicleActions(vehicle);

  const openEdit = () => {
    setEditVehicle(vehicle);
    setIsEditModalOpen(true);
  };

  const openPricing = () => {
    fleetList.setPricingVehicle(vehicle);
    fleetList.setIsPricingModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <VehicleHero
        vehicle={vehicle}
        onOpenActions={() => setActionsOpen(true)}
        onUpdateMileage={() => {
          fleetList.setGarageVehicle(vehicle);
          fleetList.setGarageModalOpen(true);
        }}
        onSendToMaintenance={() => fleetList.handleStatusAction(vehicle.id, "maintenance")}
        onEditDetails={openEdit}
      />

      <VehicleStatusStrip vehicle={vehicle} stats={stats} />

      <VehicleCurrentTripBanner
        vehicle={vehicle}
        stats={stats}
        onCreateBooking={() =>
          router.push(`/dashboard/bookings/new?vehicle_id=${vehicle.id}`)
        }
        onUpdateMileage={() => {
          fleetList.setGarageVehicle(vehicle);
          fleetList.setGarageModalOpen(true);
        }}
        onReactivate={() => fleetList.handleStatusAction(vehicle.id, "reactivate")}
      />

      {/* ✅ DESKTOP: PremiumTabSwitcher (unchanged) */}
      <div className="hidden sm:block">
        <PremiumTabSwitcher tabs={TABS} activeTab={tab} onTabChange={(t) => setTab(t as Tab)} />
      </div>

      {/* ✅ MOBILE: Compact segmented tab bar — 3 pills, one tap each */}
      <div className="sm:hidden">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-border)]">
          {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 h-8 rounded-lg text-[11px] font-bold transition-all ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <VehicleSpecsPanel
              vehicle={vehicle}
              stats={stats}
              onOpenDocument={() => setTab("documents")}
              onEditLease={openPricing}
            />
          </div>
          {/* ✅ Desktop-only sidebar — the Lease and Activity content lives
              inside the specs panel tabs on mobile, so we hide the sidebar
              below lg to avoid duplication */}
          <div className="hidden lg:block lg:col-span-1">
            <VehicleLeaseSidebar
              vehicle={vehicle}
              stats={stats}
              onEditLease={openPricing}
            />
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <VehicleBookingsTab bookings={bookings} loading={loading} />
      )}

      {tab === "documents" && (
        <VehicleDocumentsTab vehicle={vehicle} onUploaded={refetch} />
      )}

      {/* Mobile actions sheet */}
      {actionsOpen && (
        <div
          className="md:hidden fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActionsOpen(false)}
        >
          <div
            className="fixed left-0 right-0 bottom-0 z-[9999] bg-[var(--color-surface)] rounded-t-[28px] border-t border-[var(--color-surface-border)] shadow-[0_-20px_60px_rgba(0,0,0,0.3)] pb-[calc(env(safe-area-inset-bottom,16px)+16px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-[var(--color-surface-border)] opacity-60" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-surface-border)]">
              <span className="text-base font-bold text-[var(--color-ink)]">Vehicle Actions</span>
              <button
                onClick={() => setActionsOpen(false)}
                className="text-[11px] font-bold text-[var(--color-ink-muted)]"
              >
                Cancel
              </button>
            </div>
            <div className="p-3 max-h-[60vh] overflow-y-auto">
              {actions.map((a, i) => {
                const Icon = a.icon || Car;
                return (
                  <button
                    key={`${a.label}-${i}`}
                    onClick={() => {
                      setActionsOpen(false);
                      a.onClick(vehicle);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-xl transition-colors ${
                      a.variant === "danger"
                        ? "text-rose-500 hover:bg-rose-500/10"
                        : a.variant === "primary"
                          ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                          : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="truncate">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop actions dropdown */}
      {actionsOpen && (
        <div
          className="hidden md:block fixed inset-0 z-[9990]"
          onClick={() => setActionsOpen(false)}
        >
          <div
            className="fixed top-[calc(50%+40px)] right-1/4 z-[9999] min-w-[200px] bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] p-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {actions.map((a, i) => {
              const Icon = a.icon || Car;
              return (
                <button
                  key={`${a.label}-${i}`}
                  onClick={() => {
                    setActionsOpen(false);
                    a.onClick(vehicle);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    a.variant === "danger"
                      ? "text-rose-500 hover:bg-rose-500/10"
                      : a.variant === "primary"
                        ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                        : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  <span className="truncate">{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <VehicleDetailsModal
        vehicle={editVehicle}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditVehicle(null);
        }}
        onSuccess={refetch}
      />
      <QuickGarageModal
        vehicle={fleetList.garageVehicle}
        open={fleetList.garageModalOpen}
        onClose={() => {
          fleetList.setGarageModalOpen(false);
          fleetList.setGarageVehicle(null);
        }}
        onSave={async (payload) => {
          await fleetList.handleGarageSave(payload);
          refetch();
        }}
      />
      <InvestorVehiclePricingModal
        vehicle={fleetList.pricingVehicle}
        isOpen={fleetList.isPricingModalOpen}
        onClose={() => {
          fleetList.setIsPricingModalOpen(false);
          fleetList.setPricingVehicle(null);
        }}
        onSuccess={refetch}
      />
    </div>
  );
}

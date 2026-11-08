// src/app/dashboard/bookings/[id]/page.tsx
"use client";

import { useBookingProfile } from "@/hooks/bookings/useBookingProfile";
import BookingHeroSection from "@/components/bookings/BookingHeroSection";
import BookingManifestCards from "@/components/bookings/BookingManifestCards";
import TripLogisticsSection from "@/components/bookings/TripLogisticsSection";
import ContractLifecycleSection from "@/components/bookings/ContractLifecycleSection";
import BookingActionBar from "@/components/bookings/BookingActionBar";
import BookingModals from "@/components/bookings/BookingModals";
import ShareContractDrawer from "@/components/bookings/ShareContractDrawer";
import PageHeader from "@/components/ui/PageHeader";
import { Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function BookingProfilePage() {
  const logic = useBookingProfile();
  const { booking, client, vehicle, contract, loading, router } = logic;

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse text-ink-muted">Loading Booking Command Center...</div>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-danger-text font-semibold">Booking not found.</p>
      </div>
    );
  }

  // 3. Main Render
  return (
    <div className="space-y-6 pb-24">
      {/* ── Header ── */}
      <PageHeader
        title={`Booking ${booking.booking_number}`}
        subtitle={client ? `Managed for ${client.full_name}` : "Loading client details..."}
        icon={Calendar}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bookings", href: "/dashboard/bookings" },
          { label: `BK-${booking.id}` },
        ]}
        actions={[
          { label: "Back to List", variant: "ghost", onClick: () => router.push("/dashboard/bookings") }
        ]}
      />

      {/* ── 1. Lifecycle Timeline ── */}
      <BookingHeroSection booking={booking} contract={contract} />

      {/* ── 2. Core Manifest (Client, Vehicle, Financials) ── */}
      <BookingManifestCards
        booking={booking}
        client={client}
        vehicle={vehicle}
        isEditable={booking.status === "pending" || booking.status === "confirmed"}
        onChangeClient={() => logic.setShowClientModal(true)}
        onChangeVehicle={() => logic.setShowVehicleModal(true)}
      />

      {/* ── 3. Grid: Logistics & Contract ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TripLogisticsSection
          booking={booking}
          isEditable={booking.status !== "completed" && booking.status !== "cancelled"}
          tripDates={logic.tripDates}
          setTripDates={logic.setTripDates}
          destination={logic.destination}
          setDestination={logic.setDestination}
          onSave={logic.handleSaveTripChanges}
          isSaving={logic.isActionLoading}
        />
        <ContractLifecycleSection
          contract={contract}
          onCopyLink={logic.handleCopyContractLink}
          onShare={() => logic.setShowContractDrawer(true)}
        />
      </div>

      {/* ── 4. Sticky Action Bar (Wired to Quotation & Mileage flows) ── */}
      <BookingActionBar
        status={booking.status}
        isActionLoading={logic.isActionLoading}
        isTripEnded={logic.isTripEnded}
        onConfirm={() => logic.setConfirmAction("confirm")}
        onActivate={() => logic.setConfirmAction("activate")}
        onCancel={() => logic.setConfirmAction("cancel")}
        onShareInvoice={() => logic.setShowShareModal(true)}
        onStageEndTrip={logic.handleStageEndTrip}
        onOpenMileageModal={logic.handleOpenMileageModal}
        onGenerateQuotation={logic.handleGenerateQuotation}
      />

      {/* ── 5. Modals & Drawers ── */}
      <BookingModals
        booking={booking}
        client={client!}
        
        // Client & Vehicle Modals
        showClientModal={logic.showClientModal}
        showVehicleModal={logic.showVehicleModal}
        availableClients={logic.availableClients}
        availableVehicles={logic.availableVehicles}
        onChangeClient={logic.handleChangeClient}
        onChangeVehicle={logic.handleChangeVehicle}
        onCloseClientModal={() => logic.setShowClientModal(false)}
        onCloseVehicleModal={() => logic.setShowVehicleModal(false)}

        // Share Invoice Modal
        showShareModal={logic.showShareModal}
        shareMethod={logic.shareMethod}
        onSetShareMethod={logic.setShareMethod}
        onSendInvoice={logic.handleSendInvoice}
        onCloseShareModal={() => logic.setShowShareModal(false)}

        // Confirm Status Dialog
        showConfirmDialog={!!logic.confirmAction}
        confirmAction={logic.confirmAction}
        onConfirmAction={logic.handleStatusTransition}
        onCloseConfirm={() => logic.setConfirmAction(null)}
        isActionLoading={logic.isActionLoading}

        // Final Mileage Modal (2-Step Completion)
        showMileageModal={logic.showMileageModal}
        finalMileage={logic.finalMileage}
        setFinalMileage={logic.setFinalMileage}
        currentVehicleMileage={vehicle?.current_mileage || 0}
        onSaveFinalMileage={logic.handleSaveFinalMileage}
        onCloseMileageModal={() => logic.setShowMileageModal(false)}

        // Quotation Share Modal
        showQuotationModal={logic.showQuotationModal}
        quotationUrl={logic.quotationUrl}
        onCopyQuotationLink={logic.handleCopyQuotationLink}
        onCloseQuotationModal={() => logic.setShowQuotationModal(false)}
      />

      {client && (
        <ShareContractDrawer
          isOpen={logic.showContractDrawer}
          onClose={() => logic.setShowContractDrawer(false)}
          client={client}
          onShare={(method) => {
            toast.success(`Contract sent via ${method}`);
            logic.setShowContractDrawer(false);
          }}
        />
      )}
    </div>
  );
}

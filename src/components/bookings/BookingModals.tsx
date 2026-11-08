// src/components/bookings/BookingModals.tsx
"use client";

import { Mail, MessageCircle, Gauge, Loader2, Copy } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Select from "@/components/forms/Select";
import FormGroup from "@/components/forms/FormGroup";
import type { Client, Vehicle, Booking } from "@/lib/types";
import type { ConfirmActionType } from "@/hooks/bookings/useBookingProfile";

interface BookingModalsProps {
  booking: Booking;
  client: Client;
  
  // Client & Vehicle Modals
  showClientModal: boolean;
  showVehicleModal: boolean;
  availableClients: Client[];
  availableVehicles: Vehicle[];
  onChangeClient: (id: number) => void;
  onChangeVehicle: (id: number) => void;
  onCloseClientModal: () => void;
  onCloseVehicleModal: () => void;

  // Share Invoice Modal
  showShareModal: boolean;
  shareMethod: "email" | "whatsapp" | "";
  onSetShareMethod: (method: "email" | "whatsapp" | "") => void;
  onSendInvoice: () => void;
  onCloseShareModal: () => void;

  // Confirm Status Dialog
  showConfirmDialog: boolean;
  confirmAction: ConfirmActionType;
  onConfirmAction: () => void;
  onCloseConfirm: () => void;
  isActionLoading: boolean;

  // Final Mileage Modal (NEW)
  showMileageModal: boolean;
  finalMileage: number;
  setFinalMileage: (val: number) => void;
  currentVehicleMileage: number;
  onSaveFinalMileage: () => void;
  onCloseMileageModal: () => void;

  // Quotation Share Modal
  showQuotationModal: boolean;
  quotationUrl: string | null;
  onCopyQuotationLink: () => void;
  onCloseQuotationModal: () => void;
}

export default function BookingModals({
  booking, client,
  showClientModal, showVehicleModal, availableClients, availableVehicles,
  onChangeClient, onChangeVehicle, onCloseClientModal, onCloseVehicleModal,
  showShareModal, shareMethod, onSetShareMethod, onSendInvoice, onCloseShareModal,
  showConfirmDialog, confirmAction, onConfirmAction, onCloseConfirm, isActionLoading,
  showMileageModal, finalMileage, setFinalMileage, currentVehicleMileage,
  onSaveFinalMileage, onCloseMileageModal,
  showQuotationModal, quotationUrl, onCopyQuotationLink, onCloseQuotationModal
}: BookingModalsProps) {

  // Map the confirm action to dialog details
  const getConfirmDetails = () => {
    if (confirmAction === "confirm") return { title: "Confirm Booking?", message: "This will lock in the dates, generate the contract, and notify the client.", variant: "info" as const };
    if (confirmAction === "activate") return { title: "Start Trip?", message: "This will mark the vehicle as rented and officially start the trip.", variant: "warning" as const };
    if (confirmAction === "cancel") return { title: "Cancel Booking?", message: "This will cancel the trip, free up the vehicle, and void pending invoices.", variant: "danger" as const };
    return { title: "Confirm Action?", message: "Are you sure?", variant: "info" as const };
  };

  const confirmDetails = getConfirmDetails();

  return (
    <>
      {/* ── 1. CHANGE CLIENT MODAL ── */}
      <Modal open={showClientModal} onClose={onCloseClientModal} title="Change Client" subtitle="Reassign this booking to a different client" size="sm">
        <FormGroup label="Select Client">
          <Select
            value={booking.client_id.toString()}
            onChange={(e) => onChangeClient(parseInt(e.target.value))}
            options={availableClients.map((c) => ({ value: c.id.toString(), label: `${c.full_name} (${c.phone})` }))}
          />
        </FormGroup>
      </Modal>

      {/* ── 2. CHANGE VEHICLE MODAL ── */}
      <Modal open={showVehicleModal} onClose={onCloseVehicleModal} title="Change Vehicle" subtitle="Assign a different available vehicle" size="sm">
        <FormGroup label="Select Vehicle">
          <Select 
            value={booking.vehicle_id.toString()} 
            onChange={(e) => onChangeVehicle(parseInt(e.target.value))} 
            options={availableVehicles.map((v) => ({ value: v.id.toString(), label: `${v.make} ${v.model} (${v.plate_number})` }))} 
          />
        </FormGroup>
      </Modal>

      {/* ── 3. SHARE INVOICE MODAL ── */}
      <Modal open={showShareModal} onClose={onCloseShareModal} title="Share Invoice" subtitle="Choose how to send the invoice" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Send invoice to <span className="font-semibold text-ink">{client?.full_name || "Client"}</span> via:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onSetShareMethod("email")} 
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                shareMethod === "email" 
                  ? "border-accent-dark bg-accent-bg text-accent-dark" 
                  : "border-surface-border bg-surface-card text-ink-muted hover:border-surface-border-strong"
              }`}
            >
              <Mail size={24} />
              <span className="text-xs font-bold uppercase tracking-wide">Email</span>
            </button>
            <button 
              onClick={() => onSetShareMethod("whatsapp")} 
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                shareMethod === "whatsapp" 
                  ? "border-success bg-success-bg text-success-text" 
                  : "border-surface-border bg-surface-card text-ink-muted hover:border-surface-border-strong"
              }`}
            >
              <MessageCircle size={24} />
              <span className="text-xs font-bold uppercase tracking-wide">WhatsApp</span>
            </button>
          </div>
          <button 
            onClick={onSendInvoice} 
            disabled={!shareMethod} 
            className="w-full py-2.5 bg-accent-dark text-white text-sm font-bold rounded-lg hover:bg-accent-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Invoice
          </button>
        </div>
      </Modal>

      {/* ── 4. CONFIRM STATUS TRANSITION DIALOG ── */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={onCloseConfirm}
        onConfirm={onConfirmAction}
        title={confirmDetails.title}
        message={confirmDetails.message}
        variant={confirmDetails.variant}
        confirmLabel={isActionLoading ? "Processing..." : "Yes, Proceed"}
        loading={isActionLoading}
      />

      {/* ── 5. FINAL MILEAGE MODAL (The 2-Step Completion) ── */}
      <Modal 
        open={showMileageModal} 
        onClose={onCloseMileageModal} 
        title="Complete Trip & Update Mileage" 
        subtitle="Record the final odometer reading to officially close this booking." 
        size="sm"
      >
        <div className="space-y-5">
          {/* Current Mileage Context */}
          <div className="p-4 rounded-xl bg-surface-hover border border-surface-border">
            <p className="text-[10px] uppercase text-ink-subtle font-bold tracking-wider">Odometer at Trip Start / Last Update</p>
            <p className="text-2xl font-bold text-ink mt-1">
              {currentVehicleMileage.toLocaleString()} <span className="text-sm font-medium text-ink-muted">km</span>
            </p>
          </div>

          {/* New Mileage Input */}
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">Final Odometer Reading (km) *</label>
            <div className="relative">
              <Gauge size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
              <input
                type="number"
                value={finalMileage}
                onChange={(e) => setFinalMileage(parseInt(e.target.value) || 0)}
                min={currentVehicleMileage}
                className="input pl-10 text-lg font-bold"
                placeholder="e.g., 45500"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-ink-subtle mt-1.5">
              Distance driven: <span className="font-bold text-ink">{Math.max(0, finalMileage - currentVehicleMileage).toLocaleString()} km</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={onCloseMileageModal} 
              className="flex-1 py-2.5 text-sm font-bold text-ink-muted bg-surface-hover rounded-lg hover:bg-surface-border transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onSaveFinalMileage} 
              disabled={isActionLoading || finalMileage < currentVehicleMileage}
              className="flex-1 py-2.5 text-sm font-bold text-white bg-success rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isActionLoading ? <Loader2 size={14} className="animate-spin" /> : "Finalize & Complete"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showQuotationModal}
        onClose={onCloseQuotationModal}
        title="Quotation Link"
        subtitle="Share this link with your client to review the quotation."
        size="sm"
      >
        <div className="space-y-4">
          <div className="break-all rounded-lg border border-surface-border bg-surface-hover p-3 text-sm text-ink">
            {quotationUrl || "Preparing quotation link..."}
          </div>
          <button
            type="button"
            onClick={onCopyQuotationLink}
            disabled={!quotationUrl}
            className="btn btn-primary w-full"
          >
            <Copy size={16} />
            Copy link
          </button>
        </div>
      </Modal>
    </>
  );
}

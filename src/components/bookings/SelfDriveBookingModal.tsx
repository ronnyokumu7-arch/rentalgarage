// src/components/modals/SelfDriveBookingModal.tsx
"use client";

import { CheckCircle } from "@phosphor-icons/react/ssr";
import BookingForm from "./BookingForm";
import Modal from "@/components/ui/Modal";

interface SelfDriveBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SelfDriveBookingModal({ isOpen, onClose }: SelfDriveBookingModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="New Booking"
      subtitle="Create a new rental reservation"
      size="xl"
      bodyClassName="p-4 sm:p-6 bg-[var(--color-bg)]"
      footer={
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 sm:py-5 bg-[var(--color-surface)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="selfdrive-booking-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40 transition-all active:scale-[0.98]"
          >
            <CheckCircle size={16} aria-hidden="true" />
            Create Booking
          </button>
        </div>
      }
    >
      <BookingForm formId="selfdrive-booking-form" onClose={onClose} />
    </Modal>
  );
}

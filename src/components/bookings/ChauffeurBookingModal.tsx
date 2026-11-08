"use client";

import { CheckCircle } from "@phosphor-icons/react/ssr";
import ChauffeurForm from "./ChauffeurForm";
import Modal from "@/components/ui/Modal";

interface ChauffeurBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChauffeurBookingModal({ isOpen, onClose }: ChauffeurBookingModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="New Booking"
      size="xl"
      bodyClassName="p-3 sm:p-6"
      footer={
        <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-[var(--color-bg)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="chauffeur-booking-form"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 transition-all active:scale-[0.98]"
          >
            <CheckCircle size={16} aria-hidden="true" />
            Create Booking
          </button>
        </div>
      }
    >
      <ChauffeurForm onClose={onClose} />
    </Modal>
  );
}

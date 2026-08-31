"use client";

import Modal from "@/components/ui/Modal";
import AirportTransferForm from "./AirportTransferForm";

interface AirportTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AirportTransferModal({ isOpen, onClose }: AirportTransferModalProps) {
  return (
    <Modal 
      open={isOpen} 
      onClose={onClose} 
      title="New Airport Transfer Booking" 
      size="xl" // ✅ Gives the 2-column form plenty of breathing room on desktop
    >
      {/* Pass formId so the Modal's footer button can trigger submission */}
      <AirportTransferForm onClose={onClose} />
    </Modal>
  );
}

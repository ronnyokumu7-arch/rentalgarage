"use client";

import Modal from "@/components/ui/Modal";
import AddClientWorkspace from "./AddClientWorkspace";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddClientModal({ isOpen, onClose }: AddClientModalProps) {
  return (
    <Modal 
      open={isOpen} 
      onClose={onClose} 
      title="New Client" 
      subtitle="Invite new clients or add them manually"
      size="xl"
    >
      <AddClientWorkspace onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}

// src/components/client/AddClientButton.tsx
"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import AddClientModal from "./AddClientModal";

export default function AddClientButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
      >
        <UserPlus size={14} strokeWidth={2.5} />
        Add Client
      </button>

      <AddClientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

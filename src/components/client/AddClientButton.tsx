"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import AddClientModal from "./AddClientModal";

export default function AddClientButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* 📱 MOBILE: Button that opens the modal */}
      <button
        onClick={() => setModalOpen(true)}
        className="md:hidden h-10 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] shrink-0"
      >
        <UserPlus size={16} strokeWidth={2.5} />
        Add Client
      </button>

      {/* 💻 DESKTOP: Link to the dedicated full page */}
      <Link
        href="/dashboard/clients/new"
        className="hidden md:flex h-10 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] shrink-0"
      >
        <UserPlus size={16} strokeWidth={2.5} />
        Add Client
      </Link>

      <AddClientModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

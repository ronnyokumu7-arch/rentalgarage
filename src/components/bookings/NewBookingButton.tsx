// src/components/bookings/NewBookingButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  CalendarPlus, Plane, Users, ChevronDown, Plus, X,
} from "lucide-react";

import SelfDriveBookingModal from "./SelfDriveBookingModal";
import AirportTransferModal from "./AirportTransferModal";
import ChauffeurBookingModal from "./ChauffeurBookingModal";

type BookingType = "selfdrive" | "airport" | "chauffeur";

interface BookingOption {
  id: BookingType;
  label: string;
  description: string;
  icon: React.ElementType;
  bg: string;
  iconColor: string;
}

const BOOKING_OPTIONS: BookingOption[] = [
  {
    id: "selfdrive",
    label: "Self-Drive",
    description: "Client drives themselves",
    icon: Users,
    bg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: "airport",
    label: "Airport Transfer",
    description: "Pickup or drop-off service",
    icon: Plane,
    bg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    id: "chauffeur",
    label: "Chauffeur Service",
    description: "Weddings & corporate transport",
    icon: Users,
    bg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
];

/* ──────────────────────────────────────────────────────────────────────
   Shared modal host
────────────────────────────────────────────────────────────────────── */

function BookingModals({
  activeModal,
  onClose,
}: {
  activeModal: BookingType | null;
  onClose: () => void;
}) {
  return (
    <>
      <SelfDriveBookingModal
        isOpen={activeModal === "selfdrive"}
        onClose={onClose}
      />
      <AirportTransferModal
        isOpen={activeModal === "airport"}
        onClose={onClose}
      />
      <ChauffeurBookingModal
        isOpen={activeModal === "chauffeur"}
        onClose={onClose}
      />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Desktop button
────────────────────────────────────────────────────────────────────── */

export function NewBookingButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<BookingType | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (type: BookingType) => {
    setMenuOpen(false);
    setActiveModal(type);
  };

  return (
    <div className="relative w-full md:w-auto" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-full md:w-auto h-10 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] shrink-0"
      >
        <CalendarPlus size={16} strokeWidth={2.5} />
        New Booking
        <ChevronDown
          size={16}
          className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-full md:w-64 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-lg z-40 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
          {BOOKING_OPTIONS.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <div key={opt.id}>
                {idx > 0 && (
                  <div className="border-t border-[var(--color-surface-border)]" />
                )}
                <button
                  onClick={() => handleSelect(opt.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${opt.bg} ${opt.iconColor} flex items-center justify-center`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm">{opt.label}</div>
                    <div className="text-[10px] text-[var(--color-ink-muted)] font-normal">
                      {opt.description}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <BookingModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Mobile FAB
────────────────────────────────────────────────────────────────────── */

export function NewBookingFab() {
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<BookingType | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleSelect = (type: BookingType) => {
    setOpen(false);
    setActiveModal(type);
  };

  return (
    <>
      <div
        ref={wrapRef}
        className="fixed right-4 bottom-[108px] z-[65] flex flex-col items-end gap-3"
      >
        {/* Options popover */}
        {open && (
          <div className="flex flex-col gap-2 min-w-[220px] animate-in slide-in-from-bottom-2 fade-in duration-200">
            {BOOKING_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)]/95 backdrop-blur-xl border border-[var(--color-surface-border)] shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:bg-[var(--color-surface-hover)] active:scale-95 transition-all text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${opt.bg} ${opt.iconColor} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-ink)] truncate">
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] truncate">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* FAB */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close booking options" : "New Booking"}
          aria-expanded={open}
          className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/20 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 hover:bg-[var(--color-primary)]/30 transition-all"
        >
          <div className="relative flex items-center justify-center">
            {open ? (
              <X size={22} strokeWidth={2.5} className="text-[var(--color-primary)]" />
            ) : (
              <>
                <CalendarPlus
                  size={22}
                  strokeWidth={2.5}
                  className="text-[var(--color-primary)]"
                />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-sm">
                  <Plus size={9} strokeWidth={3.5} />
                </span>
              </>
            )}
          </div>
        </button>
      </div>

      <BookingModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}

export default NewBookingButton;

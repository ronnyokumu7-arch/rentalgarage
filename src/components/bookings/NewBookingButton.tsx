"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarPlus, Plane, Users, ChevronDown } from "lucide-react";

// Import modals
import SelfDriveBookingModal from "./SelfDriveBookingModal";
import AirportTransferModal from "./AirportTransferModal";
import ChauffeurBookingModal from "./ChauffeurBookingModal";

export default function NewBookingButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"selfdrive" | "airport" | "chauffeur" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelfDrive = () => {
    setMenuOpen(false);
    setActiveModal("selfdrive");
  };

  const handleAirportTransfer = () => {
    setMenuOpen(false);
    setActiveModal("airport");
  };

  const handleChauffeur = () => {
    setMenuOpen(false);
    setActiveModal("chauffeur");
  };

  return (
    <div className="relative w-full sm:w-auto" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-full sm:w-auto h-9 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
      >
        <CalendarPlus size={14} strokeWidth={2.5} />
        New Booking
        <ChevronDown size={14} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-full sm:w-64 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-lg z-40 animate-in fade-in zoom-in-95 duration-150">
          {/* Self-Drive Option */}
          <button
            onClick={handleSelfDrive}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors first:rounded-t-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm">Self-Drive</div>
              <div className="text-[10px] text-[var(--color-ink-muted)] font-normal">
                Client drives themselves
              </div>
            </div>
          </button>
          
          <div className="border-t border-[var(--color-surface-border)]" />
          
          {/* Airport Transfer Option */}
          <button
            onClick={handleAirportTransfer}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Plane size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm">Airport Transfer</div>
              <div className="text-[10px] text-[var(--color-ink-muted)] font-normal">
                Pickup or drop-off service
              </div>
            </div>
          </button>
          
          <div className="border-t border-[var(--color-surface-border)]" />
          
          {/* Chauffeur Option */}
          <button
            onClick={handleChauffeur}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors last:rounded-b-xl"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm">Chauffeur Service</div>
              <div className="text-[10px] text-[var(--color-ink-muted)] font-normal">
                Weddings & corporate transport
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Modals */}
      <SelfDriveBookingModal 
        isOpen={activeModal === "selfdrive"} 
        onClose={() => setActiveModal(null)} 
      />
      <AirportTransferModal 
        isOpen={activeModal === "airport"} 
        onClose={() => setActiveModal(null)} 
      />
      <ChauffeurBookingModal 
        isOpen={activeModal === "chauffeur"} 
        onClose={() => setActiveModal(null)} 
      />
    </div>
  );
}

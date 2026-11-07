"use client";

import { useState, useRef, useEffect } from "react";
import {
  PencilSimple as Pencil, X, Play, UserMinus as UserX,
  CircleNotch as Loader2, FloppyDisk as Save, DotsThreeVertical as MoreVertical, Phone,
  Car, Gauge, Link, ArrowUpRight
} from "@phosphor-icons/react/ssr";
import type { Booking, Client, Vehicle, Contract } from "@/lib/types";

interface BookingHeroProps {
  booking: Booking;
  client: Client | null;
  vehicle: Vehicle | null;
  isEditing: boolean;
  isSaving: boolean;
  isActionLoading: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onAction: (action: "confirm" | "activate" | "complete" | "cancel" | "no_show") => void;
  onSendInvoice: () => void;
  onSendContract: () => void;
  contract?: Contract | null;
}

export default function BookingHero({
  booking, client, vehicle,
  isEditing, isSaving, isActionLoading,
  onEdit, onCancelEdit, onSave, onAction,
  onSendInvoice, onSendContract, contract
}: BookingHeroProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = client?.full_name 
    ? client.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : "??";

  return (
    <div className="p-3.5 sm:p-6 border-b border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]/20">
      <div className="flex items-start justify-between gap-2.5 sm:gap-6">
        
        {/* LEFT: Identity & Context */}
        <div className="flex items-start gap-2.5 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm sm:text-xl ring-2 sm:ring-4 ring-[var(--color-surface)] shadow-xs shrink-0">
            {initials}
          </div>
          
          <div className="space-y-1 sm:space-y-2 min-w-0 pt-0.5 sm:pt-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[var(--color-ink)] truncate">
                {client?.full_name || "Unknown Client"}
              </h2>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] text-[8px] sm:text-[10px] font-mono font-bold border border-[var(--color-surface-border)] shrink-0">
                #{booking.booking_number}
              </span>
            </div>
            
            <div className="flex flex-col gap-0.5 sm:gap-1 text-[11px] sm:text-xs text-[var(--color-ink-muted)] min-w-0">
              <span className="flex items-center gap-1.5 truncate">
                <Phone size={12} className="text-[var(--color-ink-subtle)] shrink-0" aria-hidden="true" />
                <span className="truncate">{client?.phone || "No phone provided"}</span>
              </span>
              
              {vehicle && (
                <div className="flex flex-col gap-0.5 mt-0.5 pl-0.5 min-w-0">
                  <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                    <span className="flex items-center gap-1.5 truncate">
                      <Car size={12} className="text-[var(--color-ink-subtle)] shrink-0" aria-hidden="true" />
                      <span className="truncate">{vehicle.make} {vehicle.model}</span>
                    </span>
                    <span className="font-mono text-[var(--color-ink-subtle)] shrink-0">
                      {vehicle.plate_number}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <Gauge size={12} className="text-[var(--color-ink-subtle)] shrink-0" aria-hidden="true" />
                    <span className="truncate">{vehicle.current_mileage.toLocaleString()} km</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Actions & Menu */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {isEditing ? (
            <>
              <button 
                onClick={onCancelEdit} 
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                title="Cancel Editing"
              >
                <X size={16} aria-hidden="true" />
              </button>
              <button 
                onClick={onSave} 
                disabled={isSaving} 
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50 shadow-xs active:scale-95"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onEdit} 
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
                title="Edit Details"
              >
                <Pencil size={16} aria-hidden="true" />
              </button>
              
              {booking.status === "confirmed" && (
                <button 
                  onClick={() => onAction("activate")} 
                  disabled={isActionLoading} 
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 transition-colors disabled:opacity-50"
                  title="Activate Booking"
                >
                  {isActionLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                </button>
              )}
              {booking.status === "active" && (
                <button 
                  onClick={() => onAction("complete")} 
                  disabled={isActionLoading} 
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/5 transition-colors disabled:opacity-50"
                  title="Complete Booking"
                >
                  {isActionLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                </button>
              )}
              
              {/* 3-DOTS ACTION MENU */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  title="More Options"
                >
                  <MoreVertical size={16} aria-hidden="true" />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 rounded-xl sm:rounded-2xl bg-[var(--color-surface)] border border-[var(--color-surface-border)] shadow-[var(--shadow-card)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1 sm:py-1.5">
                      
                      {/* Cancel Booking */}
                      {(booking.status === "confirmed" || booking.status === "pending") && (
                        <button 
                          onClick={() => { onAction("cancel"); setIsMenuOpen(false); }} 
                          className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/5 transition-colors"
                        >
                          <X size={14} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">Cancel Booking</span>
                        </button>
                      )}
                      
                      {/* Mark as No-Show */}
                      {booking.status === "confirmed" && (
                        <button 
                          onClick={() => { onAction("no_show"); setIsMenuOpen(false); }} 
                          className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500/5 transition-colors"
                        >
                          <UserX size={14} className="shrink-0" aria-hidden="true" />
                          <span className="truncate">Mark as No-Show</span>
                        </button>
                      )}
                      
                      <div className="border-t border-[var(--color-surface-border)] my-1 sm:my-1.5" />
                      
                      {/* Share Contract Link */}
                      {contract && (
                        <button 
                          onClick={() => { onSendContract(); setIsMenuOpen(false); }} 
                          className="w-full flex items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors group"
                        >
                          <span className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <Link size={14} className="shrink-0" aria-hidden="true" />
                            <span className="truncate">Share Contract</span>
                          </span>
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
                        </button>
                      )}
                      
                      {/* Send Invoice */}
                      {booking.invoices && booking.invoices.length > 0 && (
                        <button 
                          onClick={() => { onSendInvoice(); setIsMenuOpen(false); }} 
                          className="w-full flex items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/5 transition-colors group"
                        >
                          <span className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <Link size={14} className="shrink-0" aria-hidden="true" />
                            <span className="truncate">Copy Invoice Link</span>
                          </span>
                          <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

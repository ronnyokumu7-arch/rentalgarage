// src/components/financials/contracts/GenerateContractModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, FileText, AlertCircle, Link2, CheckCircle2, RotateCcw, CalendarDays, FileSignature, User, Car } from "lucide-react";
import Modal from "@/components/ui/Modal";
import PremiumEntitySelector from "@/components/financials/shared/PremiumEntitySelector";
import { bookingsApi } from "@/lib/api/bookings";
import { contractsApi } from "@/lib/api/contracts";
import type { Booking, Contract } from "@/lib/types";
import toast from "react-hot-toast";

interface GenerateContractModalProps {
  open: boolean;
  onClose: () => void;
  onGenerated: () => void;
}

export default function GenerateContractModal({ open, onClose, onGenerated }: GenerateContractModalProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch contracts when modal opens (for lookup)
  useEffect(() => {
    if (open) {
      contractsApi.list().then(setContracts).catch(() => toast.error("Failed to load contracts"));
    }
  }, [open]);

  // ✅ Fetch eligible bookings (pending/confirmed OR has void contract)
  const fetchEligibleBookings = async () => {
    const [bData, cData] = await Promise.all([
      bookingsApi.list(),
      contractsApi.list()
    ]);
    
    const contractMap = new Map(cData.map((c: any) => [c.booking_id, c]));

    return bData.filter((b: any) => {
      const contract = contractMap.get(b.id);
      if (contract) {
        // ✅ Allow void contracts to be regenerated (excludes only signed)
        return contract.status !== "signed";
      }
      return b.status === "pending" || b.status === "confirmed";
    });
  };

  const existingContract = selectedBooking
    ? contracts.find((c: any) => c.booking_id === selectedBooking.id)
    : null;
  const isVoidContract = existingContract?.status === "void";

  const handleGenerateOrCopy = async () => {
    if (!selectedBooking) return;
    setLoading(true);
    
    try {
      if (existingContract) {
        if (isVoidContract) {
          // ✅ Regenerate void contract (deletes old, creates new draft)
          toast.loading("Regenerating contract...", { duration: 1000 });
          await contractsApi.regenerate(selectedBooking.id);
          toast.dismiss();
          toast.success("Contract regenerated successfully!");
        } else {
          // Copy share link for active contracts
          toast.loading("Generating share link...", { duration: 1000 });
          const res = await contractsApi.generateShareLink(existingContract.id);
          
          const fullUrl = res.share_url && res.share_url.startsWith("http")
            ? res.share_url
            : `${window.location.origin}/contracts/view/${res.share_token}`;

          await navigator.clipboard.writeText(fullUrl);
          toast.dismiss();
          toast.success("Contract link copied to clipboard!");
        }
        onGenerated();
        handleClose();
      } else {
        // Generate new contract for orphan bookings
        toast.loading("Generating contract...", { duration: 1000 });
        await contractsApi.generateForBooking(selectedBooking.id);
        toast.dismiss();
        toast.success("Contract generated successfully!");
        onGenerated();
        handleClose();
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.detail || "Failed to process contract");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedBooking(null);
    onClose();
  };

  // ✅ Render premium booking card for the selector (Uses enriched fields)
  const renderBookingCard = (booking: any) => {
    const contract = contracts.find((c: any) => c.booking_id === booking.id);
    const statusLabel = contract ? `Contract: ${contract.status}` : `Booking: ${booking.status}`;
    const statusStyle = 
      contract?.status === "signed" ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)]" :
      contract?.status === "void" ? "bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]" :
      contract?.status === "sent" ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-text)]" :
      "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]";
    const clientName = booking.client_name || booking.client?.full_name || "Unknown Client";
    const vehiclePlate = booking.vehicle_plate || booking.vehicle?.plate_number || "N/A";

    return (
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
          <FileSignature size={16} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[var(--color-ink)] truncate">
              {booking.booking_number || `Booking #${booking.id}`}
            </p>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[var(--color-ink-muted)] flex items-center gap-1">
              <User size={10} />
              {clientName}
            </span>
            <span className="text-[10px] text-[var(--color-ink-subtle)]">•</span>
            <span className="text-[10px] font-mono text-[var(--color-ink-muted)] flex items-center gap-1">
              <Car size={10} />
              {vehiclePlate}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[var(--color-ink-muted)] flex items-center gap-1">
              <CalendarDays size={10} />
              {new Date(booking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} → {new Date(booking.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="text-[10px] text-[var(--color-ink-subtle)]">•</span>
            <span className="text-[10px] font-bold text-[var(--color-primary)]">
              {booking.currency_code} {Number(booking.total_amount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={handleClose} title="Contract Management" subtitle="Generate contract or copy share link" size="md">
      <div className="space-y-6">
        
        {/* ✅ Premium Entity Selector for Bookings */}
        <PremiumEntitySelector
          fetcher={fetchEligibleBookings}
          searchKeys={["booking_number", "client_name", "id"]}
          placeholder="Select a booking..."
          emptyMessage="No eligible bookings. Ensure bookings are Pending/Confirmed or have a Draft/Void contract."
          renderEntityCard={renderBookingCard}
          selectedId={selectedBooking?.id || null}
          onSelect={() => {
            // ✅ FIXED: Removed unused 'id' parameter
            setSelectedBooking((prev) => prev);
          }}
          onSelectEntity={(booking) => {
            setSelectedBooking(booking as Booking);
          }}
          label="Select Booking"
          required
        />

        {selectedBooking && (
          <div className="p-5 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)]">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-[var(--color-primary)]" />
              <span className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider">Booking Details</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Booking ID</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">{selectedBooking.booking_number || `#${selectedBooking.id}`}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Status</p>
                <p className="text-sm font-bold text-[var(--color-ink)] capitalize">{selectedBooking.status}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Start Date</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {new Date(selectedBooking.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">End Date</p>
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  {new Date(selectedBooking.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
            
            {existingContract && (
              <div className={`mt-4 p-4 rounded-xl border ${
                isVoidContract 
                  ? "bg-[var(--color-danger-bg)]/30 border-[var(--color-danger-bg)]" 
                  : "bg-[var(--color-success-bg)]/30 border-[var(--color-success-bg)]"
              }`}>
                <div className="flex items-center gap-2">
                  {isVoidContract ? (
                    <AlertCircle size={16} className="text-[var(--color-danger-text)]" />
                  ) : (
                    <CheckCircle2 size={16} className="text-[var(--color-success-text)]" />
                  )}
                  <span className={`text-xs font-bold ${
                    isVoidContract ? "text-[var(--color-danger-text)]" : "text-[var(--color-success-text)]"
                  }`}>
                    Contract exists ({existingContract.status})
                  </span>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                  {isVoidContract 
                    ? "Clicking the button will regenerate a new contract for this booking."
                    : "Clicking the button will copy the share link to your clipboard."
                  }
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-surface-border)]">
          <button 
            type="button" 
            onClick={handleClose} 
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerateOrCopy} 
            disabled={loading || !selectedBooking} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isVoidContract ? (
              <RotateCcw size={14} />
            ) : existingContract ? (
              <Link2 size={14} />
            ) : (
              <FileText size={14} />
            )}
            {loading 
              ? "Processing..." 
              : isVoidContract
                ? "Regenerate Contract"
                : existingContract 
                  ? "Copy Contract Link" 
                  : "Generate Contract"
            }
          </button>
        </div>
      </div>
    </Modal>
  );
}

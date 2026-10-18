// src/components/dashboard/features/ReturningTodayTabContent.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Car, Clock, Loader2, MoreVertical,
  CheckCircle2, XCircle, Eye, User, ArrowRight
} from "lucide-react";
import { useReturningTodayTab } from "@/hooks/dashboard/features/useReturningTodayTab";
import { bookingsApi } from "@/lib/api/bookings";
import BookingActionsSheet, { SheetAction } from "./BookingActionsSheet";

const resolveField = (value: unknown, ...objectKeys: string[]): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    for (const key of objectKeys) {
      const v = obj[key];
      if (v !== undefined && v !== null) return String(v);
    }
    if (obj["full_name"]) return String(obj["full_name"]);
    if (obj["name"]) return String(obj["name"]);
  }
  return String(value);
};

const formatPlate = (plate: string | null) => {
  if (!plate) return "—";
  return plate.replace(/([A-Za-z])(\d)/, "$1 $2").toUpperCase();
};

const returnRelative = (dateStr: string, isOverdue: boolean): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr).getTime();
  if (Number.isNaN(d)) return "";
  const diff = d - Date.now();
  const abs = Math.abs(diff);
  const hours = Math.floor(abs / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  
  let core: string;
  if (hours === 0) core = `${minutes}m`;
  else if (hours < 24) core = minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  else core = `${Math.floor(hours / 24)}d`;
  
  return isOverdue ? `${core} overdue` : `in ${core}`;
};

export default function ReturningTodayTabContent() {
  const router = useRouter();
  const { returns, loading, isOverdue, refetch } = useReturningTodayTab();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-[var(--color-ink-muted)]">
        <Loader2 size={24} className="animate-spin mb-3 text-[var(--color-primary)]" />
        <p className="text-sm font-medium">Loading returns...</p>
      </div>
    );
  }

  if (returns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
          <CheckCircle2 size={24} />
        </div>
        <p className="text-sm font-bold text-[var(--color-ink)]">No vehicles returning</p>
        <p className="text-xs text-[var(--color-ink-muted)] mt-1">
          Active trips ending within 24 hours will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-in fade-in duration-200">
      {returns.map((booking) => {
        const overdue = isOverdue(booking);
        const vehicle = booking.vehicle;
        const plate = vehicle?.plate_number ?? null;
        const vehicleLabel = vehicle ? `${vehicle.make} ${vehicle.model}` : "Vehicle";
        const clientName = resolveField(booking.client, "full_name", "name") || "Customer";
        const returnAt = booking.scheduled_return_at ?? booking.end_date;
        
        // Extract initials for the client sub-badge
        const clientInitials = clientName.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() || "?";

        return (
          <div
            key={`returning-${booking.id}`}
            className={`group relative rounded-xl overflow-hidden border bg-[var(--color-surface)] hover:shadow-sm transition-all duration-200 ${
              overdue ? "border-rose-500/40 hover:border-rose-500/70" : "border-[var(--color-surface-border)] hover:border-[var(--color-primary)]/40"
            }`}
          >
            <div className="p-3.5">
              {/* Row 1: Vehicle Identity + Menu */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Car Icon */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ring-2 ring-[var(--color-surface)] ${
                      overdue ? "bg-rose-500/10 text-rose-500" : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    }`}>
                      <Car size={18} />
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-[var(--color-ink)] truncate">{vehicleLabel}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono font-semibold text-[var(--color-ink-muted)]">
                        {formatPlate(plate)}
                      </span>
                      <span className="text-[8px] text-[var(--color-ink-subtle)]">•</span>
                      <span className="text-[10px] font-medium text-[var(--color-ink-muted)] truncate flex items-center gap-1">
                        <User size={10} className="text-[var(--color-ink-subtle)]" />
                        {clientName} ({clientInitials})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative flex-shrink-0">
                  <ReturningRentalMenu
                    bookingId={booking.id}
                    isOverdue={overdue}
                    onAction={refetch}
                    onView={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  />
                </div>
              </div>

              {/* Row 2: Return Time & Status (The focus of this view) */}
              <div className={`mt-3 pt-3 border-t border-[var(--color-surface-border)]/40 flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-2">
                  <Clock size={14} className={overdue ? "text-rose-500" : "text-emerald-500"} />
                  <div>
                    <p className={`text-xs font-bold ${overdue ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {returnRelative(returnAt, overdue)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  View Trip <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ReturningRentalMenuProps {
  bookingId: number;
  isOverdue: boolean;
  onAction: () => void | Promise<void>;
  onView: () => void;
}

function ReturningRentalMenu({ bookingId, isOverdue, onAction, onView }: ReturningRentalMenuProps) {
  const [open, setOpen] = useState(false);
  
  const handleComplete = async () => {
    try {
      await bookingsApi.complete(bookingId);
      toast.success("Vehicle returned — trip completed");
      await onAction();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Action failed. Try again.";
      toast.error(message);
      throw e;
    }
  };

  const handleCancel = async () => {
    try {
      await bookingsApi.cancel(bookingId, { reason: "agency_cancelled" });
      toast.success("Booking cancelled");
      await onAction();
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Action failed. Try again.";
      toast.error(message);
      throw e;
    }
  };

  const actions: SheetAction[] = [
    {
      kind: "view",
      label: "View Booking Details",
      icon: Eye,
      onClick: onView,
    },
    {
      kind: "action",
      label: "Mark as Returned",
      icon: CheckCircle2,
      tone: "success",
      onClick: handleComplete,
    },
    {
      kind: "action",
      label: "Cancel Booking",
      icon: XCircle,
      tone: "danger",
      onClick: handleCancel,
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)] transition-all active:scale-95"
        aria-label="Return actions"
      >
        <MoreVertical size={15} />
      </button>

      <BookingActionsSheet
        open={open}
        onClose={() => setOpen(false)}
        statusLabel={isOverdue ? "Overdue Return" : "Returning Soon"}
        statusTone={isOverdue ? "danger" : "success"}
        actions={actions}
      />
    </>
  );
}

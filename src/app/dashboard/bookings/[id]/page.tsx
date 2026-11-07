"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, CircleNotch as Loader2, WarningCircle as AlertCircle, ArrowsClockwise as RefreshCw, ShieldCheck
} from "@phosphor-icons/react/ssr";
import toast from "react-hot-toast";

import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/lib/types";

// Default imports avoid named-export mismatch errors completely
import TripTimelineWidget from "@/components/bookings/TripTimelineWidget";
import BookingHeaderWidget from "@/components/bookings/BookingHeaderWidget";
import VehicleShowcaseWidget from "@/components/bookings/VehicleShowcaseWidget";
import ClientProfileWidget from "@/components/bookings/ClientProfileWidget";
import FinancialsWidget from "@/components/bookings/FinancialsWidget";
import DriverProfileWidget from "@/components/bookings/DriverProfileWidget";

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = Number(params?.id);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async () => {
    if (!bookingId || isNaN(bookingId)) {
      setError("Invalid Booking ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await bookingsApi.get(bookingId);
      setBooking(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to load booking details";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" aria-hidden="true" />
        <p className="text-xs font-semibold text-[var(--color-ink-muted)]">
          Fetching booking specs & telemetry...
        </p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center px-4">
        <div className="p-3 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]">
          <AlertCircle size={28} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-ink)]">
            Unable to Load Booking
          </h3>
          <p className="text-xs text-[var(--color-ink-muted)] mt-1 max-w-sm">
            {error || "Booking record could not be retrieved."}
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/dashboard/bookings"
            className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-hover)] transition-all"
          >
            Back to Bookings
          </Link>
          <button
            onClick={fetchBooking}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition-all"
          >
            <RefreshCw size={14} aria-hidden="true" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Navigation Anchor & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
          Back to All Bookings
        </Link>
        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-[var(--color-surface-hover)] text-[var(--color-ink-muted)] border border-[var(--color-surface-border)]">
          REF: #{booking.booking_number || booking.id}
        </span>
      </div>

      {/* Widget 1: Master Booking Header Bar */}
      <BookingHeaderWidget booking={booking} onRefresh={fetchBooking} />

      {/* Main Grid Blueprint Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3 width): Client Profile, Trip Timeline & Vehicle Showcase */}
        <div className="lg:col-span-2 space-y-6">
          {/* Widget 2: Client Profile (Top) */}
          <ClientProfileWidget booking={booking} />

          {/* Widget 3: Driver Profile (NEW) */}
          <DriverProfileWidget booking={booking} />

          {/* Widget 3: Trip Timeline (Middle) */}
          <TripTimelineWidget booking={booking} />

          {/* Widget 4: Vehicle Showcase (Bottom) */}
          <VehicleShowcaseWidget booking={booking} />
        </div>

        {/* Right Column (1/3 width): Financials, Invoicing & Audit */}
        <div className="space-y-6">
          {/* Widget 5: Financial Summary & Invoice Share Panel */}
          <FinancialsWidget booking={booking} onRefresh={fetchBooking} />

          {/* Security & Verification Sidebar Note */}
          <div className="bg-[var(--color-surface-hover)]/50 border border-[var(--color-surface-border)] rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck size={20} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-[var(--color-ink-muted)] space-y-1">
              <p className="font-bold text-[var(--color-ink)]">Audit Logged</p>
              <p>All lifecycle status transitions, extensions, and invoice actions are recorded and logged for security.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

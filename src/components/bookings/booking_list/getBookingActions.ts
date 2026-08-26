/**
 * Shared row-actions factory — consumed by both CardGrid (mobile) and
 * DataTable (desktop) so behaviour is identical across breakpoints.
 *
 * ✅ LIFECYCLE: "Confirm Booking" removed from dashboard — confirm is now
 * client-driven via the public quotation accept flow. Start Trip remains
 * as the operator's manual trigger (from pending OR confirmed).
 */
import {
  Link as LinkIcon, Ban, XCircle, FileText, CalendarPlus, Shield, Send,
} from "lucide-react";
import type { RowAction } from "@/components/ui/DataTable";
import type { Booking } from "@/lib/types";

export interface BookingActionsContext {
  routerPush: (href: string) => void;
  onExtendBooking: (booking: Booking) => void;
  handleConfirm: (id: number) => void;       // ⚠️ deprecated — kept for backward compat
  handleStartTrip: (id: number) => void;
  handleCompleteTrip: (id: number) => void;
  handleCancel: (id: number) => void;        // ✅ now prompts for reason
  handleNoShow: (id: number) => void;        // ✅ now calls cancel(reason=no_show)
  handleCopyContractLink: (id: number) => void;
  handleCopyQuotationLink: (id: number) => void; // ✅ NEW: sends quotation (invoice token)
  hasContract: (id: number) => boolean;      // ✅ NEW: gates "Send Contract"
  hasQuotation: (id: number) => boolean;     // ✅ NEW: gates "Send Quotation"
}

export const getBookingActions = (
  booking: Booking,
  ctx: BookingActionsContext,
): RowAction<Booking>[] => {
  const {
    routerPush, onExtendBooking,
    handleStartTrip, handleCompleteTrip, handleCancel, handleNoShow,
    handleCopyContractLink, handleCopyQuotationLink,
    hasContract, hasQuotation,
  } = ctx;

  const actions: RowAction<Booking>[] = [
    { label: "Manage Booking", icon: FileText, onClick: () => routerPush(`/dashboard/bookings/${booking.id}`) },
    
    // ✅ SEND QUOTATION: active when quotation exists (invoice token)
    {
      label: "Send Quotation",
      icon: Send,
      onClick: () => handleCopyQuotationLink(booking.id),
      disabled: !hasQuotation(booking.id),
    },
    
    // ✅ SEND CONTRACT: muted until contract is generated (after quotation acceptance)
    {
      label: "Send Contract",
      icon: LinkIcon,
      onClick: () => handleCopyContractLink(booking.id),
      disabled: !hasContract(booking.id),
    },
  ];

  if (booking.status === "pending") {
    // ✅ Confirm removed — client confirms via quotation accept on public portal
    actions.push(
      { label: "Cancel Booking", icon: Ban, variant: "danger", onClick: () => handleCancel(booking.id) },
    );
  }

  if (booking.status === "confirmed") {
    actions.push(
      { label: "Start Trip", icon: Shield, variant: "primary", onClick: () => handleStartTrip(booking.id) },
      { label: "Mark No-Show", icon: XCircle, variant: "default", onClick: () => handleNoShow(booking.id) },
      { label: "Cancel Booking", icon: Ban, variant: "danger", onClick: () => handleCancel(booking.id) },
    );
  }

  if (booking.status === "active") {
    actions.push(
      { label: "Complete Trip", icon: Shield, variant: "primary", onClick: () => handleCompleteTrip(booking.id) },
      { label: "Extend Booking", icon: CalendarPlus, variant: "default", onClick: () => onExtendBooking(booking) },
    );
  }

  if (booking.status === "completed") {
    actions.push({ label: "Extend Booking", icon: CalendarPlus, variant: "default", onClick: () => onExtendBooking(booking) });
  }

  return actions;
};

// src/components/bookings/booking_list/mobile/types.ts
import type { Booking, Client, Vehicle } from "@/lib/types";

export interface PaymentSnapshot {
  amount_paid: number;
  amount_due: number;
  status: string;
}

export interface BookingPaymentPill {
  label: string;
  classes: string;
  isPaid: boolean;
  isPartial: boolean;
}

export interface BookingRowData {
  booking: Booking;
  client?: Client;
  vehicle?: Vehicle;
  paymentPill: BookingPaymentPill;
}

// src/components/client/mobile/types.ts
import type { Client } from "@/lib/types";

export type ClientBookingState = "none" | "booked" | "on_trip";

export interface ClientRowCallbacks {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClick: () => void;
}

/**
 * ✅ What ClientRow actually reads — decoupled from the full Client type
 * so we can safely allow nullable fields and add derived data like
 * `booking_state`.
 */
export interface ClientListItem {
  id: number;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  status: string;
  verification_status?: string | null;
  dl_expiry?: string | null;
  /** Derived: "none" | "booked" | "on_trip" */
  booking_state?: ClientBookingState;
}

/** Type guard to accept a full Client OR the slimmer ClientListItem. */
export type ClientRowData = ClientListItem | (Client & { booking_state?: ClientBookingState });

// src/components/bookings/booking_list/mobile/BookingRow.tsx
"use client";

import {
  CalendarDays,
  Phone,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  Car,
  BadgeCheck,
} from "lucide-react";
import { formatDateShort } from "../constants";
import {
  getBookingAvatarColors,
  getWhatsAppNumber,
  formatPhoneDisplay,
} from "./helpers";
import type { Booking, Client, Vehicle } from "@/lib/types";
import type { BookingPaymentPill } from "./types";

interface BookingRowProps {
  item: Booking;
  index: number;
  total: number;
  client?: Client;
  vehicle?: Vehicle;
  paymentPill: BookingPaymentPill;
  onClick: () => void;
}

export default function BookingRow({
  item,
  index,
  total,
  client,
  vehicle,
  paymentPill,
  onClick,
}: BookingRowProps) {
  const avatar = getBookingAvatarColors(item.status);
  const clientName = client?.full_name || `Client #${item.client_id}`;
  const waNumber = getWhatsAppNumber(client?.phone);
  const phoneDisplay = formatPhoneDisplay(client?.phone);

  const PaymentIcon = paymentPill.isPaid
    ? BadgeCheck
    : AlertCircle;

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col w-full py-3.5 px-3 transition-colors cursor-pointer select-none hover:bg-[var(--color-surface-hover)]/40"
    >
      {index !== total - 1 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-[var(--color-surface-border)] to-transparent" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${avatar.bg}`}
          >
            <CalendarDays size={20} className={avatar.icon} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[var(--color-ink)] truncate tracking-tight">
                {item.booking_number || `BK-${item.id}`}
              </span>
              <span
                className={`inline-flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wide whitespace-nowrap ${paymentPill.classes}`}
              >
                <PaymentIcon size={9} className="flex-shrink-0" strokeWidth={2.5} />
                {paymentPill.label}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <CalendarDays
                size={10}
                className="text-[var(--color-ink-subtle)] flex-shrink-0"
              />
              <span className="text-[10px] text-[var(--color-ink-muted)] font-medium">
                {formatDateShort(item.start_date)}
              </span>
              <span className="text-[9px] text-[var(--color-ink-subtle)]">→</span>
              <span className="text-[10px] text-[var(--color-ink-muted)] font-medium">
                {formatDateShort(item.end_date)}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-[var(--color-ink-subtle)] flex-shrink-0 ml-1"
        />
      </div>

      {/* Body */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[var(--color-ink)] leading-tight truncate mb-1.5">
            {clientName}
          </p>

          {client?.phone && (
            <div className="flex items-center gap-2">
              {/* ✅ Call pill shows the actual number */}
              <a
                href={`tel:${client.phone.replace(/\s/g, "")}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-colors text-[10px] font-bold text-[var(--color-ink)]"
              >
                <Phone size={10} className="text-[var(--color-ink-muted)] flex-shrink-0" />
                <span className="font-mono tracking-tight whitespace-nowrap">
                  {phoneDisplay}
                </span>
              </a>

              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-colors text-[10px] font-bold text-[var(--color-ink)]"
                >
                  <MessageCircle size={10} className="text-[var(--color-ink-muted)]" />
                  Message
                </a>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-right">
          <p className="text-xs font-bold text-[var(--color-ink)] leading-tight truncate">
            {vehicle
              ? `${vehicle.make} ${vehicle.model}`
              : `Vehicle #${item.vehicle_id}`}
          </p>
          {vehicle?.plate_number && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-border)] transition-colors text-[10px] font-bold text-[var(--color-ink)] mt-1.5">
              <Car size={10} className="text-[var(--color-ink-muted)]" />
              <span className="font-mono tracking-tight">{vehicle.plate_number}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[var(--color-surface-border)]/50 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-ink-subtle)]">
          Trip Total
        </span>
        <p className="text-base font-extrabold text-[var(--color-primary)] tabular-nums tracking-tight">
          {item.currency_code} {Number(item.total_amount).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

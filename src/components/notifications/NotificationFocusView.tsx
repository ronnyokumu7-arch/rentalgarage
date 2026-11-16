"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import {
  getNotificationIcon,
  getTimeAgo,
  getContextualActionLabel,
} from "@/lib/notifications/helpers";
import { vehiclesApi } from "@/lib/api/vehicles";
import { clientsApi } from "@/lib/api/clients";
import { contractsApi } from "@/lib/api/contracts";
import { bookingsApi } from "@/lib/api/bookings";
import { paymentsApi } from "@/lib/api/payments";
import type { Notification, Vehicle, Client, Contract, Booking, Payment } from "@/lib/types";

interface NotificationFocusViewProps {
  notification: Notification;
  onBack: () => void;
  onAction: () => void;
  isMobile?: boolean;
}

export default function NotificationFocusView({
  notification,
  onBack,
  onAction,
  isMobile = false,
}: NotificationFocusViewProps) {
  const { label: ctaLabel, icon: ctaIcon } = getContextualActionLabel(notification);
  
  const [entity, setEntity] = useState<Vehicle | Client | Contract | Booking | Payment | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch live entity data when notification opens
  useEffect(() => {
    let isMounted = true;
    
    const fetchEntity = async () => {
      const { type, payload } = notification;
      if (!payload) {
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted) setLoading(true);
      try {
        if (type === "vehicle" && payload.vehicle_id) {
          const vehicle = await vehiclesApi.get(payload.vehicle_id);
          if (isMounted) setEntity(vehicle);
        } else if (type === "client" && payload.client_id) {
          const client = await clientsApi.get(payload.client_id);
          if (isMounted) setEntity(client);
        } else if (type === "contract" && payload.contract_id) {
          const contract = await contractsApi.get(payload.contract_id);
          if (isMounted) setEntity(contract);
        } else if (type === "booking" && payload.booking_id) {
          const booking = await bookingsApi.get(payload.booking_id);
          if (isMounted) setEntity(booking);
        } else if (type === "payment" && payload.payment_id) {
          const payment = await paymentsApi.get(payload.payment_id);
          if (isMounted) setEntity(payment);
        } else {
          if (isMounted) setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch entity details:", error);
        // Graceful fallback: just don't show the details section
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEntity();
    
    return () => {
      isMounted = false; // Prevent state updates if component unmounts early
    };
  }, [notification]);

  // Render vehicle-specific details
  const renderVehicleDetails = (vehicle: Vehicle) => (
    <>
      <DetailRow label="Vehicle" value={`${vehicle.make} ${vehicle.model}`} />
      <DetailRow label="Plate" value={vehicle.plate_number} />
      <DetailRow label="YOM" value={vehicle.year} />
      <DetailRow label="Daily Rate" value={`KES ${Number(vehicle.daily_rate).toLocaleString()}`} />
      <DetailRow label="Status" value={vehicle.status ? vehicle.status.replace(/_/g, " ") : "Unknown"} />
      <DetailRow label="Ownership" value={vehicle.owner_id ? "Investor-owned" : "Agency-owned"} />
      {vehicle.mileage_due && (
        <DetailRow label="Mileage" value="Update due" highlight />
      )}
    </>
  );

  // Render client-specific details
  const renderClientDetails = (client: Client) => (
    <>
      <DetailRow label="Name" value={client.full_name} />
      <DetailRow label="Phone" value={client.phone} />
      {client.email && <DetailRow label="Email" value={client.email} />}
      <DetailRow label="Arrangement" value={client.driving_arrangement.replace(/_/g, " ")} />
      <DetailRow label="Status" value={client.status} />
      <DetailRow label="Verification" value={client.verification_status.replace(/_/g, " ")} />
      {client.driver && (
        <>
          <DetailRow label="Driver" value={client.driver.full_name} />
          <DetailRow label="Driver Phone" value={client.driver.phone} />
        </>
      )}
    </>
  );

  // Render contract-specific details
  const renderContractDetails = (contract: Contract) => (
    <>
      <DetailRow label="Contract #" value={contract.contract_number} />
      {contract.client_name && <DetailRow label="Client" value={contract.client_name} />}
      {contract.booking_number && <DetailRow label="Booking #" value={contract.booking_number} />}
      <DetailRow label="Status" value={contract.status} />
      {contract.signed_by_client && contract.client_signed_at && (
        <DetailRow 
          label="Signed" 
          value={new Date(contract.client_signed_at).toLocaleDateString()} 
        />
      )}
    </>
  );

  // Render booking-specific details
  const renderBookingDetails = (booking: Booking) => (
    <>
      <DetailRow label="Booking #" value={booking.booking_number || `#${booking.id}`} />
      {booking.client_name && <DetailRow label="Client" value={booking.client_name} />}
      {booking.vehicle_name && (
        <DetailRow 
          label="Vehicle" 
          value={`${booking.vehicle_name}${booking.vehicle_plate ? ` (${booking.vehicle_plate})` : ""}`} 
        />
      )}
      <DetailRow 
        label="Trip" 
        value={`${new Date(booking.start_date).toLocaleDateString()} → ${new Date(booking.end_date).toLocaleDateString()}`} 
      />
      <DetailRow 
        label="Amount" 
        value={`${booking.currency_code || 'KES'} ${Number(booking.total_amount).toLocaleString()}`} 
      />
      <DetailRow label="Status" value={booking.status} />
      {booking.service_type && (
        <DetailRow label="Service" value={booking.service_type.replace(/_/g, " ")} />
      )}
    </>
  );

  // Render payment-specific details (Live Fetch)
  const renderPaymentDetails = (payment: Payment) => (
    <>
      {payment.invoice_number && <DetailRow label="Invoice #" value={payment.invoice_number} />}
      {payment.reference && <DetailRow label="Reference" value={payment.reference} />}
      <DetailRow 
        label="Amount" 
        value={`${payment.currency_code || 'KES'} ${Number(payment.amount).toLocaleString()}`} 
      />
      <DetailRow label="Method" value={payment.method} />
      <DetailRow label="Status" value={payment.status} />
      {payment.client_name && <DetailRow label="Client" value={payment.client_name} />}
      {payment.paid_at && (
        <DetailRow 
          label="Recorded" 
          value={new Date(payment.paid_at).toLocaleString()} 
        />
      )}
    </>
  );

  // Render type-specific details
  const renderDetails = () => {
    if (loading) {
      return (
        <div className="text-center py-8 text-[var(--color-ink-muted)] text-sm">
          Loading details...
        </div>
      );
    }

    const { type } = notification;

    if (type === "vehicle" && entity) return renderVehicleDetails(entity as Vehicle);
    if (type === "client" && entity) return renderClientDetails(entity as Client);
    if (type === "contract" && entity) return renderContractDetails(entity as Contract);
    if (type === "booking" && entity) return renderBookingDetails(entity as Booking);
    if (type === "payment" && entity) return renderPaymentDetails(entity as Payment);

    return null;
  };

  const details = renderDetails();

  return (
    <div
      className="flex flex-col h-full"
      style={{ minHeight: isMobile ? "60vh" : "400px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-surface-border)]">
        <button
          onClick={onBack}
          className="p-1 rounded-md hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-ink-muted)]"
          aria-label="Go back to list"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
            {notification.type}
          </p>
          <p className="text-xs text-[var(--color-ink-subtle)]">
            {getTimeAgo(notification.created_at)}
          </p>
        </div>
        {!notification.is_read && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: "var(--color-primary)" }}
          />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[var(--color-surface-hover)] text-[var(--color-primary)]">
            {getNotificationIcon(notification.type, 24)}
          </div>
          <h2 className="text-xl font-bold leading-tight text-[var(--color-ink-primary)]">
            {notification.title}
          </h2>
        </div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--color-ink-primary)]">
          {notification.message}
        </p>

        {details && (
          <div className="mt-6 p-4 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-hover)]">
            <p className="font-bold mb-2 uppercase tracking-wide text-[var(--color-ink-subtle)] text-xs">
              Details
            </p>
            {details}
          </div>
        )}
      </div>

      {/* CTA Footer */}
      {notification.action_url && (
        <div className="p-4 border-t border-[var(--color-surface-border)] bg-[var(--color-surface)]">
          <button
            onClick={onAction}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
            }}
          >
            {ctaLabel} {ctaIcon}
          </button>
        </div>
      )}
    </div>
  );
}

// Reusable detail row component
function DetailRow({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string | number; 
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between py-1.5 border-b border-[var(--color-surface-border)] last:border-0">
      <span className="text-xs text-[var(--color-ink-muted)]">{label}:</span>
      <span 
        className={`text-xs font-semibold ${
          highlight 
            ? "text-[var(--color-warning)]" 
            : "text-[var(--color-ink-primary)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// src/hooks/useActivityMapper.ts
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ActivityData } from "@/components/dashboard/UnifiedActivityCard";

export function useActivityMapper() {
  const router = useRouter();

  // ✅ CRITICAL: memoized so consumers can safely use it in dependency arrays.
  // Without this, every render creates a new function identity → infinite
  // refetch loops in hooks that depend on it (useFinancialOverview).
  const mapActivity = useCallback((activity: any): ActivityData => {
    const type = activity.type || activity.action || "default";
    const label = activity.label || activity.action?.replace(/_/g, " ") || activity.title || "Activity";
    const summary = activity.summary || {};
    const timestamp = activity.timestamp || activity.created_at;
    const client_name = summary.client_name || activity.client?.full_name || activity.client_name;
    const client_phone = summary.client_phone || activity.client?.phone || activity.client_phone;
    const amount = summary.amount || activity.amount;
    const reference = summary.reference || summary.booking_number || activity.reference || activity.transaction_ref;

    // ✅ 1. FINANCIAL DEEP-LINKS (Money Focus)
    if (["payment_received", "payment_failed", "invoice_paid", "invoice_overdue", "invoice_created", "contract_signed", "void_payment", "void_invoice", "void_contract"].includes(type)) {
      let link = "/dashboard/financials";
      if (["payment_received", "payment_failed", "void_payment"].includes(type)) {
        link = `/dashboard/financials?tab=payments&payment_id=${activity.payment_id || activity.target_id || activity.id}`;
      } else if (["invoice_paid", "invoice_overdue", "invoice_created", "void_invoice"].includes(type)) {
        link = `/dashboard/financials?tab=invoices&invoice_id=${activity.invoice_id || activity.target_id || activity.id}&filter=${type === "invoice_overdue" ? "overdue" : ""}`;
      } else if (["contract_signed", "void_contract"].includes(type)) {
        link = `/dashboard/financials?tab=contracts&contract_id=${activity.contract_id || activity.target_id || activity.id}`;
      }

      return {
        id: activity.id,
        type,
        title: label,
        description: activity.description || summary.reason || "",
        amount,
        reference,
        timestamp,
        link,
        client_name,
        client_phone,
        meta: activity.meta,
        priority: activity.priority,
      };
    }

    // ✅ 2. CLIENT DEEP-LINKS
    if (type === "client_added" || type === "create_client") {
      return {
        id: activity.id,
        type,
        title: label,
        description: activity.description || summary.email || "",
        amount: null,
        reference: undefined,
        timestamp,
        link: `/dashboard/clients/${activity.client_id || activity.target_id || activity.id}`,
        client_name,
        client_phone,
        meta: "New Client",
        priority: activity.priority,
      };
    }

    // ✅ 3. BOOKING DEEP-LINKS
    if (["booking_created", "create_booking", "booking_confirmed", "update_booking_status", "update_booking", "archive_booking", "restore_booking", "extend_booking", "trip_ending_today", "trip_overdue"].includes(type)) {
      return {
        id: activity.id,
        type,
        title: label,
        description: activity.description || "",
        amount,
        reference: reference || summary.booking_number,
        timestamp,
        link: `/dashboard/bookings/${activity.booking_id || activity.target_id || activity.id}`,
        client_name,
        client_phone,
        meta: summary.booking_days ? `${summary.booking_days} Days` : (summary.extra_days ? `+${summary.extra_days} Days` : activity.meta),
        priority: activity.priority,
      };
    }

    // ✅ 4. VEHICLE/FLEET DEEP-LINKS
    if (["vehicle_rented", "vehicle_returned", "vehicle_added", "create_vehicle", "mileage_due", "vehicle_insurance_expiring"].includes(type)) {
      const vehicle_id = activity.vehicle_id || activity.target_id || activity.id;
      const plate = summary.plate_number || activity.plate_number;

      return {
        id: activity.id,
        type,
        title: label,
        description: activity.description || (summary.vehicle_name ? `Vehicle: ${summary.vehicle_name}` : ""),
        amount: null,
        reference: plate,
        timestamp,
        link: `/dashboard/fleet/${vehicle_id}`,
        client_name,
        client_phone,
        meta: summary.mileage ? `${summary.mileage} KM` : (summary.days_left ? `${summary.days_left} days left` : activity.meta),
        priority: activity.priority,
      };
    }

    // ✅ 5. DRIVER/COMPLIANCE DEEP-LINKS (DL Expiring)
    if (type === "dl_expired") {
      return {
        id: activity.id,
        type,
        title: label,
        description: activity.description || (summary.days_left ? `Expires in ${summary.days_left} days` : ""),
        amount: null,
        reference: summary.driver_name || undefined,
        timestamp,
        link: `/dashboard/drivers/${activity.driver_id || activity.target_id || activity.id}`,
        client_name: summary.driver_name,
        client_phone: undefined,
        meta: "Compliance Alert",
        priority: activity.priority,
      };
    }

    // ✅ 6. DEFAULT FALLBACK
    return {
      id: activity.id,
      type,
      title: label,
      description: activity.description || "",
      amount,
      reference,
      timestamp,
      link: activity.link || "/dashboard/activity",
      client_name,
      client_phone,
      meta: activity.meta,
      priority: activity.priority,
    };
  }, []); // ✅ stable identity — no dependencies used inside

  return { mapActivity, router };
}

// src/app/quote/[token]/page.tsx
"use client";

import { useParams } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Car,
  MapPin,
} from "lucide-react";

// Logical Layer
import { usePublicQuotation } from "@/hooks/public-docs/usePublicQuotation";

// Reusable UI Kit
import PublicDocLayout from "@/components/public-docs/PublicDocLayout";
import PublicDocHeader from "@/components/public-docs/PublicDocHeader";
import PublicDocParties from "@/components/public-docs/PublicDocParties";
import PublicDocDetails from "@/components/public-docs/PublicDocDetails";
import PublicDocFinancials from "@/components/public-docs/PublicDocFinancials";
import PublicDocActions from "@/components/public-docs/PublicDocActions";

export default function PublicQuotationPage() {
  const params = useParams();
  const token = params.token as string;
  
  const { 
    quotation, loading, error, isProcessing, actionResult, 
    handleAccept, handleDecline 
  } = usePublicQuotation(token);

  // 1. Loading & Error States
  if (loading) {
    return (
      <PublicDocLayout>
        <div className="p-12 text-center text-ink-muted animate-pulse">Loading Quotation...</div>
      </PublicDocLayout>
    );
  }

  if (error || !quotation) {
    return (
      <PublicDocLayout>
        <div className="p-12 text-center">
          <p className="text-danger-text font-semibold">{error || "Quotation not found."}</p>
        </div>
      </PublicDocLayout>
    );
  }

  // 2. Handle Post-Action States (Accepted/Declined)
  if (actionResult === 'accepted') {
    return (
      <PublicDocLayout>
        <div className="p-12 text-center bg-green-50 border border-green-200 rounded-2xl m-8">
          <CheckCircle2 size={64} className="mx-auto text-green-600 mb-4" />
          <h3 className="text-2xl font-bold text-green-900 mb-2">Booking Confirmed!</h3>
          <p className="text-green-700">Thank you for accepting. We will send your contract and invoice shortly.</p>
        </div>
      </PublicDocLayout>
    );
  }

  if (actionResult === 'declined' || quotation.status === 'declined') {
    return (
      <PublicDocLayout>
        <div className="p-12 text-center bg-red-50 border border-red-200 rounded-2xl m-8">
          <XCircle size={64} className="mx-auto text-red-600 mb-4" />
          <h3 className="text-2xl font-bold text-red-900 mb-2">Quotation Declined</h3>
          <p className="text-red-700">This quotation has been closed. Please contact us if you need a new quote.</p>
        </div>
      </PublicDocLayout>
    );
  }

  // 3. Map Data to UI Props
  const isPending = quotation.status === "pending";

  const headerProps = {
    companyName: quotation.tenant_name || "Rental Agency",
    documentNumber: `QT-${quotation.id}`,
    docType: "quotation" as const,
    status: quotation.status,
  };

  const partiesProps = {
    issuerName: quotation.tenant_name || "Rental Agency",
    recipientName: quotation.client_name || "Client",
    recipientDetails: [quotation.client_email, quotation.client_phone].filter(
      (detail): detail is string => Boolean(detail)
    ),
  };

  const detailsProps = {
    title: "Trip Details",
    items: [
      { label: "Issue Date", value: new Date(quotation.created_at).toLocaleDateString(), icon: CalendarDays },
      { label: "Expires", value: quotation.expires_at ? new Date(quotation.expires_at).toLocaleDateString() : "N/A", icon: CalendarDays },
      { label: "Vehicle", value: quotation.vehicle_details || "TBD", icon: Car },
      { label: "Pickup", value: quotation.pickup_location || "N/A", icon: MapPin },
      { label: "Return", value: quotation.return_location || "N/A", icon: MapPin },
    ],
  };

  const financialsProps = {
    currency: quotation.currency_code || "KES",
    rows: [
      {
        label: `Daily Rate (${quotation.daily_rate.toLocaleString()} / day)`,
        value: `${quotation.currency_code || "KES"} ${quotation.daily_rate.toLocaleString()}`,
      },
      {
        label: "Total",
        value: `${quotation.currency_code || "KES"} ${quotation.total_amount.toLocaleString()}`,
        isTotal: true,
      },
    ],
  };

  const actionsProps = {
    actions: [
      {
      label: isProcessing ? "Processing..." : "Accept Quotation",
      icon: <CheckCircle2 size={16} />,
      onClick: handleAccept,
      disabled: !isPending || isProcessing,
      variant: "primary" as const,
      },
      {
      label: "Decline",
      icon: <XCircle size={16} />,
      onClick: handleDecline,
      disabled: !isPending || isProcessing,
      variant: "danger" as const,
      },
    ],
  };

  // 4. Render
  return (
    <PublicDocLayout>
      <PublicDocHeader {...headerProps} />
      <PublicDocParties {...partiesProps} />
      <PublicDocDetails {...detailsProps} />
      <PublicDocFinancials {...financialsProps} />
      <PublicDocActions {...actionsProps} />
      {quotation.terms_and_conditions && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-900">
            Terms & Conditions
          </h2>
          <p className="whitespace-pre-wrap text-sm text-slate-600">
            {quotation.terms_and_conditions}
          </p>
        </div>
      )}
    </PublicDocLayout>
  );
}

// src/app/invoice/[token]/page.tsx
"use client";

import { useParams } from "next/navigation";
import {
  CreditCard,
  Download,
  CheckCircle2,
  CalendarDays,
  Hash,
} from "lucide-react";

// Logical Layer
import { usePublicInvoice } from "@/hooks/public-docs/usePublicInvoice";

// Reusable UI Kit
import PublicDocLayout from "@/components/public-docs/PublicDocLayout";
import PublicDocHeader from "@/components/public-docs/PublicDocHeader";
import PublicDocParties from "@/components/public-docs/PublicDocParties";
import PublicDocDetails from "@/components/public-docs/PublicDocDetails";
import PublicDocFinancials from "@/components/public-docs/PublicDocFinancials";
import PublicDocActions from "@/components/public-docs/PublicDocActions";

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  
  const { invoice, loading, error, isProcessingPayment, handlePayNow } = usePublicInvoice(token);

  // 1. Loading & Error States
  if (loading) {
    return (
      <PublicDocLayout>
        <div className="p-12 text-center text-ink-muted animate-pulse">Loading Invoice...</div>
      </PublicDocLayout>
    );
  }

  if (error || !invoice) {
    return (
      <PublicDocLayout>
        <div className="p-12 text-center">
          <p className="text-danger-text font-semibold">{error || "Invoice not found."}</p>
        </div>
      </PublicDocLayout>
    );
  }

  // 2. Map Data to UI Props
  const isPaid = invoice.status === "paid";

  const headerProps = {
    companyName: invoice.tenant_name,
    documentNumber: invoice.invoice_number,
    docType: "invoice" as const,
    status: invoice.status,
  };

  const partiesProps = {
    issuerName: invoice.tenant_name,
    recipientName: invoice.client_name,
    recipientDetails: [invoice.client_email, invoice.client_phone].filter(
      (detail): detail is string => Boolean(detail)
    ),
  };

  const detailsProps = {
    title: "Invoice Details",
    items: [
      { label: "Issue Date", value: new Date(invoice.created_at).toLocaleDateString(), icon: CalendarDays },
      { label: "Due Date", value: new Date(invoice.due_date).toLocaleDateString(), icon: CalendarDays },
      { label: "Booking Ref", value: invoice.booking_ref || `BK-${invoice.id}`, icon: Hash },
    ],
  };

  const currency = invoice.currency_code || "KES";
  const financialsProps = {
    currency,
    rows: [
      ...(invoice.line_items || [
        { description: "Vehicle Rental Charges", amount: invoice.amount_due },
      ]).map((item) => ({
        label: item.description,
        value: `${currency} ${item.amount.toLocaleString()}`,
      })),
      {
        label: "Total Due",
        value: `${currency} ${invoice.amount_due.toLocaleString()}`,
        isTotal: true,
      },
      {
        label: "Amount Paid",
        value: `${currency} ${invoice.amount_paid.toLocaleString()}`,
      },
      {
        label: "Balance",
        value: `${currency} ${Math.max(0, invoice.amount_due - invoice.amount_paid).toLocaleString()}`,
        isHighlight: !isPaid,
        isTotal: true,
      },
    ],
  };

  const actionsProps = {
    actions: [
      {
        label: isPaid
          ? "Paid in Full"
          : isProcessingPayment
            ? "Processing..."
            : "Pay Now",
        icon: isPaid ? <CheckCircle2 size={16} /> : <CreditCard size={16} />,
        ...(isPaid ? {} : { onClick: handlePayNow }),
        disabled: isPaid || isProcessingPayment,
        variant: "primary" as const,
      },
      {
      label: "Download PDF",
      icon: <Download size={16} />,
      onClick: () => {
        window.open(`/api/invoices/${invoice.id}/pdf`, "_blank");
      },
      variant: "secondary" as const,
      },
    ],
  };

  // 3. Render
  return (
    <PublicDocLayout>
      <PublicDocHeader {...headerProps} />
      <PublicDocParties {...partiesProps} />
      <PublicDocDetails {...detailsProps} />
      <PublicDocFinancials {...financialsProps} />
      <PublicDocActions {...actionsProps} />
    </PublicDocLayout>
  );
}

// src/app/dashboard/quotations/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useQuotationForm } from "@/hooks/quotations/useQuotationForm";
import QuotationFormUI from "@/components/quotations/QuotationFormUI";
import PageHeader from "@/components/ui/PageHeader";

export default function NewQuotationPage() {
  const router = useRouter();
  
  // Load all logic, state, and API handlers
  const formLogic = useQuotationForm();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Quotation"
        subtitle="Draft a new rental proposal to send to your client."
      />
      {/* Pass all logic down to the UI component */}
      <QuotationFormUI
        {...formLogic}
        onBack={() => router.push("/dashboard/quotations")}
      />
    </div>
  );
}

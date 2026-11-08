// src/components/features/quotation/QuotationHeader.tsx
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import type { QuotationStatus } from "@/lib/types";

interface QuotationHeaderProps {
  quotation: {
    quotation_number: string | number;
    status: QuotationStatus;
  };
}

const statusVariants: Record<QuotationStatus, BadgeVariant> = {
  pending: "warning",
  accepted: "success",
  expired: "neutral",
  declined: "danger",
};

export default function QuotationHeader({ quotation }: QuotationHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700...">
      <h1>Quotation #{quotation.quotation_number}</h1>
      <Badge variant={statusVariants[quotation.status]}>
        {quotation.status}
      </Badge>
    </div>
  );
}

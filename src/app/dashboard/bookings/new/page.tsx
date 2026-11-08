"use client";

import { useRouter } from "next/navigation";
import { useBookingForm } from "@/hooks/bookings/useBookingForm";
import BookingFormUI from "@/components/bookings/BookingFormUI";
import PageHeader from "@/components/ui/PageHeader";
import { CalendarPlus } from "lucide-react";

export default function NewBookingPage() {
  const router = useRouter();
  const formLogic = useBookingForm();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Booking"
        subtitle="Draft a new rental booking to generate a quotation."
        icon={CalendarPlus}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bookings", href: "/dashboard/bookings" },
          { label: "New" }
        ]}
      />

      <BookingFormUI
        {...formLogic}
        onBack={() => router.push("/dashboard/bookings")}
      />
    </div>
  );
}

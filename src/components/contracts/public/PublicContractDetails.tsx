// src/components/contracts/public/PublicContractDetails.tsx
"use client";

import { Calendar, Car, User, Banknote, UserCircle } from "lucide-react";
import { brand } from "@/lib/brand";
import type { PublicContractView } from "@/lib/types";

interface Props {
  contract: PublicContractView;
}

// Simple date formatter: "01, Jan, 2026"
const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .replace(/ /g, ", ");
};

export default function PublicContractDetails({ contract }: Props) {
  // ✅ MILESTONE 2: Driver assignment check
  const hasDriver = !!(contract.driver_name);

  return (
    <div className="p-4 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        
        {/* Client Info */}
        <DetailSection
          title="Client Details"
          icon={<User size={18} />}
          primary={contract.client_name}
          secondary="Renter"
        />

        {/* Vehicle Info */}
        <DetailSection
          title="Vehicle Details"
          icon={<Car size={18} />}
          primary={`${contract.vehicle_make} ${contract.vehicle_model}`}
          secondary={`Plate: ${contract.vehicle_plate}`}
        />

        {/* ✅ MILESTONE 2: Driver Details (only when assigned) */}
        {hasDriver && (
          <DetailSection
            title="Assigned Driver"
            icon={<UserCircle size={18} />}
            primary={contract.driver_name!}
            secondary={contract.driver_phone || "—"}
            tertiary={contract.driver_dl_number ? `DL ${contract.driver_dl_number}` : undefined}
          />
        )}

        {/* Dates */}
        <DetailSection
          title="Rental Period"
          icon={<Calendar size={18} />}
          primary={`${formatDate(contract.start_date)} to ${formatDate(contract.end_date)}`}
          secondary="Agreed rental duration"
        />

        {/* Financials */}
        <DetailSection
          title="Total Amount"
          icon={<Banknote size={18} />}
          primary={`${contract.currency_code} ${Number(contract.total_amount).toLocaleString()}`}
          secondary="Total contract value"
        />
      </div>
    </div>
  );
}

// Reusable detail card — ✅ ALL colors from brand system (public page = always light, theme-immune)
function DetailSection({ 
  title, 
  icon, 
  primary, 
  secondary,
  tertiary 
}: { 
  title: string; 
  icon: React.ReactNode; 
  primary: string; 
  secondary: string;
  tertiary?: string;
}) {
  return (
    <div className="space-y-2 sm:space-y-4">
      {/* ✅ Micro-label: brand ink.subtle (lighter than body text for hierarchy) */}
      <h3 
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: brand.colors.ink.subtle }}
      >
        {title}
      </h3>
      <div className="flex items-start gap-3">
        {/* ✅ Icon chip: warm surface bg + muted icon color */}
        <div 
          className="p-2 rounded-lg shrink-0"
          style={{ 
            background: brand.colors.light.surfaceWarm, 
            color: brand.colors.ink.muted 
          }}
        >
          {icon}
        </div>
        <div>
          {/* ✅ Primary value: brand ink.primary (highest contrast for key data) */}
          <p 
            className="text-sm font-bold"
            style={{ color: brand.colors.ink.primary }}
          >
            {primary}
          </p>
          {/* ✅ Secondary: brand ink.muted (supporting info) */}
          <p 
            className="text-xs"
            style={{ color: brand.colors.ink.muted }}
          >
            {secondary}
          </p>
          {tertiary && (
            <p 
              className="text-xs font-mono"
              style={{ color: brand.colors.ink.muted }}
            >
              {tertiary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

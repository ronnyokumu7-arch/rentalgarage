// src/components/client/[id]/DrivingSection.tsx
"use client";

import { Pencil, Car, CreditCard, Calendar, Info } from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import { ProfileField } from "@/components/profile/ProfileLayout";
import type { Client, DrivingArrangement } from "@/lib/types";

interface DrivingSectionProps {
  client: Client;
  onEdit: () => void;
}

const ARRANGEMENT_LABELS: Record<DrivingArrangement, string> = {
  self_drive: "Self Drive",
  own_driver: "Own Driver",
  chauffeur: "Chauffeur",
};

export default function DrivingSection({ client, onEdit }: DrivingSectionProps) {
  const arrangement = client.driving_arrangement || "self_drive";
  const isSelfDrive = arrangement === "self_drive";

  return (
    <SectionCard title="Driving Details" icon={Car}>
      <div className="flex flex-col">
        <ProfileField
          label="Arrangement"
          value={ARRANGEMENT_LABELS[arrangement]}
          icon={Car}
        />

        {isSelfDrive ? (
          <>
            <ProfileField
              label="License Number"
              value={client.dl_number}
              icon={CreditCard}
              isMono
            />
            <ProfileField
              label="Expiry Date"
              value={
                client.dl_expiry
                  ? new Date(client.dl_expiry).toLocaleDateString()
                  : "Not set"
              }
              icon={Calendar}
            />
            <ProfileField
              label="Issue Date"
              value={
                client.dl_issued_date
                  ? new Date(client.dl_issued_date).toLocaleDateString()
                  : "Not set"
              }
              icon={Calendar}
            />
          </>
        ) : (
          <div className="mt-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
            <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Client driving license is not required for{" "}
              {arrangement === "own_driver" ? "own driver" : "chauffeur"}{" "}
              arrangements.
            </p>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button
            onClick={onEdit}
            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            <Pencil size={12} /> Edit Driving
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

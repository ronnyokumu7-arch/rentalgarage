// src/components/client/[id]/IdentitySection.tsx
"use client";

import {
  User as UserIcon,
  Pencil,
  UserCircle,
  Phone,
  Mail,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import SectionCard from "@/components/ui/SectionCard";
import { ProfileField } from "@/components/profile/ProfileLayout";
import type { Client } from "@/lib/types";

interface IdentitySectionProps {
  client: Client;
  onEdit: () => void;
}

const verificationLabel = (client: Client): string => {
  if (client.verification_status === "under_review") return "Under Review";
  if (client.verification_status === "verified") return "Verified";
  if (client.verification_status === "rejected") return "Rejected";
  if (client.verification_status === "sent") return "Link Sent";
  return "Not Started";
};

export default function IdentitySection({ client, onEdit }: IdentitySectionProps) {
  const displayName =
    [client.first_name, client.last_name].filter(Boolean).join(" ") || "Client";

  return (
    <SectionCard title="Identity & Contact" icon={UserCircle}>
      <div className="flex flex-col">
        <ProfileField label="Full Name" value={displayName} icon={UserIcon} />
        <ProfileField label="Phone Number" value={client.phone} icon={Phone} isMono />
        <ProfileField label="Email Address" value={client.email} icon={Mail} />
        <ProfileField label="ID Number" value={client.id_number} icon={CreditCard} isMono />
        <ProfileField
          label="Verification Status"
          value={verificationLabel(client)}
          icon={ShieldCheck}
        />
        <div className="pt-4 flex justify-end">
          <button
            onClick={onEdit}
            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            <Pencil size={12} /> Edit Identity
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

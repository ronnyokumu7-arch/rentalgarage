// src/components/client/[id]/EmergencyContactSection.tsx
"use client";

import {
  PencilSimple as Pencil,
  Phone,
  User as UserIcon,
} from "@phosphor-icons/react/ssr";
import SectionCard from "@/components/ui/SectionCard";
import { ProfileField } from "@/components/profile/ProfileLayout";
import type { Client } from "@/lib/types";

interface EmergencyContactSectionProps {
  client: Client;
  onEdit: () => void;
}

export default function EmergencyContactSection({
  client,
  onEdit,
}: EmergencyContactSectionProps) {
  return (
    <SectionCard title="Emergency Contact" icon={Phone}>
      <div className="flex flex-col">
        <ProfileField
          label="Name"
          value={client.next_of_kin_name}
          icon={UserIcon}
        />
        <ProfileField
          label="Phone"
          value={client.next_of_kin_phone}
          icon={Phone}
          isMono
        />
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            <Pencil size={12} aria-hidden="true" /> Edit Emergency Contact
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
